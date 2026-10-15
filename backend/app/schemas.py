"""Public foundation contracts, including the future analysis input."""

from typing import Annotated, Literal, Self

from pydantic import BaseModel, ConfigDict, Field, model_validator

MIN_YEAR = 1990
MAX_YEAR = 2025
RegionId = Literal["delhi", "mumbai", "bengaluru", "chennai", "hyderabad"]
Year = Annotated[int, Field(strict=True, ge=MIN_YEAR, le=MAX_YEAR)]


class Selection(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)

    region_id: RegionId = "delhi"
    start_year: Year = 1990
    end_year: Year = 2020
    hazard: Literal["heatwave"] = "heatwave"

    @model_validator(mode="after")
    def ordered_years(self) -> Self:
        if self.start_year > self.end_year:
            raise ValueError("start_year must be less than or equal to end_year")
        return self


class Region(BaseModel):
    model_config = ConfigDict(frozen=True)

    id: RegionId
    name: str
    latitude: float
    longitude: float
    timezone: str


class SupportedYears(BaseModel):
    min: int = MIN_YEAR
    max: int = MAX_YEAR


class RegionsResponse(BaseModel):
    regions: tuple[Region, ...]
    supported_years: SupportedYears = Field(default_factory=SupportedYears)
    defaults: Selection = Field(default_factory=Selection)


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"


class ValidationDetail(BaseModel):
    field: str
    code: str
    message: str


class ErrorBody(BaseModel):
    code: str
    message: str
    details: list[ValidationDetail] | None = None


class ErrorResponse(BaseModel):
    error: ErrorBody
