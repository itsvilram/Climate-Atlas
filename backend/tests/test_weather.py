from copy import deepcopy
from datetime import date, datetime, timedelta, timezone
import json

import httpx
import mongomock
import pytest

from app.config import Settings
from app.database import Database
from app.regions import REGIONS
from app.schemas import Selection
from app.services.weather import WeatherService, latest_complete_year, required_years
from app.services.weather_data import InvalidWeatherPayload, calendar, identity_for, normalize, revision_of, valid_cached
from app.services.weather_provider import ARCHIVE_URL, Budget, ProviderRateLimited, ProviderUnavailable, WeatherOperationTimeout, WeatherProvider
from app.services.events import detect_with_context

NOW = datetime(2026, 10, 15, tzinfo=timezone.utc)
REGION = REGIONS[0]


class FakeClock:
    def __init__(self):
        self.value = 0
        self.waits = []

    def clock(self):
        return self.value

    def sleep(self, delay):
        self.waits.append(delay)
        self.value += delay


def payload(year=2020):
    dates = calendar(year)
    return {"latitude": 28.5, "longitude": 77.25, "timezone": "Asia/Kolkata", "utc_offset_seconds": 19800,
            "daily_units": {"time": "iso8601", "temperature_2m_max": "°C"},
            "daily": {"time": dates, "temperature_2m_max": [30.0] * len(dates)}}


def settings(**kwargs):
    return Settings(_env_file=None, mongodb_uri=None, **kwargs)


@pytest.fixture
def database():
    db = Database(mongomock.MongoClient(tz_aware=True), "weather_test", 1000)
    db.ensure_indexes()
    yield db
    db.close()


def setup_service(database, handler=None, **options):
    clock = FakeClock()
    def default_handler(request):
        year = int(request.url.params["start_date"][:4])
        return httpx.Response(200, json=payload(year))
    config = settings(**options)
    provider = WeatherProvider(config, transport=httpx.MockTransport(handler or default_handler))
    service = WeatherService(database.weather, config, provider=provider, now=lambda: NOW,
                             budget_factory=lambda: Budget(config.weather_operation_timeout_seconds, clock=clock.clock, sleep=clock.sleep))
    return service, clock


def test_normalization_preserves_leap_day_gaps_nulls_and_invalid_values():
    raw = payload()
    raw["daily"]["time"].pop(0)
    raw["daily"]["temperature_2m_max"].pop(0)
    raw["daily"]["temperature_2m_max"][:7] = [None, float("nan"), float("inf"), True, "30", -91, 66]
    raw["daily"]["time"].reverse()
    raw["daily"]["temperature_2m_max"].reverse()
    record = normalize(raw, REGION, 2020, NOW)
    assert len(record["dates"]) == 366
    assert "2020-02-29" in record["dates"]
    assert record["temperature_2m_max"][:8] == [None] * 8
    assert record["quality"]["valid_days"] == 358
    assert record["quality"]["coverage"] == 358 / 366
    assert record["quality"]["flags"][0] == {"date": "2020-01-01", "reason": "missing_date"}
    assert record["quality"]["flags"][-1]["reason"] == "implausible_temperature"
    assert valid_cached(record, REGION, 2020)
    json.dumps(record, default=str, allow_nan=False)


@pytest.mark.parametrize("mutate", [
    lambda p: p["daily"]["temperature_2m_max"].pop(),
    lambda p: p["daily"]["time"].__setitem__(1, "2020-01-01"),
    lambda p: p["daily"]["time"].__setitem__(0, "2020-02-30"),
    lambda p: p["daily"]["time"].__setitem__(0, "2020-1-1"),
    lambda p: p["daily"]["time"].__setitem__(0, "2019-12-31"),
    lambda p: p["daily_units"].__setitem__("temperature_2m_max", "°F"),
    lambda p: p.__setitem__("timezone", "UTC"),
    lambda p: p.__setitem__("utc_offset_seconds", 0),
    lambda p: p.__setitem__("latitude", float("inf")),
    lambda p: p.__setitem__("longitude", 0),
    lambda p: p.__setitem__("daily", {"time": [], "temperature_2m_max": []}),
])
def test_malformed_payload_rejected(mutate):
    raw = payload()
    mutate(raw)
    with pytest.raises(InvalidWeatherPayload):
        normalize(raw, REGION, 2020, NOW)


def test_timezone_alias_and_revision_stability():
    raw = payload()
    raw["timezone"] = "Asia/Calcutta"
    first = normalize(raw, REGION, 2020, NOW)
    second = normalize(raw, REGION, 2020, NOW + timedelta(days=1))
    assert first["revision"] == second["revision"]
    raw["daily"]["temperature_2m_max"][0] = 31
    assert normalize(raw, REGION, 2020, NOW)["revision"] != first["revision"]


def test_selection_plan_and_source_boundary():
    selection = Selection(start_year=2024, end_year=2025)
    assert required_years(selection, 2025) == list(range(1990, 2021)) + [2023, 2024, 2025]
    assert required_years(Selection(), 2025) == list(range(1989, 2022))
    assert latest_complete_year(date(2026, 1, 3)) == 2024
    assert latest_complete_year(date(2026, 1, 6)) == 2025


def test_overlap_reads_stored_records_and_only_fetches_missing_years(database):
    service, clock = setup_service(database)
    first = service.operation("delhi").load_selection(Selection())
    assert service.provider.request_count == 33
    assert len(first) == 33
    assert first[2020].document == database.weather.get(identity_for(REGION, 2020))
    second = service.operation("delhi").load_selection(Selection(start_year=2000, end_year=2021))
    assert service.provider.request_count == 34
    assert second[2020].cache_status == "hit"
    assert second[2022].cache_status == "fetched"
    assert database.db.weather_years.count_documents({}) == 34
    assert all(wait >= 0 for wait in clock.waits)
    service.close()


@pytest.mark.parametrize("age,status,fetches", [(29, "hit", 0), (30, "refreshed", 1), (31, "refreshed", 1)])
def test_freshness_boundary(database, age, status, fetches):
    record = normalize(payload(), REGION, 2020, NOW - timedelta(days=age))
    identity = identity_for(REGION, 2020)
    database.weather.save(identity, {k:v for k,v in record.items() if k not in identity.model_dump()})
    service, _ = setup_service(database)
    loaded = service.operation("delhi").load_year(2020)
    assert loaded.cache_status == status
    assert loaded.document["revision"] == record["revision"]
    assert service.provider.request_count == fetches
    service.close()


def test_failed_refresh_preserves_stale_document_and_warns(database):
    record = normalize(payload(), REGION, 2020, NOW - timedelta(days=31))
    database.db.weather_years.insert_one(deepcopy(record))
    service, _ = setup_service(database, lambda r: httpx.Response(503), weather_max_retries=1)
    result = service.operation("delhi").load_year(2020)
    assert result.cache_status == "stale"
    assert result.warnings == ("stale_weather_data",)
    assert result.document["fetched_at"] == record["fetched_at"]
    assert result.document["revision"] == record["revision"]
    assert service.provider.request_count == 2
    service.close()


def test_low_coverage_stale_record_not_used(database):
    raw = payload()
    raw["daily"]["temperature_2m_max"][:100] = [None] * 100
    record = normalize(raw, REGION, 2020, NOW - timedelta(days=31))
    database.db.weather_years.insert_one(record)
    service, _ = setup_service(database, lambda r: httpx.Response(503), weather_max_retries=0)
    with pytest.raises(ProviderUnavailable):
        service.operation("delhi").load_year(2020)
    service.close()


def test_bad_payload_is_never_saved(database):
    service, _ = setup_service(database, lambda r: httpx.Response(200, json={"secret": "canary"}))
    with pytest.raises(InvalidWeatherPayload):
        service.operation("delhi").load_year(2020)
    assert database.db.weather_years.count_documents({}) == 0
    service.close()


def test_cached_corruption_cannot_pass_as_fresh(database):
    record = normalize(payload(), REGION, 2020, NOW)
    record["temperature_2m_max"][0] = 40
    database.db.weather_years.insert_one(record)
    service, _ = setup_service(database)
    loaded = service.operation("delhi").load_year(2020)
    assert loaded.cache_status == "fetched"
    assert loaded.document["temperature_2m_max"][0] == 30
    service.close()


def test_fixed_provider_request_contract(database):
    def handler(request):
        assert str(request.url).split("?")[0] == ARCHIVE_URL
        assert request.url.params["models"] == "era5"
        assert request.url.params["temperature_unit"] == "celsius"
        assert request.url.params["timezone"] == "Asia/Kolkata"
        assert request.url.params["daily"] == "temperature_2m_max"
        assert request.url.params["end_date"] == "2020-12-31"
        return httpx.Response(200, json=payload())
    service, _ = setup_service(database, handler)
    service.operation("delhi").load_year(2020)
    service.close()


@pytest.mark.parametrize("status,attempts,exception", [(429, 3, ProviderRateLimited), (503, 3, ProviderUnavailable), (400, 1, ProviderUnavailable), (302, 1, ProviderUnavailable)])
def test_status_retries_are_finite(database, status, attempts, exception):
    service, _ = setup_service(database, lambda r: httpx.Response(status))
    with pytest.raises(exception):
        service.operation("delhi").load_year(2020)
    assert service.provider.request_count == attempts
    service.close()


def test_retry_after_and_operation_timeout(database):
    service, clock = setup_service(database, lambda r: httpx.Response(429, headers={"Retry-After": "8"}), weather_max_retries=1)
    with pytest.raises(ProviderRateLimited):
        service.operation("delhi").load_year(2020)
    assert 8 in clock.waits
    service.close()
    service, clock = setup_service(database, lambda r: httpx.Response(429, headers={"Retry-After": "999999"}), weather_operation_timeout_seconds=10)
    with pytest.raises(WeatherOperationTimeout):
        service.operation("delhi").load_year(2020)
    assert service.provider.request_count == 1
    assert not clock.waits
    service.close()


def test_transport_timeout_retries(database):
    def handler(request):
        raise httpx.ReadTimeout("secret-canary")
    service, _ = setup_service(database, handler, weather_max_retries=1)
    with pytest.raises(ProviderUnavailable) as error:
        service.operation("delhi").load_year(2020)
    assert "secret-canary" not in str(error.value)
    assert service.provider.request_count == 2
    service.close()


def test_response_size_and_invalid_json_are_bounded(database):
    for content in [b"{" * 256001, b"not-json"]:
        service, _ = setup_service(database, lambda r: httpx.Response(200, content=content))
        with pytest.raises(InvalidWeatherPayload):
            service.operation("delhi").load_year(2020)
        assert service.provider.request_count == 1
        service.close()


def test_boundary_extensions_share_budget_and_stop_at_limits(database):
    service, clock = setup_service(database, weather_max_years=2)
    operation = service.operation("delhi")
    operation.load_year(2024)
    assert operation.extend(1).document["year"] == 2025
    assert operation.extend(1) is None
    assert operation.extend(-1) is None
    clock.value = 241
    with pytest.raises(WeatherOperationTimeout):
        operation.load_year(2024)
    service.close()


def test_changed_revision_and_full_year_range_limit(database):
    record = normalize(payload(), REGION, 2020, NOW - timedelta(days=31))
    database.db.weather_years.insert_one(record)
    raw = payload()
    raw["daily"]["temperature_2m_max"][0] = 31
    service, _ = setup_service(database, lambda r: httpx.Response(200, json=raw))
    assert service.operation("delhi").load_year(2020).document["revision"] != record["revision"]
    assert len(required_years(Selection(start_year=1990, end_year=2025), 2025)) == 37
    with pytest.raises(ValueError):
        service.operation("unknown")
    service.close()


def test_slow_incremental_stream_cannot_bypass_operation_deadline(database):
    service, clock = setup_service(database, weather_operation_timeout_seconds=2)

    class SlowStream(httpx.SyncByteStream):
        def __iter__(self):
            for _ in range(10):
                clock.value += 1
                yield b" "

    service.provider.close()
    service.provider.client = httpx.Client(transport=httpx.MockTransport(
        lambda request: httpx.Response(200, stream=SlowStream())))
    with pytest.raises(WeatherOperationTimeout):
        service.operation("delhi").load_year(2020)
    assert clock.value == 2
    assert database.db.weather_years.count_documents({}) == 0
    service.close()


def test_future_timestamp_cannot_hide_failed_refresh(database):
    database.db.weather_years.insert_one(normalize(payload(), REGION, 2020, NOW + timedelta(days=1)))
    service, _ = setup_service(database, lambda r: httpx.Response(503), weather_max_retries=0)
    with pytest.raises(ProviderUnavailable):
        service.operation("delhi").load_year(2020)
    assert service.provider.request_count == 1
    service.close()


def test_invalid_refresh_can_only_fall_back_to_adequate_stored_data(database):
    database.db.weather_years.insert_one(normalize(payload(), REGION, 2020, NOW - timedelta(days=31)))
    service, _ = setup_service(database, lambda r: httpx.Response(200, json={"daily": {}}))
    loaded = service.operation("delhi").load_year(2020)
    assert loaded.cache_status == "stale"
    assert loaded.warnings
    assert loaded.document["quality"]["coverage"] == 1
    service.close()


def test_cached_quality_is_validated_even_with_matching_hash():
    record = normalize(payload(), REGION, 2020, NOW)
    record["quality"]["valid_days"] = 1
    record["revision"] = revision_of(record)
    assert not valid_cached(record, REGION, 2020)


def test_plausibility_bounds_are_inclusive_and_huge_numbers_are_flagged():
    raw = payload()
    raw["daily"]["temperature_2m_max"][:3] = [-90, 65, 10**1000]
    result = normalize(raw, REGION, 2020, NOW)
    assert result["temperature_2m_max"][:3] == [-90.0, 65.0, None]
    assert result["quality"]["flags"] == [{"date": "2020-01-03", "reason": "invalid_value"}]


def test_terminal_rate_limit_preserves_cooldown_for_next_year(database):
    service, clock = setup_service(database, lambda r: httpx.Response(429, headers={"Retry-After": "9999"}), weather_max_retries=0)
    with pytest.raises(ProviderRateLimited):
        service.operation("delhi").load_year(2020)
    with pytest.raises(WeatherOperationTimeout):
        service.operation("delhi").load_year(2021)
    assert service.provider.request_count == 1
    assert clock.waits == []
    service.close()


@pytest.mark.parametrize("year_cap,seconds,complete,warning", [
    (40, 240, True, None), (34, 240, False, "context_source_or_year_limit"),
    (40, 100, False, "context_time_limit"),
])
def test_event_coordinator_uses_real_weather_operation_anchor_and_limits(database, year_cap, seconds, complete, warning):
    def handler(request):
        year = int(request.url.params["start_date"][:4])
        raw = payload(year)
        raw["daily"]["temperature_2m_max"] = [
            40 if year == 2023 or day in {"2024-01-01", "2024-01-02"} else 20
            for day in raw["daily"]["time"]
        ]
        return httpx.Response(200, json=raw)

    service, _ = setup_service(database, handler, weather_max_years=year_cap,
                               weather_operation_timeout_seconds=seconds)
    operation = service.operation("delhi")
    result = detect_with_context(operation, Selection(start_year=2024, end_year=2024), 30)
    event, = result.events
    assert event.complete is complete
    assert event.started_in_selection is False
    if complete:
        assert event.duration_days == 367
        assert 2022 in operation.years and 1989 not in operation.years
        assert result.incomplete_years == ()
        assert service.provider.request_count == 35
    else:
        assert event.duration_days is None
        assert result.incomplete_years == (2024,)
        assert warning in result.warnings
        assert service.provider.request_count == 34
    service.close()


def test_boundary_extension_requires_loaded_anchor_and_direction(database):
    service, _ = setup_service(database)
    operation = service.operation("delhi")
    operation.load_year(2020)
    with pytest.raises(ValueError, match="anchor"):
        operation.extend(-1, from_year=1990)
    with pytest.raises(ValueError):
        operation.extend(True, from_year=2020)
    assert service.provider.request_count == 1
    service.close()
