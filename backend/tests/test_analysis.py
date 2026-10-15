from concurrent.futures import Future, ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
import json
from threading import Event as Signal

import httpx
import mongomock
import pytest
from fastapi.testclient import TestClient

from app.analysis_schemas import AnalysisResponse
from app.climate.threshold import calculate_threshold, InsufficientBaselineData
from app.config import Settings
from app.database import Database
from app.main import create_app
from app.repositories.base import DatabaseUnavailable
from app.schemas import Selection
from app.services.analysis import AnalysisLimit, AnalysisService
from app.services.weather import WeatherService
from app.services.weather_data import calendar, InvalidWeatherPayload
from app.services.weather_provider import Budget, ProviderUnavailable, ProviderRateLimited, WeatherOperationTimeout, WeatherProvider

NOW = datetime(2026, 10, 15, tzinfo=timezone.utc)


@pytest.fixture
def setup():
    settings = Settings(_env_file=None, mongodb_uri=None, weather_max_retries=0, cold_requests=100, rate_requests=1000)
    db = Database(mongomock.MongoClient(tz_aware=True), "analysis_test", 1000)
    db.ensure_indexes()
    state = {"status": 200, "delta": 0, "clock": 0, "boundary": False, "extension_hot": False, "no_events": False}

    def handler(request):
        if state["status"] != 200:
            return httpx.Response(state["status"])
        year = int(request.url.params["start_date"][:4])
        dates = calendar(year)
        values = [40 + state["delta"] if day[5:] in {"05-01", "05-02", "05-03", "05-04", "05-05"} else 20 for day in dates]
        if state["no_events"]:
            values = [20] * len(dates)
        if state.get("invalid_baseline") and year == 1990:
            values = [None] * len(dates)
        if state["boundary"] and year == 1989:
            values = [40] * len(dates)
        if state["boundary"] and year == 1990:
            values[:2] = [40, 40]
        if state["extension_hot"] and year == 1988:
            values[-1] = 40
        return httpx.Response(200, json={
            "latitude": float(request.url.params["latitude"]), "longitude": float(request.url.params["longitude"]),
            "timezone": "Asia/Kolkata", "utc_offset_seconds": 19800,
            "daily_units": {"time": "iso8601", "temperature_2m_max": "°C"},
            "daily": {"time": dates, "temperature_2m_max": values},
        })

    def sleep(seconds):
        state["clock"] += seconds
    provider = WeatherProvider(settings, transport=httpx.MockTransport(handler))
    weather = WeatherService(db.weather, settings, provider=provider, now=lambda: NOW,
                             budget_factory=lambda: Budget(settings.weather_operation_timeout_seconds,
                                                           clock=lambda: state["clock"], sleep=sleep))
    service = AnalysisService(weather, db.analyses, settings)
    app = create_app(settings)
    with TestClient(app, raise_server_exceptions=False) as client:
        app.state.analysis = service
        yield client, service, db, weather, state, settings
    weather.close()
    db.close()


def test_endpoint_returns_persisted_typed_json_and_reuses_cache(setup, monkeypatch):
    client, service, db, weather, state, settings = setup
    response = client.post("/api/v1/analyses", json={})
    assert response.status_code == 200, response.text
    result = AnalysisResponse.model_validate(response.json())
    assert result.summary.event_count == 31 and result.summary.heatwave_days == 155
    assert result.methodology.threshold_celsius == 20
    assert result.events[0].start_date.isoformat() == "1990-05-01"
    assert result.source.analysis_cache_status == "computed"
    assert weather.provider.request_count == 33
    document = db.db.analyses.find_one({"cache_namespace": "analysis-v1"})
    assert document["result"] == response.json()
    assert '"_id"' not in response.text
    json.dumps(response.json(), allow_nan=False)
    monkeypatch.setattr("app.services.analysis.calculate_threshold", lambda _: pytest.fail("cache hit recalculated threshold"))
    repeated = client.post("/api/v1/analyses", json={})
    assert repeated.status_code == 200
    assert repeated.json()["source"]["analysis_cache_status"] == "hit"
    assert weather.provider.request_count == 33
    assert repeated.json()["summary"] == response.json()["summary"]


def test_source_revision_change_invalidates_and_removes_obsolete_selection_result(setup):
    client, _, db, _, state, _ = setup
    first = client.post("/api/v1/analyses", json={}).json()
    key = db.db.analyses.find_one()["analysis_key"]
    db.db.weather_years.update_many({}, {"$set": {"fetched_at": NOW - timedelta(days=31)}})
    state["delta"] = 1
    second = client.post("/api/v1/analyses", json={})
    assert second.status_code == 200
    assert second.json()["source"]["analysis_cache_status"] == "computed"
    assert second.json()["summary"]["peak_temperature_celsius"] == first["summary"]["peak_temperature_celsius"] + 1
    assert db.db.analyses.find_one()["analysis_key"] != key
    assert db.db.analyses.count_documents({"cache_namespace": "analysis-v1"}) == 1


def test_cache_hit_refreshes_stale_warnings_and_timestamps_without_revision_change(setup, monkeypatch):
    client, _, db, _, state, _ = setup
    first = client.post("/api/v1/analyses", json={}).json()
    monkeypatch.setattr("app.services.analysis.calculate_threshold", lambda _: pytest.fail("unchanged source recalculated"))
    db.db.weather_years.update_many({}, {"$set": {"fetched_at": NOW - timedelta(days=31)}})
    state["status"] = 503
    stale = client.post("/api/v1/analyses", json={})
    assert stale.status_code == 200
    assert stale.json()["source"]["analysis_cache_status"] == "hit"
    assert stale.json()["data_quality"]["warnings"] == ["stale_weather_data"]
    assert all(year["cache_status"] == "stale" for year in stale.json()["source"]["weather_years"])
    state["status"] = 200
    refreshed = client.post("/api/v1/analyses", json={})
    assert refreshed.status_code == 200
    assert refreshed.json()["data_quality"]["warnings"] == []
    assert refreshed.json()["source"]["generated_at"] == first["source"]["generated_at"]
    assert all(year["cache_status"] == "refreshed" for year in refreshed.json()["source"]["weather_years"])


def test_boundary_extension_years_are_rechecked_before_analysis_cache_hit(setup):
    client, _, db, _, state, _ = setup
    state["boundary"] = True
    first = client.post("/api/v1/analyses", json={})
    assert first.status_code == 200
    assert 1988 in [year["year"] for year in first.json()["source"]["weather_years"]]
    assert first.json()["events"][0]["start_date"] == "1989-01-01"
    db.db.weather_years.update_one({"year": 1988}, {"$set": {"fetched_at": NOW - timedelta(days=31)}})
    state["extension_hot"] = True
    second = client.post("/api/v1/analyses", json={})
    assert second.status_code == 200
    assert second.json()["source"]["analysis_cache_status"] == "computed"
    assert second.json()["events"][0]["start_date"] == "1988-12-31"


def test_invalid_cached_schema_recomputes_instead_of_serving_nonfinite_json(setup):
    client, _, db, _, _, _ = setup
    assert client.post("/api/v1/analyses", json={}).status_code == 200
    db.db.analyses.update_one({}, {"$set": {"result.summary.mean_exceedance_celsius": float("nan")}})
    response = client.post("/api/v1/analyses", json={})
    assert response.status_code == 200
    assert response.json()["source"]["analysis_cache_status"] == "computed"
    json.dumps(response.json(), allow_nan=False)


def test_cache_growth_and_old_pipeline_cleanup_are_bounded_and_scoped(setup, monkeypatch):
    client, _, db, _, _, settings = setup
    settings.analysis_max_cache_entries = 2
    db.analyses.save("unrelated", {"keep": True})
    for start, end in [(1990, 1995), (2000, 2005), (2010, 2015)]:
        assert client.post("/api/v1/analyses", json={"start_year": start, "end_year": end}).status_code == 200
    assert db.db.analyses.count_documents({"cache_namespace": "analysis-v1"}) == 2
    assert db.analyses.get("unrelated")["keep"]
    monkeypatch.setattr("app.services.analysis.PIPELINE_SIGNATURE", "new-test-pipeline")
    assert client.post("/api/v1/analyses", json={}).status_code == 200
    assert db.db.analyses.count_documents({"cache_namespace": "analysis-v1"}) == 1
    assert db.analyses.get("unrelated")["keep"]


@pytest.mark.parametrize("field,value", [("analysis_max_events", 1), ("analysis_max_response_bytes", 1000)])
def test_output_bounds_fail_safely_before_saving(setup, field, value):
    client, _, db, _, _, settings = setup
    setattr(settings, field, value)
    response = client.post("/api/v1/analyses", json={})
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "analysis_output_limit"
    assert db.db.analyses.count_documents({}) == 0


def test_null_metrics_and_iso_dates_serialize_correctly(setup):
    client, _, _, _, state, _ = setup
    state["no_events"] = True
    response = client.post("/api/v1/analyses", json={"start_year": 2020, "end_year": 2020})
    assert response.status_code == 200
    assert response.json()["summary"]["mean_duration_days"] is None
    assert response.json()["summary"]["peak_temperature_celsius"] is None
    assert response.json()["trend"]["regression"]["slope_events_per_decade"] is None
    assert response.json()["events"] == []


def test_identical_concurrent_requests_share_one_computation(setup, monkeypatch):
    _, service, _, _, _, _ = setup
    entered, release, waiting = Signal(), Signal(), Signal()
    original = service._execute
    calls = []
    class TrackingFuture(Future):
        def result(self, timeout=None):
            waiting.set()
            return super().result(timeout)
    monkeypatch.setattr("app.services.analysis.Future", TrackingFuture)
    def execute(*args):
        calls.append(1)
        entered.set()
        assert release.wait(5)
        return original(*args)
    monkeypatch.setattr(service, "_execute", execute)
    with ThreadPoolExecutor(max_workers=2) as pool:
        first = pool.submit(service.analyze, Selection())
        assert entered.wait(5)
        second = pool.submit(service.analyze, Selection())
        assert waiting.wait(5)
        release.set()
        assert first.result(20)["source"]["analysis_cache_status"] == "computed"
        assert second.result(20)["source"]["analysis_cache_status"] == "coalesced"
    assert len(calls) == 1 and service._inflight == {}


def test_distinct_pending_work_is_bounded_and_failure_releases_slot(setup, monkeypatch):
    _, service, _, _, _, settings = setup
    settings.analysis_max_pending = 1
    entered, release = Signal(), Signal()
    def execute(*args):
        entered.set()
        assert release.wait(5)
        raise ProviderUnavailable()
    monkeypatch.setattr(service, "_execute", execute)
    with ThreadPoolExecutor(max_workers=1) as pool:
        first = pool.submit(service.analyze, Selection())
        assert entered.wait(5)
        with pytest.raises(AnalysisLimit):
            service.analyze(Selection(region_id="mumbai"))
        release.set()
        with pytest.raises(ProviderUnavailable):
            first.result(5)
    assert service._inflight == {}


@pytest.mark.parametrize("payload", [
    {"start_year": "1990"}, {"start_year": True}, {"end_year": 2026},
    {"region_id": "secret-canary"}, {"hazard": "flood"}, {"start_year": 2021, "end_year": 2020},
    {"secret-canary": "mongodb://user:password@host"},
])
def test_invalid_http_inputs_use_safe_common_envelope(setup, payload):
    client, _, _, weather, _, _ = setup
    response = client.post("/api/v1/analyses", json=payload)
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "invalid_input"
    assert "secret-canary" not in response.text and "password" not in response.text
    assert weather.provider.request_count == 0


@pytest.mark.parametrize("exception,status,code", [
    (DatabaseUnavailable, 503, "database_unavailable"), (ProviderUnavailable, 502, "provider_unavailable"),
    (ProviderRateLimited, 429, "provider_rate_limited"), (WeatherOperationTimeout, 504, "operation_timeout"),
    (InvalidWeatherPayload, 502, "invalid_weather_data"), (AnalysisLimit, 503, "analysis_busy"),
])
def test_failure_codes_are_distinct_and_safe(setup, monkeypatch, exception, status, code):
    client, service, _, _, _, _ = setup
    def fail(_, **kwargs):
        raise exception()
    monkeypatch.setattr(service, "analyze", fail)
    response = client.post("/api/v1/analyses", json={})
    assert response.status_code == status
    assert response.json()["error"]["code"] == code


def test_insufficient_baseline_malformed_json_method_errors_and_openapi(setup, monkeypatch):
    client, service, _, _, _, _ = setup
    def fail(_, **kwargs):
        calculate_threshold([])
    monkeypatch.setattr(service, "analyze", fail)
    response = client.post("/api/v1/analyses", json={})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "insufficient_baseline_data"
    malformed = client.post("/api/v1/analyses", content=b"{", headers={"Content-Type": "application/json"})
    assert malformed.status_code == 422 and malformed.json()["error"]["code"] == "invalid_input"
    method = client.get("/api/v1/analyses")
    assert method.status_code == 405 and method.headers["allow"] == "POST"
    schema = client.get("/openapi.json").json()
    assert schema["paths"]["/api/v1/analyses"]["post"]["responses"]["200"]["content"]["application/json"]["schema"]["$ref"].endswith("AnalysisResponse")


def test_cache_hits_prune_after_configuration_limit_is_lowered(setup):
    client, _, db, _, _, settings = setup
    for start, end in [(1990, 1995), (2000, 2005), (2010, 2015)]:
        assert client.post("/api/v1/analyses", json={"start_year": start, "end_year": end}).status_code == 200
    settings.analysis_max_cache_entries = 1
    response = client.post("/api/v1/analyses", json={"start_year": 1990, "end_year": 1995})
    assert response.status_code == 200 and response.json()["source"]["analysis_cache_status"] == "hit"
    assert db.db.analyses.count_documents({"cache_namespace": "analysis-v1"}) == 1


def test_finite_cached_payload_corruption_is_recomputed(setup):
    client, _, db, _, _, _ = setup
    assert client.post("/api/v1/analyses", json={}).status_code == 200
    db.db.analyses.update_one({}, {"$set": {"result.summary.event_count": 999}})
    response = client.post("/api/v1/analyses", json={})
    assert response.status_code == 200
    assert response.json()["summary"]["event_count"] == 31
    assert response.json()["source"]["analysis_cache_status"] == "computed"


def test_actual_pipeline_rejects_insufficient_baseline_and_configured_year_cap(setup):
    client, _, db, weather, state, settings = setup
    settings.weather_max_years = 31
    response = client.post("/api/v1/analyses", json={})
    assert response.status_code == 503 and response.json()["error"]["code"] == "weather_context_limit"
    assert weather.provider.request_count == 0
    settings.weather_max_years = 40
    state["invalid_baseline"] = True
    response = client.post("/api/v1/analyses", json={})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "insufficient_baseline_data"
    assert db.db.analyses.count_documents({}) == 0
