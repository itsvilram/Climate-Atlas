from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
import json
import logging

import anyio
from fastapi.testclient import TestClient
import httpx
import pytest
from pydantic import ValidationError

from app.config import Settings
from app.limits import Policy, ProviderQuota, RateLimitExceeded, RequestLimits, SlidingWindowLimiter
from app.main import create_app
from app.operations import OperationalMiddleware
from app.services.weather_provider import Budget, ProviderRateLimited, WeatherProvider
from app.services.weather_provider import WeatherOperationTimeout
from app.schemas import Selection
import time
from app.regions import REGIONS
from test_analysis import setup, NOW


def config(**kwargs):
    return Settings(_env_file=None, mongodb_uri=None, **kwargs)


class Clock:
    def __init__(self):
        self.now = 0
    def clock(self):
        return self.now
    def sleep(self, seconds):
        self.now += seconds


def test_general_limit_has_retry_after_and_counts_invalid_requests():
    app = create_app(config(rate_requests=2))
    with TestClient(app) as client:
        for _ in range(2):
            assert client.post("/api/v1/analyses", json={"start_year": True}).status_code == 422
        response = client.post("/api/v1/analyses", json={})
        assert response.status_code == 429
        assert response.json()["error"]["code"] == "rate_limited"
        assert 1 <= int(response.headers["retry-after"]) <= 60


def test_cold_limit_counts_once_and_does_not_charge_warm_hits(setup):
    client, _, _, weather, _, _ = setup
    limits = client.app.state.request_limits
    limits.cold_policy = Policy("cold_rate_limited", 1, 600)
    assert client.post("/api/v1/analyses", json={}).status_code == 200
    calls = weather.provider.request_count
    assert len(limits.limiter._clients["unknown"]["cold_rate_limited"][1]) == 1
    warm = client.post("/api/v1/analyses", json={})
    assert warm.status_code == 200 and warm.json()["source"]["analysis_cache_status"] == "hit"
    denied = client.post("/api/v1/analyses", json={"start_year": 2000, "end_year": 2010})
    assert denied.status_code == 429 and denied.json()["error"]["code"] == "cold_rate_limited"
    assert weather.provider.request_count == calls


def test_refresh_admission_happens_before_provider_requests(setup):
    client, _, db, weather, _, _ = setup
    client.app.state.request_limits.cold_policy = Policy("cold_rate_limited", 1, 600)
    assert client.post("/api/v1/analyses", json={}).status_code == 200
    db.db.weather_years.update_many({}, {"$set": {"fetched_at": NOW - timedelta(days=31)}})
    calls = weather.provider.request_count
    response = client.post("/api/v1/analyses", json={})
    assert response.status_code == 429
    assert weather.provider.request_count == calls


def test_allowed_denied_origins_and_cors_on_rate_errors():
    app = create_app(config(allowed_origins=["https://frontend.example"], rate_requests=1))
    with TestClient(app) as client:
        preflight = client.options("/api/v1/analyses", headers={"Origin": "https://frontend.example", "Access-Control-Request-Method": "POST"})
        assert preflight.status_code == 200
        denied = client.post("/api/v1/analyses", json={}, headers={"Origin": "https://evil.example"})
        assert denied.status_code == 403 and "access-control-allow-origin" not in denied.headers
        assert client.get("/api/v1/regions", headers={"Origin": "https://frontend.example"}).status_code == 200
        limited = client.get("/api/v1/regions", headers={"Origin": "https://frontend.example"})
        assert limited.status_code == 429
        assert limited.headers["access-control-allow-origin"] == "https://frontend.example"
        assert "Retry-After" in limited.headers["access-control-expose-headers"]
        assert "access-control-allow-credentials" not in limited.headers


def scope(peer, forwarded=None, extra=()):
    headers = list(extra)
    if forwarded is not None:
        headers.append((b"x-forwarded-for", forwarded.encode()))
    return {"client": (peer, 1234), "headers": headers}


def test_untrusted_forwarding_and_mapped_ipv6_cannot_change_identity():
    limits = RequestLimits(config())
    assert limits.client_identity(scope("198.51.100.9", "1.2.3.4")) == "198.51.100.9"
    assert limits.client_identity(scope("::ffff:198.51.100.9", "1.2.3.4")) == "198.51.100.9"
    assert limits.client_identity(scope("198.51.100.9", extra=[(b"forwarded", b"for=1.2.3.4"), (b"x-real-ip", b"1.2.3.4")])) == "198.51.100.9"
    assert limits.client_identity({"client": None}) == "unknown"


def test_trusted_chain_walks_right_to_left_and_stops_at_first_untrusted_hop():
    limits = RequestLimits(config(trusted_proxy_networks=["10.0.0.0/24", "::1/128"]))
    assert limits.client_identity(scope("10.0.0.2", "1.2.3.4, 198.51.100.7, 10.0.0.1")) == "198.51.100.7"
    assert limits.client_identity(scope("::1", "2001:db8::7")) == "2001:db8::7"
    for value in ["not-an-ip", "198.51.100.7:1234", "x" * 1025, ",".join(["1.2.3.4"] * 17)]:
        assert limits.client_identity(scope("10.0.0.2", value)) == "10.0.0.2"
    assert limits.client_identity(scope("10.0.0.2", "1.2.3.4", [(b"x-forwarded-for", b"5.6.7.8")])) == "10.0.0.2"


def test_forwarding_spoof_cannot_bypass_http_limit():
    app = create_app(config(rate_requests=1))
    with TestClient(app, client=("198.51.100.9", 1234)) as client:
        assert client.get("/api/v1/regions", headers={"X-Forwarded-For": "1.1.1.1"}).status_code == 200
        assert client.get("/api/v1/regions", headers={"X-Forwarded-For": "2.2.2.2"}).status_code == 429


def test_limiter_is_atomic_bounded_and_expires_idle_clients():
    clock = Clock()
    limiter = SlidingWindowLimiter(1, clock=clock.clock)
    policy = Policy("rate_limited", 5, 60)
    def attempt(_):
        try:
            limiter.admit("one", (policy,))
            return True
        except RateLimitExceeded:
            return False
    with ThreadPoolExecutor(max_workers=16) as pool:
        assert sum(pool.map(attempt, range(40))) == 5
    with pytest.raises(RateLimitExceeded) as error:
        limiter.admit("two", (policy,))
    assert error.value.code == "rate_limiter_capacity"
    assert len(limiter._clients) == 1
    clock.now = 60
    limiter.admit("two", (policy,))
    assert set(limiter._clients) == {"two"}


def test_provider_quota_waits_within_budget_and_limits_longer_windows():
    clock = Clock()
    quota = ProviderQuota(config())
    budget = Budget(240, clock=clock.clock, sleep=clock.sleep)
    for _ in range(12):
        quota.acquire(budget)
    assert clock.now == 0
    quota.acquire(budget)
    assert clock.now == 60
    clock = Clock()
    quota = ProviderQuota(config(provider_calls_per_hour=40))
    budget = Budget(240, clock=clock.clock, sleep=clock.sleep)
    quota.acquire(budget)
    with pytest.raises(ProviderRateLimited) as error:
        quota.acquire(budget)
    assert error.value.retry_after == 3600
    assert clock.now == 0


def test_provider_attempts_including_retries_consume_budget_units():
    settings = config()
    quota = ProviderQuota(settings)
    clock = Clock()
    provider = WeatherProvider(settings, transport=httpx.MockTransport(lambda request: httpx.Response(503)), request_gate=quota)
    with pytest.raises(Exception):
        provider.fetch(REGIONS[0], 2020, Budget(240, clock=clock.clock, sleep=clock.sleep))
    assert provider.request_count == 3
    assert sum(cost for _, cost in quota.limiter._clients["provider"]["provider_day"][1]) == 120
    provider.close()


def test_body_limit_and_logs_do_not_echo_query_headers_body_or_exception(setup, monkeypatch, caplog):
    client, service, _, _, _, _ = setup
    caplog.set_level(logging.INFO, logger="climate.requests")
    oversized = client.post("/api/v1/analyses", content=b"s" * 4097)
    assert oversized.status_code == 413 and oversized.json()["error"]["code"] == "request_too_large"
    def fail(*args, **kwargs):
        raise RuntimeError("mongodb://user:secret-canary@host")
    monkeypatch.setattr(service, "analyze", fail)
    response = client.post("/api/v1/analyses?secret-canary=private", json={}, headers={"Authorization": "secret-canary"})
    assert response.status_code == 500 and "secret-canary" not in response.text
    records = [record for record in caplog.records if record.name == "climate.requests"]
    assert records
    assert all("secret-canary" not in record.getMessage() and "mongodb" not in record.getMessage() and record.exc_info is None for record in records)
    assert set(json.loads(records[-1].getMessage())) == {"route", "method", "status", "duration_ms", "cache"}


def test_chunked_oversize_and_slow_body_stop_before_application():
    async def run(slow=False):
        called, sent = [], []
        async def application(scope, receive, send):
            called.append(True)
        messages = [{"type": "http.request", "body": b"x" * 256, "more_body": True},
                    {"type": "http.request", "body": b"x", "more_body": False}]
        async def receive():
            if slow:
                await anyio.sleep(0.1)
            return messages.pop(0)
        async def send(message):
            sent.append(message)
        settings = config(request_max_body_bytes=256, weather_operation_timeout_seconds=0.02 if slow else 240)
        middleware = OperationalMiddleware(application, settings, RequestLimits(settings))
        request_scope = {"type": "http", "path": "/api/v1/analyses", "method": "POST", "headers": [], "client": ("192.0.2.1", 1234)}
        await middleware(request_scope, receive, send)
        assert not called
        assert sent[0]["status"] == (408 if slow else 413)
    anyio.run(run)
    anyio.run(run, True)


def test_concurrent_http_admission_is_bounded_and_released():
    async def run():
        entered, release = anyio.Event(), anyio.Event()
        statuses = []
        async def application(scope, receive, send):
            entered.set()
            await release.wait()
            await send({"type": "http.response.start", "status": 200, "headers": []})
            await send({"type": "http.response.body", "body": b"{}"})
        async def receive():
            return {"type": "http.request", "body": b"", "more_body": False}
        async def send(message):
            if message["type"] == "http.response.start":
                statuses.append(message["status"])
        settings = config(request_max_concurrent=1)
        middleware = OperationalMiddleware(application, settings, RequestLimits(settings))
        def request_scope():
            return {"type": "http", "path": "/api/v1/regions", "method": "GET", "headers": [], "client": ("192.0.2.1", 1)}
        async with anyio.create_task_group() as group:
            group.start_soon(middleware, request_scope(), receive, send)
            await entered.wait()
            await middleware(request_scope(), receive, send)
            assert statuses == [503]
            release.set()
        assert statuses == [503, 200]
        assert middleware._active == 0
    anyio.run(run)


def test_expired_request_deadline_does_not_reset_at_analysis_admission(setup):
    _, service, _, weather, _, _ = setup
    with pytest.raises(WeatherOperationTimeout):
        service.analyze(Selection(), request_deadline=time.monotonic() - 1)
    assert service._inflight == {}
    assert weather.provider.request_count == 0


@pytest.mark.parametrize("changes", [
    {"trusted_proxy_networks": ["*"]}, {"trusted_proxy_networks": ["0.0.0.0/0"]},
    {"trusted_proxy_networks": ["::/0"]}, {"rate_requests": 0}, {"cold_requests": 0},
    {"rate_max_clients": 10001}, {"provider_calls_per_minute": 601},
    {"provider_calls_per_hour": 5001}, {"provider_calls_per_day": 10001},
    {"request_max_body_bytes": 0},
])
def test_unsafe_operational_settings_are_rejected(changes):
    with pytest.raises(ValidationError):
        config(**changes)
