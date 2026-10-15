"""Opt-in real ASGI POST smoke check; persists genuine weather/analysis in Atlas."""
import time

from fastapi.testclient import TestClient

from .analysis_schemas import AnalysisResponse
from .config import Settings
from .main import create_app
from .services.analysis import PIPELINE_SIGNATURE
from .verify_database import failure_hint


def main() -> int:
    try:
        settings = Settings()
        if settings.mongodb_uri is None:
            print("NOT RUN: configure MONGODB_URI in backend/.env first.")
            return 2
        with TestClient(create_app(settings), raise_server_exceptions=False) as client:
            started = time.monotonic()
            response = client.post("/api/v1/analyses", json={})
            if response.status_code != 200:
                print(f"FAIL: first analysis request returned HTTP {response.status_code}. No response body or credentials printed.")
                return 1
            first = AnalysisResponse.model_validate(response.json())
            print(f"Default Delhi analysis: HTTP 200; {len(first.annual_metrics)} years; {first.summary.event_count} event starts; {time.monotonic() - started:.2f} seconds.")
            service = client.app.state.analysis
            calls = service.weather.provider.request_count
            generated = first.source.generated_at
            repeated = client.post("/api/v1/analyses", json={})
            assert repeated.status_code == 200
            second = AnalysisResponse.model_validate(repeated.json())
            assert second.source.analysis_cache_status == "hit"
            assert second.source.generated_at == generated
            assert service.weather.provider.request_count == calls
            stored = service.repository.collection.find_one({
                "cache_namespace": "analysis-v1", "pipeline_signature": PIPELINE_SIGNATURE,
                "result.region.id": "delhi", "result.period.start_year": 1990, "result.period.end_year": 2020,
            }, {"_id": 0})
            assert stored is not None and stored["result"] == repeated.json()
            print("PASS: real POST response matches saved Atlas result; repeat is an analysis hit with zero additional provider requests.")
            print("Weather data by Open-Meteo (https://open-meteo.com/), ERA5; CC BY 4.0. No deployment performed.")
        return 0
    except Exception as error:
        print("FAIL: analysis verification failed. " + failure_hint(error) + " No connection details printed.")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
