"""Pure consecutive-day detection with explicit uncertainty at loaded edges."""

from collections.abc import Iterable
from dataclasses import dataclass
from datetime import date, timedelta
from math import fsum

from .threshold import _calendar_date, _valid_temperature, is_hot_day

MINIMUM_RUN_DAYS = 3


@dataclass(frozen=True)
class HotDay:
    date: date
    temperature_celsius: float
    exceedance_celsius: float


@dataclass(frozen=True)
class HeatwaveEvent:
    observed_days: tuple[HotDay, ...]
    truncated_start: bool
    truncated_end: bool
    started_in_selection: bool | None

    @property
    def observed_start_date(self) -> date:
        return self.observed_days[0].date

    @property
    def observed_end_date(self) -> date:
        return self.observed_days[-1].date

    @property
    def qualification_confirmed(self) -> bool:
        return len(self.observed_days) >= MINIMUM_RUN_DAYS

    @property
    def complete(self) -> bool:
        return not (self.truncated_start or self.truncated_end)

    @property
    def start_date(self) -> date | None:
        return None if self.truncated_start else self.observed_start_date

    @property
    def end_date(self) -> date | None:
        return None if self.truncated_end else self.observed_end_date

    @property
    def duration_days(self) -> int | None:
        return len(self.observed_days) if self.complete else None

    @property
    def observed_peak_temperature_celsius(self) -> float:
        return max(day.temperature_celsius for day in self.observed_days)

    @property
    def observed_mean_exceedance_celsius(self) -> float:
        return fsum(day.exceedance_celsius for day in self.observed_days) / len(self.observed_days)

    @property
    def peak_temperature_celsius(self) -> float | None:
        return self.observed_peak_temperature_celsius if self.complete else None

    @property
    def mean_exceedance_celsius(self) -> float | None:
        return self.observed_mean_exceedance_celsius if self.complete else None

    @property
    def eligible_for_complete_metrics(self) -> bool:
        return self.complete and self.qualification_confirmed

    def as_dict(self) -> dict:
        return {
            "observed_start_date": self.observed_start_date.isoformat(),
            "observed_end_date": self.observed_end_date.isoformat(),
            "observed_duration_days": len(self.observed_days),
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "duration_days": self.duration_days,
            "peak_temperature_celsius": self.peak_temperature_celsius,
            "mean_exceedance_celsius": self.mean_exceedance_celsius,
            "observed_peak_temperature_celsius": self.observed_peak_temperature_celsius,
            "observed_mean_exceedance_celsius": self.observed_mean_exceedance_celsius,
            "truncated_start": self.truncated_start,
            "truncated_end": self.truncated_end,
            "qualification_confirmed": self.qualification_confirmed,
            "started_in_selection": self.started_in_selection,
            "eligible_for_complete_metrics": self.eligible_for_complete_metrics,
            "observed_days": [
                {"date": day.date.isoformat(), "temperature_celsius": day.temperature_celsius,
                 "exceedance_celsius": day.exceedance_celsius} for day in self.observed_days
            ],
        }


def detect_events(observations: Iterable[tuple[date | str, float | None]], threshold_celsius: float,
                  period_start: date | str, period_end: date | str) -> tuple[HeatwaveEvent, ...]:
    """Return intersecting confirmed runs and uncertain short edge candidates.

    Loaded context must cover the selected period. Missing/invalid internal days
    break runs; hot first/last context days leave the respective boundary open.
    Closed runs shorter than three days are discarded. Never clip event dates to
    the selected period, and never claim full duration for an open boundary.
    """
    is_hot_day(None, threshold_celsius)  # Validate even for empty/cold input.
    start, end = _calendar_date(period_start), _calendar_date(period_end)
    if start > end:
        raise ValueError("Selected period must be ordered.")
    by_date = {}
    for raw_date, value in observations:
        day = _calendar_date(raw_date)
        if day in by_date:
            raise ValueError("Duplicate observation date.")
        by_date[day] = value
    dates = sorted(by_date)
    if not dates or dates[0] > start or dates[-1] < end:
        raise ValueError("Loaded context must cover the selected period.")
    events = []
    run: list[HotDay] = []

    def finish():
        if not run:
            return
        left, right = run[0].date == dates[0], run[-1].date == dates[-1]
        intersects = run[0].date <= end and run[-1].date >= start
        if intersects and (len(run) >= MINIMUM_RUN_DAYS or left or right):
            started = False if run[0].date < start else (None if left else True)
            events.append(HeatwaveEvent(tuple(run), left, right, started))
        run.clear()

    previous = None
    for day in dates:
        if previous is not None and day - previous != timedelta(days=1):
            finish()
        value = by_date[day]
        if is_hot_day(value, threshold_celsius):
            temperature = _valid_temperature(value)
            run.append(HotDay(day, temperature, temperature - float(threshold_celsius)))
        else:
            finish()
        previous = day
    finish()  # Finalize trailing runs, retaining an open-right boundary flag.
    return tuple(events)
