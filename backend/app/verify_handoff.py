"""Opt-in Atlas handoff capture. Exports only the public contract and weather evidence."""
import json
import math
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

from fastapi.testclient import TestClient

from .analysis_schemas import AnalysisResponse
from .config import Settings
from .main import create_app
from .services.weather_data import identity_for
from .verify_database import failure_hint


def audit(response: AnalysisResponse, records: dict[int, dict]) -> dict:
    """Independent sorted interpolation and direct calendar checks, without climate helpers."""
    daily = {}
    for year, record in records.items():
        assert year == record["year"]
        assert len(record["dates"]) == len(record["temperature_2m_max"])
        for day, value in zip(record["dates"], record["temperature_2m_max"]):
            assert day not in daily
            daily[day] = value
    values = sorted(v for day, v in daily.items()
                    if 1990 <= date.fromisoformat(day).year <= 2020 and v is not None)
    assert len(values) == response.methodology.baseline_quality.valid_days
    position = (len(values) - 1) * 0.95
    lower = math.floor(position)
    threshold = values[lower] + (values[math.ceil(position)] - values[lower]) * (position - lower)
    assert math.isclose(threshold, response.methodology.threshold_celsius, abs_tol=1e-12)
    complete = [event for event in response.events if event.eligible_for_complete_metrics]
    assert complete
    samples = []
    for index in sorted({0, len(complete) // 2, len(complete) - 1}):
        event = complete[index]
        assert event.start_date is not None and event.end_date is not None
        days = [event.start_date + timedelta(days=i)
                for i in range((event.end_date - event.start_date).days + 1)]
        temperatures = [daily[day.isoformat()] for day in days]
        assert len(days) >= 3 and len(days) == event.duration_days
        assert all(value is not None and value > threshold for value in temperatures)
        before = daily[(days[0] - timedelta(days=1)).isoformat()]
        after = daily[(days[-1] + timedelta(days=1)).isoformat()]
        assert before is None or before <= threshold
        assert after is None or after <= threshold
        assert math.isclose(max(temperatures), event.peak_temperature_celsius, abs_tol=1e-12)
        mean = sum(value - threshold for value in temperatures) / len(temperatures)
        assert math.isclose(mean, event.mean_exceedance_celsius, abs_tol=1e-12)
        samples.append({"start_date": days[0].isoformat(), "end_date": days[-1].isoformat(),
                        "daily_max_celsius": temperatures, "preceding_day_celsius": before,
                        "following_day_celsius": after, "mean_exceedance_celsius": mean})
    return {"threshold_celsius": threshold, "baseline_valid_days": len(values), "samples": samples}


def main() -> int:
    try:
        settings = Settings()
        if settings.mongodb_uri is None:
            print("NOT RUN: configure MONGODB_URI locally.")
            return 2
        with TestClient(create_app(settings), raise_server_exceptions=False) as client:
            first = client.post("/api/v1/analyses", json={})
            assert first.status_code == 200
            initial = AnalysisResponse.model_validate(first.json())
            service = client.app.state.analysis
            calls = service.weather.provider.request_count
            repeated = client.post("/api/v1/analyses", json={})
            assert repeated.status_code == 200
            response = AnalysisResponse.model_validate(repeated.json())
            assert response.source.analysis_cache_status == "hit"
            assert response.source.generated_at == initial.source.generated_at
            assert service.weather.provider.request_count == calls
            records = {}
            for source in response.source.weather_years:
                record = service.weather.repository.get(identity_for(response.region, source.year))
                assert record is not None and record["revision"] == source.revision
                records[source.year] = record
            evidence = audit(response, records)
            evidence.update({"captured_at": datetime.now(timezone.utc).isoformat(),
                             "origin": "Real local ASGI API backed by Atlas and Open-Meteo ERA5; not deployed",
                             "repeat_additional_provider_requests": 0,
                             "source": response.source.model_dump(mode="json")})
            artifacts = Path(__file__).resolve().parents[1] / "fixtures"
            artifacts.mkdir(exist_ok=True)
            for name, body in (("delhi-1990-2020.json", repeated.json()),
                               ("event-audit.json", evidence), ("openapi.json", client.app.openapi())):
                (artifacts / name).write_text(json.dumps(body, indent=2, allow_nan=False) + "\n", encoding="utf-8")
            print("PASS: real response captured; repeat cache hit without provider calls; independent threshold and three event audits pass.")
        return 0
    except Exception as error:
        print("FAIL: handoff verification. " + failure_hint(error) + " No connection details printed.")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
