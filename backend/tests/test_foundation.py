import json
import subprocess
import socket
import sys
import time
from urllib.request import urlopen
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.config import Settings
from app.main import create_app
from app.schemas import RegionId, RegionsResponse, Selection
from typing import get_args


@pytest.fixture
def client():
    with TestClient(create_app(Settings(_env_file=None, allowed_origins=[], mongodb_uri=None))) as instance:
        yield instance


def test_health_and_regions(client):
    assert client.get("/api/v1/health").json() == {"status": "ok"}
    response = client.get("/api/v1/regions")
    assert response.status_code == 200
    regions = RegionsResponse.model_validate(response.json())
    assert tuple(region.id for region in regions.regions) == get_args(RegionId)
    assert regions.defaults.model_dump() == {
        "region_id": "delhi", "start_year": 1990, "end_year": 2020, "hazard": "heatwave"
    }
    assert regions.supported_years.model_dump() == {"min": 1990, "max": 2025}
    for region in regions.regions:
        assert -90 <= region.latitude <= 90
        assert -180 <= region.longitude <= 180
        assert region.timezone == "Asia/Kolkata"


@pytest.mark.parametrize("changes", [
    {"start_year": 1989}, {"end_year": 2026},
    {"start_year": 2021, "end_year": 2020},
    {"region_id": "unknown"}, {"hazard": "flood"},
    {"start_year": "1990"}, {"end_year": 2020.0},
    {"start_year": True}, {"end_year": None}, {"extra": "value"},
])
def test_invalid_selections_fail_in_python_and_json(changes):
    for validate, data in [
        (Selection.model_validate, changes),
        (Selection.model_validate_json, json.dumps(changes)),
    ]:
        with pytest.raises(ValidationError):
            validate(data)


def test_valid_full_range_and_single_year():
    assert Selection(start_year=1990, end_year=2025).end_year == 2025
    assert Selection(start_year=2025, end_year=2025).start_year == 2025


def test_errors_are_safe_and_validation_handler_is_reusable():
    app = create_app(Settings(_env_file=None, allowed_origins=[], mongodb_uri=None))

    # Test-only route exercises the future input contract without adding an API.
    @app.post("/test-selection")
    def selection(value: Selection):
        return value

    @app.get("/test-failure")
    def failure():
        raise RuntimeError("secret-canary")

    with TestClient(app, raise_server_exceptions=False) as client:
        response = client.post("/test-selection", json={"region_id": "secret-canary"})
        assert response.status_code == 422
        assert response.json()["error"]["code"] == "invalid_input"
        assert response.json()["error"]["details"][0]["field"] == "body.region_id"
        assert "secret-canary" not in response.text
        response = client.get("/test-failure")
        assert response.status_code == 500
        assert "secret-canary" not in response.text
        response = client.get("/missing")
        assert response.status_code == 404
        assert response.json()["error"]["code"] == "http_error"


def test_analysis_endpoint_requires_database(client):
    assert client.post("/api/v1/analyses", json={}).status_code == 503


def test_cors_only_allows_configured_origin():
    app = create_app(Settings(_env_file=None, allowed_origins=["http://localhost:5173"], mongodb_uri=None))
    with TestClient(app) as client:
        for origin, expected in [("http://localhost:5173", 200), ("https://untrusted.example", 400)]:
            response = client.options("/api/v1/regions", headers={
                "Origin": origin, "Access-Control-Request-Method": "GET"
            })
            assert response.status_code == expected


@pytest.mark.parametrize("origin", ["*", "https://*.example.com", "https://host/path", "https://user:pass@host", "ftp://host", "https://host:bad"])
def test_invalid_origins(origin):
    with pytest.raises(ValidationError):
        Settings(_env_file=None, allowed_origins=[origin])


def test_environment_settings(monkeypatch):
    monkeypatch.setenv("ALLOWED_ORIGINS", '["https://example.com"]')
    assert Settings(_env_file=None).allowed_origins == ["https://example.com"]


def test_git_ignore_rules(tmp_path):
    root = Path(__file__).resolve().parents[2]
    (tmp_path / ".gitignore").write_bytes((root / ".gitignore").read_bytes())
    subprocess.run(["git", "init", "--quiet", str(tmp_path)], check=True)
    ignored = ["PROBLEM.md", ".env", "backend/.env", "backend/.env.local", "backend/.venv/file", "backend/__pycache__/file.pyc", "private.key"]
    result = subprocess.run(["git", "-C", str(tmp_path), "check-ignore", "-z", "--stdin"], input=("\0".join(ignored) + "\0").encode(), capture_output=True, check=True)
    assert result.stdout.decode().split("\0")[:-1] == ignored
    for path in ["backend/.env.example", "backend/app/main.py"]:
        result = subprocess.run(["git", "-C", str(tmp_path), "check-ignore", path], capture_output=True)
        assert result.returncode == 1


def test_service_starts_and_serves_http():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]
    process = subprocess.Popen([
        sys.executable, "-c",
        "import uvicorn; from app.main import create_app; from app.config import Settings; "
        "uvicorn.run(create_app(Settings(_env_file=None, mongodb_uri=None, allowed_origins=[])), "
        f"host='127.0.0.1', port={port}, proxy_headers=False, access_log=False)",
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        deadline = time.monotonic() + 15
        while time.monotonic() < deadline:
            assert process.poll() is None, "Service exited before startup"
            try:
                with urlopen(f"http://127.0.0.1:{port}/api/v1/health", timeout=1) as response:
                    assert json.load(response) == {"status": "ok"}
                break
            except OSError:
                time.sleep(0.1)
        else:
            pytest.fail("Service did not become ready within 15 seconds")
        with urlopen(f"http://127.0.0.1:{port}/api/v1/regions", timeout=2) as response:
            RegionsResponse.model_validate(json.load(response))
    finally:
        process.terminate()
        process.wait(timeout=5)
