"""Pure selected-period metrics; full-event durations, calendar-day allocation."""

from collections.abc import Iterable
from datetime import date
from math import fsum

from .events import HeatwaveEvent
from .threshold import _calendar_date, _valid_temperature

COUNTING_METADATA = {
    "event_count": "Complete confirmed events counted in their start year.",
    "duration": "Full duration of complete events starting in the selection/year, including days outside it.",
    "heatwave_days": "Complete-event days allocated to their actual calendar year, including prior-year event starts.",
    "intensity": "Day-weighted mean exceedance across complete-event days inside the selection/year.",
    "peak": "Highest daily maximum across complete-event days inside the selection/year.",
    "boundary_policy": "Truncated events/candidates excluded from standard metrics; affected years incomplete and ineligible for trends.",
    "units": {"event_count": "events", "heatwave_days": "days", "duration": "days", "intensity": "°C above threshold", "peak": "°C"},
}


def validate_period(start_year: int, end_year: int) -> None:
    if type(start_year) is not int or type(end_year) is not int or not 1 <= start_year <= end_year <= 9998:
        raise ValueError("Years must be ordered calendar integers between 1 and 9998.")


def _values(starts, days) -> dict:
    durations = [event.duration_days for event in starts]
    return {
        "event_count": len(starts), "heatwave_days": len(days),
        "mean_duration_days": fsum(durations) / len(durations) if durations else None,
        "max_duration_days": max(durations) if durations else None,
        "mean_exceedance_celsius": fsum(day.exceedance_celsius for day in days) / len(days) if days else None,
        "peak_temperature_celsius": max((day.temperature_celsius for day in days), default=None),
    }


def aggregate_metrics(observations: Iterable[tuple[date | str, float | None]],
                      events: Iterable[HeatwaveEvent], start_year: int, end_year: int,
                      *, incomplete_years: Iterable[int] = ()) -> dict:
    validate_period(start_year, end_year)
    start, end = date(start_year, 1, 1), date(end_year, 12, 31)
    observed = {}
    for raw_date, value in observations:
        day = _calendar_date(raw_date)
        if day in observed:
            raise ValueError("Duplicate observation date.")
        observed[day] = _valid_temperature(value)
    incomplete = set(incomplete_years)
    if any(type(year) is not int for year in incomplete):
        raise ValueError("Incomplete years must be calendar integers.")
    included, excluded, occupied = [], [], set()
    for event in events:
        if not event.observed_days:
            raise ValueError("Event must contain observed days.")
        if event.observed_start_date > end or event.observed_end_date < start:
            continue
        previous = None
        for day in event.observed_days:
            if previous is not None and (day.date - previous).days != 1:
                raise ValueError("Event days must be consecutive and ordered.")
            previous = day.date
            if day.date in occupied:
                raise ValueError("Events must not overlap or repeat.")
            occupied.add(day.date)
            if (_valid_temperature(day.temperature_celsius) is None
                    or _valid_temperature(day.exceedance_celsius) is None or day.exceedance_celsius <= 0):
                raise ValueError("Event metrics require finite hot-day values.")
            if start <= day.date <= end and observed.get(day.date) != day.temperature_celsius:
                raise ValueError("Selected event days must match valid weather observations.")
        if event.eligible_for_complete_metrics:
            included.append(event)
        else:
            excluded.append(event)
            incomplete.update(day.date.year for day in event.observed_days if start <= day.date <= end)
    selected_days = [day for event in included for day in event.observed_days if start <= day.date <= end]
    annual = []
    for year in range(start_year, end_year + 1):
        expected = (date(year + 1, 1, 1) - date(year, 1, 1)).days
        valid = sum(value is not None for day, value in observed.items() if day.year == year)
        coverage_ok = valid * 100 >= expected * 95
        reasons = ([] if coverage_ok else ["insufficient_daily_coverage"]) + ([] if year not in incomplete else ["unresolved_event_boundary"])
        complete = not reasons
        annual.append({
            "year": year,
            **_values([event for event in included if event.start_date.year == year],
                      [day for day in selected_days if day.date.year == year]),
            "expected_days": expected, "valid_days": valid, "coverage": valid / expected,
            "complete": complete, "partial": not complete, "incomplete_reasons": reasons,
        })
    complete = all(row["complete"] for row in annual)
    summary = {
        **_values([event for event in included if start <= event.start_date <= end], selected_days),
        "complete": complete, "partial": not complete,
        "eligible_year_count": sum(row["complete"] for row in annual),
        "selected_year_count": len(annual), "excluded_boundary_event_count": len(excluded),
    }
    return {"summary": summary, "annual_metrics": annual,
            "excluded_boundary_events": [event.as_dict() for event in excluded],
            "counting_metadata": {**COUNTING_METADATA, "units": dict(COUNTING_METADATA["units"])}}
