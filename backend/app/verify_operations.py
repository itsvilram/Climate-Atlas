"""Opt-in cold-city timing under production admission/quota controls; no deploy."""
import time

from fastapi.testclient import TestClient

from .analysis_schemas import AnalysisResponse
from .config import Settings
from .main import create_app
from .regions import REGIONS, REGION_COORDINATE_VERSION
from .schemas import Selection
from .services.weather import latest_complete_year, required_years
from .services.weather_data import MODEL, SCHEMA_VERSION
from .verify_database import failure_hint


def main() -> int:
    try:
        settings = Settings()
        if settings.mongodb_uri is None:
            print("NOT RUN: configure MONGODB_URI locally first.", flush=True)
            return 2
        with TestClient(create_app(settings), raise_server_exceptions=False) as client:
            service = client.app.state.analysis
            region = None
            for candidate in REGIONS[1:]:
                selection = Selection(region_id=candidate.id)
                years = required_years(selection, latest_complete_year(service.weather.now().date()))
                count = client.app.state.database.db.weather_years.count_documents({
                    "region_id": candidate.id, "model": MODEL, "schema_version": SCHEMA_VERSION,
                    "coordinate_version": REGION_COORDINATE_VERSION, "year": {"$in": years},
                })
                if count < len(years):
                    region = candidate
                    break
            if region is None:
                print("NOT COLD: all alternate-city contexts already exist; no records were deleted to force a cold run.", flush=True)
                return 2
            print(f"Measuring cold {region.name} request; execution budget {settings.weather_operation_timeout_seconds:g} seconds.", flush=True)
            calls = service.weather.provider.request_count
            started = time.monotonic()
            first = client.post("/api/v1/analyses", json={"region_id": region.id})
            elapsed = time.monotonic() - started
            if first.status_code != 200:
                print(f"FAIL: cold request returned HTTP {first.status_code} after {elapsed:.2f} seconds. No body/credentials printed.", flush=True)
                return 1
            result = AnalysisResponse.model_validate(first.json())
            assert result.source.analysis_cache_status == "computed"
            assert service.weather.provider.request_count > calls
            assert elapsed < settings.weather_operation_timeout_seconds
            print(f"Cold {region.name}: HTTP 200 in {elapsed:.2f} seconds; provider attempts {service.weather.provider.request_count - calls}; within execution budget.", flush=True)
            calls = service.weather.provider.request_count
            started = time.monotonic()
            repeat = client.post("/api/v1/analyses", json={"region_id": region.id})
            assert repeat.status_code == 200
            assert repeat.json()["source"]["analysis_cache_status"] == "hit"
            assert service.weather.provider.request_count == calls
            print(f"Warm repeat: HTTP 200 in {time.monotonic() - started:.2f} seconds; zero provider attempts.", flush=True)
            print("PASS: retained synchronous contract meets the selected local execution budget. Hosting compatibility and deployment remain unverified.", flush=True)
            return 0
    except Exception as error:
        print("FAIL: operational verification failed. " + failure_hint(error) + " No connection details printed.", flush=True)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
