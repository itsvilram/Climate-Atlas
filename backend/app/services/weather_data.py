"""Calendar normalization and versioned weather storage contract; no climate logic."""

import hashlib
import json
import math
from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from ..regions import REGION_COORDINATE_VERSION
from ..repositories.weather import WeatherIdentity
from ..schemas import Region

MODEL = "era5"
SCHEMA_VERSION = 1
SOURCE_MIN_YEAR = 1940
MIN_CELSIUS = -90
MAX_CELSIUS = 65
ATTRIBUTION = {
    "provider": "Open-Meteo",
    "url": "https://open-meteo.com/",
    "licence": "https://creativecommons.org/licenses/by/4.0/",
    "dataset": "ERA5 reanalysis",
    "changes": "Calendar reconstructed; missing/invalid observations retained as null with flags.",
}


class InvalidWeatherPayload(Exception):
    def __init__(self):
        super().__init__("Weather data failed validation.")


def identity_for(region: Region, year: int) -> WeatherIdentity:
    return WeatherIdentity(region_id=region.id, coordinate_version=REGION_COORDINATE_VERSION,
                           model=MODEL, year=year, schema_version=SCHEMA_VERSION)


def calendar(year: int) -> list[str]:
    first = date(year, 1, 1)
    return [(first + timedelta(days=i)).isoformat() for i in range((date(year + 1, 1, 1) - first).days)]


def finite_number(value) -> bool:
    try:
        return type(value) in (int, float) and math.isfinite(value)
    except OverflowError:
        return False


def revision_of(record: dict) -> str:
    content = {key: value for key, value in record.items() if key not in {"fetched_at", "revision", "_id"}}
    return hashlib.sha256(json.dumps(content, sort_keys=True, separators=(",", ":"), allow_nan=False).encode()).hexdigest()


def normalize(payload, region: Region, year: int, fetched_at: datetime) -> dict:
    try:
        if not isinstance(payload, dict):
            raise InvalidWeatherPayload()
        units = payload["daily_units"]
        if units["time"] != "iso8601" or units["temperature_2m_max"] != "°C":
            raise InvalidWeatherPayload()
        provider_timezone = payload["timezone"]
        # IANA aliases Asia/Calcutta and Asia/Kolkata denote the same city day.
        if not isinstance(provider_timezone, str):
            raise InvalidWeatherPayload()
        if provider_timezone not in {region.timezone, "Asia/Calcutta"}:
            raise InvalidWeatherPayload()
        for month in (1, 7):
            sample = datetime(year, month, 1)
            if sample.replace(tzinfo=ZoneInfo(provider_timezone)).utcoffset() != sample.replace(tzinfo=ZoneInfo(region.timezone)).utcoffset():
                raise InvalidWeatherPayload()
        lat, lon = payload["latitude"], payload["longitude"]
        if not finite_number(lat) or not finite_number(lon) or not -90 <= lat <= 90 or not -180 <= lon <= 180:
            raise InvalidWeatherPayload()
        if abs(lat - region.latitude) > 1 or abs(lon - region.longitude) > 1:
            raise InvalidWeatherPayload()
        offset = payload["utc_offset_seconds"]
        expected_offset = int(datetime(year, 1, 1, tzinfo=ZoneInfo(region.timezone)).utcoffset().total_seconds())
        if type(offset) is not int or offset != expected_offset:
            raise InvalidWeatherPayload()
        times = payload["daily"]["time"]
        temperatures = payload["daily"]["temperature_2m_max"]
        if not isinstance(times, list) or not times or not isinstance(temperatures, list) or len(times) != len(temperatures):
            raise InvalidWeatherPayload()
        expected = calendar(year)
        if len(times) > len(expected):
            raise InvalidWeatherPayload()
        observed, reasons = {}, {}
        for day, temperature in zip(times, temperatures):
            if not isinstance(day, str) or date.fromisoformat(day).isoformat() != day or date.fromisoformat(day).year != year or day in observed:
                raise InvalidWeatherPayload()
            if temperature is None:
                value, reason = None, "provider_null"
            elif not finite_number(temperature):
                value, reason = None, "invalid_value"
            elif not MIN_CELSIUS <= temperature <= MAX_CELSIUS:
                value, reason = None, "implausible_temperature"
            else:
                value, reason = float(temperature), None
            observed[day] = value
            if reason:
                reasons[day] = reason
        values = [observed.get(day) for day in expected]
        flags = [{"date": day, "reason": reasons.get(day, "missing_date")} for day, value in zip(expected, values) if value is None]
        valid = sum(value is not None for value in values)
        record = {
            **identity_for(region, year).model_dump(),
            "dates": expected, "temperature_2m_max": values,
            "requested_coordinates": {"latitude": region.latitude, "longitude": region.longitude},
            "grid_coordinates": {"latitude": float(lat), "longitude": float(lon)},
            "timezone": region.timezone, "provider_timezone": provider_timezone,
            "utc_offset_seconds": offset, "units": "°C", "source": dict(ATTRIBUTION),
            "quality": {"expected_days": len(expected), "valid_days": valid,
                        "coverage": valid / len(expected), "flags": flags},
            "fetched_at": fetched_at.astimezone(timezone.utc),
        }
        record["revision"] = revision_of(record)
        return record
    except (KeyError, TypeError, ValueError, OverflowError):
        raise InvalidWeatherPayload() from None


def valid_cached(record, region: Region, year: int) -> bool:
    """Do not trust malformed or mismatched cached records, even when fresh."""
    try:
        if not isinstance(record, dict) or any(record.get(k) != v for k, v in identity_for(region, year).model_dump().items()):
            return False
        if record["dates"] != calendar(year) or record["revision"] != revision_of(record):
            return False
        normalized = normalize({
            "daily_units": {"time": "iso8601", "temperature_2m_max": record["units"]},
            "timezone": record["provider_timezone"], "utc_offset_seconds": record["utc_offset_seconds"],
            **record["grid_coordinates"],
            "daily": {"time": record["dates"], "temperature_2m_max": record["temperature_2m_max"]},
        }, region, year, record["fetched_at"])
        quality = record["quality"]
        if record["source"] != ATTRIBUTION or record["timezone"] != region.timezone or record["requested_coordinates"] != normalized["requested_coordinates"]:
            return False
        if record["temperature_2m_max"] != normalized["temperature_2m_max"]:
            return False
        if any(quality[k] != normalized["quality"][k] for k in ("expected_days", "valid_days", "coverage")):
            return False
        missing = {day for day, value in zip(record["dates"], record["temperature_2m_max"]) if value is None}
        flags = quality["flags"]
        if len(flags) != len(missing) or {flag["date"] for flag in flags} != missing:
            return False
        if any(flag["reason"] not in {"provider_null", "invalid_value", "implausible_temperature", "missing_date"} for flag in flags):
            return False
        return isinstance(record["fetched_at"], datetime) and record["fetched_at"].utcoffset() is not None
    except (InvalidWeatherPayload, KeyError, TypeError, ValueError, AttributeError, OverflowError):
        return False
