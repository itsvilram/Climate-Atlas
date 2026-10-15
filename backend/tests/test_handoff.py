"""Validate the checked-in real snapshot as a frontend contract, without network."""
import json
from pathlib import Path

import pytest

from app.analysis_schemas import AnalysisResponse
from app import run


def test_real_snapshot_contract_and_independent_event_evidence():
    fixtures = Path(__file__).resolve().parents[1] / "fixtures"
    response = AnalysisResponse.model_validate_json((fixtures / "delhi-1990-2020.json").read_text())
    evidence = json.loads((fixtures / "event-audit.json").read_text())
    assert response.methodology.threshold_celsius == evidence["threshold_celsius"]
    assert response.methodology.baseline_quality.valid_days == evidence["baseline_valid_days"]
    assert evidence["repeat_additional_provider_requests"] == 0
    for sample in evidence["samples"]:
        event = next(e for e in response.events if str(e.start_date) == sample["start_date"])
        assert str(event.end_date) == sample["end_date"]
        values = sample["daily_max_celsius"]
        assert event.duration_days == len(values) >= 3
        assert all(v > evidence["threshold_celsius"] for v in values)
        assert event.peak_temperature_celsius == max(values)
        assert event.mean_exceedance_celsius == pytest.approx(sample["mean_exceedance_celsius"])
    contract = json.loads((fixtures / "openapi.json").read_text())
    assert contract["components"]["schemas"]["AnalysisResponse"]["required"] == list(AnalysisResponse.model_fields)


def test_deployment_entrypoint_preserves_single_process_proxy_policy(monkeypatch):
    captured = {}
    monkeypatch.setenv("PORT", "8123")
    monkeypatch.setattr(run.uvicorn, "run", lambda app, **kwargs: captured.update(app=app, **kwargs))
    run.main()
    assert captured["port"] == 8123
    assert captured["workers"] == 1
    assert captured["proxy_headers"] is False
    assert captured["access_log"] is False
