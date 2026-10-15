"""Environment configuration; secret values are never included in repr/errors."""

from pathlib import Path

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[1] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        hide_input_in_errors=True,
    )

    allowed_origins: list[str] = []
    mongodb_uri: SecretStr | None = Field(default=None, repr=False)
    mongodb_db: str = Field(default="climate_hazard_analyzer", pattern=r"^[a-zA-Z0-9_-]{1,63}$")
    mongodb_timeout_ms: int = Field(default=5000, ge=100, le=60000)
    mongodb_max_pool_size: int = Field(default=10, ge=1, le=100)
    weather_call_timeout_seconds: float = Field(default=20, gt=0, le=60)
    weather_operation_timeout_seconds: float = Field(default=240, gt=0, le=600)
    weather_max_retries: int = Field(default=2, ge=0, le=3)
    weather_request_interval_seconds: float = Field(default=3, ge=3, le=60)
    weather_max_years: int = Field(default=40, ge=1, le=40)
    analysis_max_cache_entries: int = Field(default=100, ge=1, le=1000)
    analysis_max_events: int = Field(default=5000, ge=1, le=5000)
    analysis_max_response_bytes: int = Field(default=4_000_000, ge=1000, le=10_000_000)
    analysis_max_pending: int = Field(default=8, ge=1, le=32)
    rate_requests: int = Field(default=60, ge=1, le=1000)
    rate_window_seconds: int = Field(default=60, ge=1, le=3600)
    cold_requests: int = Field(default=2, ge=1, le=100)
    cold_window_seconds: int = Field(default=600, ge=1, le=86400)
    rate_max_clients: int = Field(default=2048, ge=1, le=10000)
    request_max_body_bytes: int = Field(default=4096, ge=256, le=16384)
    request_max_concurrent: int = Field(default=16, ge=1, le=32)
    trusted_proxy_networks: list[str] = []
    provider_calls_per_minute: int = Field(default=480, ge=40, le=600)
    provider_calls_per_hour: int = Field(default=4500, ge=40, le=5000)
    provider_calls_per_day: int = Field(default=9000, ge=40, le=10000)

    @field_validator("trusted_proxy_networks")
    @classmethod
    def trusted_networks(cls, values: list[str]) -> list[str]:
        from ipaddress import ip_network
        for value in values:
            try:
                if ip_network(value, strict=False).prefixlen == 0:
                    raise ValueError()
            except ValueError:
                raise ValueError("Trusted proxies must be explicit IPs or restricted CIDR networks.") from None
        return values

    @field_validator("allowed_origins")
    @classmethod
    def explicit_origins(cls, origins: list[str]) -> list[str]:
        from urllib.parse import urlsplit

        for origin in origins:
            parsed = urlsplit(origin)
            if (
                parsed.scheme not in {"http", "https"}
                or not parsed.hostname
                or "*" in origin
                or parsed.username is not None
                or parsed.password is not None
                or parsed.path
                or parsed.query
                or parsed.fragment
            ):
                raise ValueError("ALLOWED_ORIGINS must contain explicit HTTP(S) origins")
            try:
                parsed.port
            except ValueError:
                raise ValueError("ALLOWED_ORIGINS contains an invalid port") from None
        return origins
