"""Fixed-host, sequential Open-Meteo adapter with finite resource budgets."""

import json
import math
import time
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

import httpx

from .weather_data import MODEL, InvalidWeatherPayload

ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"
MAX_RESPONSE_BYTES = 256_000


class ProviderUnavailable(Exception):
    def __init__(self):
        super().__init__("Historical weather provider is unavailable.")


class ProviderRateLimited(ProviderUnavailable):
    pass


class WeatherOperationTimeout(Exception):
    def __init__(self):
        super().__init__("Weather operation exceeded its time budget.")


class Budget:
    def __init__(self, seconds, *, clock=time.monotonic, sleep=time.sleep):
        self.clock, self.sleep = clock, sleep
        self.deadline = clock() + seconds

    def remaining(self):
        value = self.deadline - self.clock()
        if value <= 0:
            raise WeatherOperationTimeout()
        return value

    def wait(self, seconds):
        if seconds >= self.remaining():
            raise WeatherOperationTimeout()
        if seconds > 0:
            self.sleep(seconds)
        self.remaining()


class WeatherProvider:
    def __init__(self, settings, *, transport=None, request_gate=None):
        self.settings = settings
        self.request_gate = request_gate
        self.client = httpx.Client(transport=transport, follow_redirects=False,
                                   limits=httpx.Limits(max_connections=1), trust_env=False)
        self.next_request_at = 0.0
        self.request_count = 0

    def close(self):
        self.client.close()

    def fetch(self, region, year, budget: Budget):
        params = {"latitude": region.latitude, "longitude": region.longitude,
                  "start_date": f"{year}-01-01", "end_date": f"{year}-12-31",
                  "daily": "temperature_2m_max", "temperature_unit": "celsius",
                  "timezone": region.timezone, "models": MODEL, "timeformat": "iso8601"}
        for attempt in range(self.settings.weather_max_retries + 1):
            budget.wait(max(0, self.next_request_at - budget.clock()))
            if self.request_gate is not None:
                self.request_gate.acquire(budget)
            # Bound each I/O phase; streaming also checks the overall deadline.
            phase_timeout = min(self.settings.weather_call_timeout_seconds, budget.remaining()) / 4
            self.next_request_at = budget.clock() + self.settings.weather_request_interval_seconds
            self.request_count += 1
            retry_after = None
            rate_limited = False
            try:
                with self.client.stream("GET", ARCHIVE_URL, params=params, timeout=phase_timeout) as response:
                    budget.remaining()
                    rate_limited = response.status_code == 429
                    if rate_limited or response.status_code in {408, 500, 502, 503, 504}:
                        retry_after = response.headers.get("Retry-After")
                    elif response.status_code != 200:
                        raise ProviderUnavailable()
                    else:
                        data = bytearray()
                        # Do not buffer to a target chunk size: slow incremental
                        # responses must reach the deadline check after each read.
                        for chunk in response.iter_bytes():
                            budget.remaining()
                            data.extend(chunk)
                            if len(data) > MAX_RESPONSE_BYTES:
                                raise InvalidWeatherPayload()
                        try:
                            return json.loads(data)
                        except (ValueError, UnicodeError):
                            raise InvalidWeatherPayload() from None
            except httpx.TransportError:
                pass
            delay = 0.5 * 2 ** attempt
            if retry_after is not None:
                try:
                    seconds = float(retry_after)
                    if not math.isfinite(seconds):
                        raise ValueError()
                except ValueError:
                    try:
                        seconds = (parsedate_to_datetime(retry_after) - datetime.now(timezone.utc)).total_seconds()
                    except (ValueError, TypeError, OverflowError):
                        seconds = delay
                delay = max(delay, seconds)
            # Preserve server cooldown even when this attempt exhausts retries
            # and the caller proceeds using a stale year or starts another year.
            self.next_request_at = max(self.next_request_at, budget.clock() + delay)
            if attempt == self.settings.weather_max_retries:
                raise (ProviderRateLimited() if rate_limited else ProviderUnavailable()) from None
            budget.wait(delay)
        raise ProviderUnavailable()
