"""Year cache and boundary-context access. No thresholds or event calculations."""

from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone

from pymongo import timeout

from ..config import Settings
from ..regions import REGIONS
from ..schemas import Selection
from ..limits import ProviderQuota
from .weather_data import SOURCE_MIN_YEAR, InvalidWeatherPayload, identity_for, normalize, valid_cached
from .weather_provider import Budget, ProviderUnavailable, WeatherOperationTimeout, WeatherProvider

CACHE_AGE = timedelta(days=30)
BASELINE_YEARS = range(1990, 2021)


def latest_complete_year(today: date) -> int:
    # ERA5 is delayed by five days. Do not fetch partial calendar years.
    return (today - timedelta(days=5)).year - 1


def required_years(selection: Selection, maximum_year: int) -> list[int]:
    years = set(BASELINE_YEARS) | set(range(selection.start_year, selection.end_year + 1))
    years |= {selection.start_year - 1, selection.end_year + 1}
    return sorted(year for year in years if SOURCE_MIN_YEAR <= year <= maximum_year)


@dataclass
class CachedYear:
    document: dict
    cache_status: str
    warnings: tuple[str, ...] = ()


class WeatherService:
    def __init__(self, repository, settings: Settings, *, provider=None, now=None, budget_factory=None):
        self.repository, self.settings = repository, settings
        self.provider = provider if provider is not None else WeatherProvider(settings, request_gate=ProviderQuota(settings))
        self.now = now or (lambda: datetime.now(timezone.utc))
        self.budget_factory = budget_factory or (lambda: Budget(settings.weather_operation_timeout_seconds))

    def close(self):
        self.provider.close()

    def operation(self, region_id: str):
        region = next((region for region in REGIONS if region.id == region_id), None)
        if region is None:
            raise ValueError("Unknown region ID.")
        return WeatherOperation(self, region)


class WeatherOperation:
    """B05 can request adjacent years using this SAME budget and year limit."""

    def __init__(self, service: WeatherService, region):
        self.service, self.region = service, region
        self.budget = service.budget_factory()
        self.maximum_year = latest_complete_year(service.now().date())
        self.years: dict[int, CachedYear] = {}
        self.cold_admission = None

    def load_selection(self, selection: Selection) -> dict[int, CachedYear]:
        if selection.region_id != self.region.id:
            raise ValueError("Selection and operation regions must match.")
        if selection.end_year > self.maximum_year:
            raise ValueError("Selected years are not fully available from the source.")
        plan = required_years(selection, self.maximum_year)
        if len(set(plan) | self.years.keys()) > self.service.settings.weather_max_years:
            raise ValueError("Weather operation year limit exceeded.")
        for year in plan:
            self.load_year(year)
        return dict(self.years)

    def extend(self, direction: int, *, from_year: int | None = None) -> CachedYear | None:
        if type(direction) is not int or direction not in (-1, 1) or not self.years:
            raise ValueError("Load context first, then extend by one adjacent year.")
        if from_year is not None and (type(from_year) is not int or from_year not in self.years):
            raise ValueError("Boundary anchor must be a loaded year.")
        anchor = from_year if from_year is not None else (min(self.years) if direction == -1 else max(self.years))
        year = anchor + direction
        if not SOURCE_MIN_YEAR <= year <= self.maximum_year or (year not in self.years and len(self.years) >= self.service.settings.weather_max_years):
            return None  # B05 must flag unresolved truncation at this boundary.
        return self.load_year(year)

    def load_year(self, year: int) -> CachedYear:
        if type(year) is not int or not SOURCE_MIN_YEAR <= year <= self.maximum_year:
            raise ValueError("Year is outside available complete source years.")
        self.budget.remaining()
        if year in self.years:
            return self.years[year]
        if len(self.years) >= self.service.settings.weather_max_years:
            raise ValueError("Weather operation year limit exceeded.")
        identity = identity_for(self.region, year)
        with timeout(self.budget.remaining()):
            stored = self.service.repository.get(identity)
        now = self.service.now()
        usable = valid_cached(stored, self.region, year)
        if usable and timedelta(0) <= now - stored["fetched_at"] < CACHE_AGE:
            result = CachedYear(stored, "hit")
        else:
            try:
                if self.cold_admission is not None:
                    self.cold_admission()
                payload = self.service.provider.fetch(self.region, year, self.budget)
                normalized = normalize(payload, self.region, year, self.service.now())
            except (ProviderUnavailable, InvalidWeatherPayload, WeatherOperationTimeout):
                # Adequacy of the fixed baseline is enforced by B04, not here.
                if not usable or stored["quality"]["coverage"] < 0.95 or stored["fetched_at"] > now:
                    raise
                result = CachedYear(stored, "stale", ("stale_weather_data",))
            else:
                self.budget.remaining()
                body = {key: value for key, value in normalized.items() if key not in identity.model_dump()}
                with timeout(self.budget.remaining()):
                    saved = self.service.repository.save(identity, body)
                if not valid_cached(saved, self.region, year):
                    raise InvalidWeatherPayload()
                result = CachedYear(saved, "refreshed" if usable else "fetched")
        self.budget.remaining()
        self.years[year] = result
        return result
