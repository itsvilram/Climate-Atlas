"""Year-block persistence; normalization and freshness policy belong to B03."""

from collections.abc import Mapping
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from ..schemas import RegionId
from .base import DocumentRepository

WEATHER_IDENTITY_FIELDS = ("region_id", "coordinate_version", "model", "year", "schema_version")


class WeatherIdentity(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid", strict=True)

    region_id: RegionId
    coordinate_version: str = Field(min_length=1, max_length=100)
    model: str = Field(min_length=1, max_length=100)
    # Boundary data can precede the selectable 1990-2025 period.
    year: int = Field(ge=1, le=9999)
    schema_version: int = Field(ge=1)


class WeatherRepository(DocumentRepository):
    def get(self, identity: WeatherIdentity) -> dict | None:
        return self._get(identity.model_dump())

    def save(self, identity: WeatherIdentity, payload: Mapping[str, Any]) -> dict:
        return self._save(identity.model_dump(), payload)
