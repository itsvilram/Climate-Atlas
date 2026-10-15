"""Fixed annual percentile threshold. No seasonal adjustment or event detection."""

from collections.abc import Iterable
from dataclasses import asdict, dataclass
from datetime import date
import math
from numbers import Real

import numpy as np

BASELINE_START_YEAR = 1990
BASELINE_END_YEAR = 2020
PERCENTILE = 95
MINIMUM_COVERAGE = 0.95
PERCENTILE_METHOD = "linear"
THRESHOLD_METHOD_VERSION = "annual-p95-linear-v1"
LIMITATION = (
    "One annual threshold for all seasons; no seasonal adjustment. "
    "This application definition is not an official meteorological heat alert."
)


@dataclass(frozen=True)
class YearCoverage:
    year: int
    expected_days: int
    valid_days: int

    @property
    def coverage(self) -> float:
        return self.valid_days / self.expected_days

    @property
    def eligible(self) -> bool:
        # Integer comparison avoids rounding a just-inadequate year up to 95%.
        return self.valid_days * 100 >= self.expected_days * 95


@dataclass(frozen=True)
class BaselineCoverage:
    years: tuple[YearCoverage, ...]

    @property
    def expected_days(self) -> int:
        return sum(year.expected_days for year in self.years)

    @property
    def valid_days(self) -> int:
        return sum(year.valid_days for year in self.years)

    @property
    def coverage(self) -> float:
        return self.valid_days / self.expected_days

    @property
    def eligible(self) -> bool:
        return self.valid_days * 100 >= self.expected_days * 95 and all(year.eligible for year in self.years)


class InsufficientBaselineData(ValueError):
    code = "insufficient_baseline_data"

    def __init__(self, coverage: BaselineCoverage):
        super().__init__("The 1990-2020 baseline requires at least 95% valid days overall and in every year.")
        self.coverage = coverage
        self.inadequate_years = tuple(year.year for year in coverage.years if not year.eligible)


@dataclass(frozen=True)
class BaselineThreshold:
    threshold_celsius: float
    baseline_coverage: BaselineCoverage

    def methodology(self) -> dict:
        """JSON-safe metadata; threshold remains unrounded for detection."""
        return {
            "baseline_start_year": BASELINE_START_YEAR,
            "baseline_end_year": BASELINE_END_YEAR,
            "percentile": PERCENTILE,
            "percentile_method": PERCENTILE_METHOD,
            "threshold_method_version": THRESHOLD_METHOD_VERSION,
            "threshold_celsius": self.threshold_celsius,
            "temperature_variable": "temperature_2m_max",
            "temperature_unit": "°C",
            "comparison": ">",
            "minimum_coverage": MINIMUM_COVERAGE,
            "seasonal_adjustment": False,
            "limitation": LIMITATION,
            "baseline_quality": {
                "expected_days": self.baseline_coverage.expected_days,
                "valid_days": self.baseline_coverage.valid_days,
                "coverage": self.baseline_coverage.coverage,
                "years": [{**asdict(year), "coverage": year.coverage} for year in self.baseline_coverage.years],
            },
        }


def _valid_temperature(value) -> float | None:
    # Ingestion already applies plausibility bounds; do not interpolate or coerce
    # numeric strings/bools here. Missing/non-finite observations count as absent.
    if isinstance(value, bool) or not isinstance(value, Real):
        return None
    try:
        number = float(value)
    except (ValueError, OverflowError):
        return None
    return number if math.isfinite(number) else None


def _calendar_date(value: date | str) -> date:
    if type(value) is date:
        return value
    if isinstance(value, str):
        try:
            day = date.fromisoformat(value)
            if day.isoformat() == value:
                return day
        except ValueError:
            pass
    # datetime must not be silently truncated to a local calendar date.
    raise ValueError("Observations require calendar dates or canonical YYYY-MM-DD strings.")


def calculate_threshold(observations: Iterable[tuple[date | str, float | None]]) -> BaselineThreshold:
    """Use one city's normalized daily maxima, including the entire baseline.

    The caller may pass extra selected/boundary years; only 1990-2020 contributes.
    Dates absent from the iterable count as missing, not zero. Baseline duplicate
    dates are rejected even when one value is null. No storage/API imports or I/O.
    """
    counts = {year: 0 for year in range(BASELINE_START_YEAR, BASELINE_END_YEAR + 1)}
    seen: set[date] = set()
    valid: list[float] = []
    for raw_date, value in observations:
        day = _calendar_date(raw_date)
        if day.year not in counts:
            continue
        if day in seen:
            raise ValueError("Duplicate baseline date.")
        seen.add(day)
        number = _valid_temperature(value)
        if number is not None:
            counts[day.year] += 1
            valid.append(number)
    coverage = BaselineCoverage(tuple(
        YearCoverage(year, (date(year + 1, 1, 1) - date(year, 1, 1)).days, count)
        for year, count in counts.items()
    ))
    if not coverage.eligible:
        raise InsufficientBaselineData(coverage)
    threshold = float(np.percentile(np.asarray(valid, dtype=np.float64), PERCENTILE, method=PERCENTILE_METHOD))
    if not math.isfinite(threshold):
        raise ValueError("Percentile calculation must produce a finite threshold.")
    return BaselineThreshold(threshold, coverage)


def is_hot_day(value: float | None, threshold_celsius: float) -> bool:
    """Strict exceedance at full precision; invalid observations cannot qualify."""
    threshold = _valid_temperature(threshold_celsius)
    if threshold is None:
        raise ValueError("Threshold must be a finite number.")
    temperature = _valid_temperature(value)
    return temperature is not None and temperature > threshold
