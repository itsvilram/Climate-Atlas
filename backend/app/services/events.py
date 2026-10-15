"""Coordinate B03 context extension around the pure B05 detector."""

from dataclasses import dataclass
from datetime import date

from ..climate.events import HeatwaveEvent, detect_events
from ..climate.threshold import is_hot_day
from ..schemas import Selection
from .weather import WeatherOperation
from .weather_data import InvalidWeatherPayload
from .weather_provider import ProviderUnavailable, WeatherOperationTimeout


@dataclass(frozen=True)
class EventDetectionResult:
    events: tuple[HeatwaveEvent, ...]
    context_start: date
    context_end: date
    warnings: tuple[str, ...]
    incomplete_years: tuple[int, ...]


def detect_with_context(operation: WeatherOperation, selection: Selection,
                        threshold_celsius: float) -> EventDetectionResult:
    """Use one existing operation/budget; extend only relevant open runs.

    On unavailable context, keep explicit truncation and return safe warnings.
    Failures loading initial required data or database failures still propagate.
    """
    is_hot_day(None, threshold_celsius)
    operation.load_selection(selection)
    start, end = date(selection.start_year, 1, 1), date(selection.end_year, 12, 31)
    blocked = set()
    warnings = set()
    while True:
        low, high = selection.start_year, selection.end_year
        while low - 1 in operation.years:
            low -= 1
        while high + 1 in operation.years:
            high += 1
        observations = []
        for year in range(low, high + 1):
            cached = operation.years[year]
            warnings.update(cached.warnings)
            observations.extend(zip(cached.document["dates"], cached.document["temperature_2m_max"]))
        events = detect_events(observations, threshold_celsius, start, end)
        directions = [direction for direction, open_edge in (
            (-1, any(event.truncated_start for event in events)),
            (1, any(event.truncated_end for event in events)),
        ) if open_edge and direction not in blocked]
        if not directions:
            incomplete = tuple(sorted({day.date.year for event in events if not event.eligible_for_complete_metrics
                                       for day in event.observed_days if start <= day.date <= end}))
            if incomplete:
                warnings.add("unresolved_event_boundary")
            return EventDetectionResult(events, date(low, 1, 1), date(high, 12, 31), tuple(sorted(warnings)), incomplete)
        for direction in directions:
            try:
                loaded = operation.extend(direction, from_year=low if direction == -1 else high)
                if loaded is None:
                    warnings.add("context_source_or_year_limit")
                    blocked.add(direction)
            except WeatherOperationTimeout:
                warnings.add("context_time_limit")
                blocked.add(direction)
            except (ProviderUnavailable, InvalidWeatherPayload):
                warnings.add("context_weather_unavailable")
                blocked.add(direction)
