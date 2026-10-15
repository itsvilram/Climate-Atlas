"""Thread-safe, bounded single-process rate limits and trusted-proxy policy."""
from collections import deque
from dataclasses import dataclass
from ipaddress import ip_address, ip_network
from math import ceil
from threading import Lock
import time


class RateLimitExceeded(Exception):
    def __init__(self, code: str, retry_after: int):
        self.code = code
        self.retry_after = max(1, retry_after)
        super().__init__("Request limit reached.")


@dataclass(frozen=True)
class Policy:
    name: str
    limit: int
    window: int
    cost: int = 1


class SlidingWindowLimiter:
    def __init__(self, max_clients=10000, *, clock=time.monotonic):
        self.max_clients, self.clock = max_clients, clock
        self._clients = {}
        self._lock = Lock()

    def admit(self, identity: str, policies: tuple[Policy, ...], *, now=None):
        now = self.clock() if now is None else now
        with self._lock:
            # Each client has bounded queues; prune idle identities on admission.
            for client, buckets in list(self._clients.items()):
                for name, (window, queue) in list(buckets.items()):
                    while queue and queue[0][0] <= now - window:
                        queue.popleft()
                    if not queue:
                        del buckets[name]
                if not buckets:
                    del self._clients[client]
            if identity not in self._clients and len(self._clients) >= self.max_clients:
                raise RateLimitExceeded("rate_limiter_capacity", max(policy.window for policy in policies))
            buckets = self._clients.get(identity, {})
            retry = 0
            failed_code = None
            for policy in policies:
                queue = buckets.get(policy.name, (policy.window, deque()))[1]
                used = sum(cost for _, cost in queue)
                if used + policy.cost > policy.limit:
                    deficit = used + policy.cost - policy.limit
                    freed = 0
                    for timestamp, cost in queue:
                        freed += cost
                        if freed >= deficit:
                            retry = max(retry, ceil(timestamp + policy.window - now))
                            break
                    failed_code = policy.name
            if failed_code:
                raise RateLimitExceeded(failed_code, retry)
            buckets = self._clients.setdefault(identity, {})
            for policy in policies:
                if policy.name not in buckets:
                    buckets[policy.name] = (policy.window, deque())
                buckets[policy.name][1].append((now, policy.cost))


class RequestLimits:
    def __init__(self, settings, *, clock=time.monotonic):
        self.limiter = SlidingWindowLimiter(settings.rate_max_clients, clock=clock)
        self.general_policy = Policy("rate_limited", settings.rate_requests, settings.rate_window_seconds)
        self.cold_policy = Policy("cold_rate_limited", settings.cold_requests, settings.cold_window_seconds)
        self.trusted = tuple(ip_network(value, strict=False) for value in settings.trusted_proxy_networks)

    def client_identity(self, scope) -> str:
        def address(value):
            parsed = ip_address(value)
            return getattr(parsed, "ipv4_mapped", None) or parsed
        try:
            peer = address(scope["client"][0])
        except (KeyError, TypeError, ValueError):
            return "unknown"  # Fail closed to one shared bucket for invalid peers.
        def trusted(address):
            return any(address in network for network in self.trusted)
        if not trusted(peer):
            return str(peer)
        values = [value for key, value in scope.get("headers", []) if key.lower() == b"x-forwarded-for"]
        if len(values) != 1 or len(values[0]) > 1024:
            return str(peer)
        try:
            parts = values[0].decode("ascii").split(",")
            if len(parts) > 16:
                return str(peer)
            chain = [address(value.strip()) for value in parts] + [peer]
        except (ValueError, UnicodeError):
            return str(peer)
        while len(chain) > 1 and trusted(chain[-1]):
            chain.pop()
        return str(chain[-1])

    def general(self, identity):
        self.limiter.admit(identity, (self.general_policy,))

    def cold(self, identity):
        self.limiter.admit(identity, (self.cold_policy,))


class ProviderQuota:
    """Conservative 40 weighted-call units per single-variable yearly attempt."""
    def __init__(self, settings):
        self.limiter = SlidingWindowLimiter(1)
        self.policies = (
            Policy("provider_minute", settings.provider_calls_per_minute, 60, 40),
            Policy("provider_hour", settings.provider_calls_per_hour, 3600, 40),
            Policy("provider_day", settings.provider_calls_per_day, 86400, 40),
        )

    def acquire(self, budget):
        from .services.weather_provider import ProviderRateLimited
        while True:
            try:
                self.limiter.admit("provider", self.policies, now=budget.clock())
                return
            except RateLimitExceeded as error:
                if error.retry_after >= budget.remaining():
                    failure = ProviderRateLimited()
                    failure.retry_after = error.retry_after
                    raise failure from None
                budget.wait(error.retry_after)
