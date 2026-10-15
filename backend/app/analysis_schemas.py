"""Typed, finite public analysis contract; MongoDB fields never enter responses."""
from datetime import date
from typing import Literal

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field

from .schemas import Region


class Contract(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)


class AnalysisRegion(Region):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False, frozen=True)


class Period(Contract):
    start_year: int
    end_year: int
    hazard: Literal["heatwave"]


class Coverage(Contract):
    year: int
    expected_days: int
    valid_days: int
    coverage: float


class BaselineQuality(Contract):
    expected_days: int
    valid_days: int
    coverage: float
    years: list[Coverage]


class Methodology(Contract):
    baseline_start_year: int
    baseline_end_year: int
    percentile: int
    percentile_method: Literal["linear"]
    threshold_method_version: str
    threshold_celsius: float
    temperature_variable: Literal["temperature_2m_max"]
    temperature_unit: str
    comparison: Literal[">"]
    minimum_coverage: float
    seasonal_adjustment: Literal[False]
    limitation: str
    baseline_quality: BaselineQuality
    method_version: str
    minimum_run_days: Literal[3]


class Metrics(Contract):
    event_count: int = Field(ge=0)
    heatwave_days: int = Field(ge=0)
    mean_duration_days: float | None
    max_duration_days: int | None
    mean_exceedance_celsius: float | None
    peak_temperature_celsius: float | None


class Summary(Metrics):
    complete: bool
    partial: bool
    eligible_year_count: int
    selected_year_count: int
    excluded_boundary_event_count: int


class AnnualMetrics(Metrics, Coverage):
    complete: bool
    partial: bool
    incomplete_reasons: list[str]
    rolling_average_event_count: float | None


class Regression(Contract):
    slope_events_per_decade: float | None
    fit_year_count: int
    fit_years: list[int]
    reason: str | None
    interpretation: str


class ComparisonWindow(Contract):
    start_year: int
    end_year: int
    mean_event_count: float


class Comparison(Contract):
    first_window: ComparisonWindow | None
    last_window: ComparisonWindow | None
    absolute_change_events_per_year: float | None
    percent_change: float | None
    reason: str | None
    percentage_unavailable_reason: str | None


class Trend(Contract):
    regression: Regression
    comparison: Comparison


class Event(Contract):
    observed_start_date: date
    observed_end_date: date
    observed_duration_days: int
    start_date: date | None
    end_date: date | None
    duration_days: int | None
    peak_temperature_celsius: float | None
    mean_exceedance_celsius: float | None
    observed_peak_temperature_celsius: float
    observed_mean_exceedance_celsius: float
    truncated_start: bool
    truncated_end: bool
    qualification_confirmed: bool
    started_in_selection: bool | None
    eligible_for_complete_metrics: bool


class CountingMetadata(Contract):
    event_count: str
    duration: str
    heatwave_days: str
    intensity: str
    peak: str
    boundary_policy: str
    units: dict[str, str]


class DataQuality(Contract):
    warnings: list[str]
    incomplete_years: list[int]
    excluded_boundary_events: list[Event]
    counting_metadata: CountingMetadata


class Coordinates(Contract):
    latitude: float
    longitude: float


class WeatherSource(Contract):
    year: int
    revision: str
    fetched_at: AwareDatetime
    cache_status: Literal["hit", "fetched", "refreshed", "stale"]
    grid_coordinates: Coordinates
    timezone: str
    coverage: float


class Source(Contract):
    provider: Literal["Open-Meteo"]
    url: str
    licence: str
    dataset: str
    changes: str
    model: Literal["era5"]
    coordinate_version: str
    weather_schema_version: int
    generated_at: AwareDatetime
    analysis_cache_status: Literal["computed", "hit", "coalesced"]
    weather_years: list[WeatherSource]


class AnalysisResponse(Contract):
    region: AnalysisRegion
    period: Period
    methodology: Methodology
    summary: Summary
    annual_metrics: list[AnnualMetrics]
    trend: Trend
    events: list[Event]
    insights: list[str]
    data_quality: DataQuality
    source: Source
