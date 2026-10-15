from copy import deepcopy
from datetime import date, timedelta
import json

import pytest

from app.climate.events import detect_events
from app.schemas import Selection
from app.services.events import detect_with_context
from app.services.weather import CachedYear
from app.services.weather_data import InvalidWeatherPayload, calendar
from app.services.weather_provider import ProviderUnavailable, WeatherOperationTimeout
from app.repositories.base import DatabaseUnavailable


def series(start, values):
    return [(start + timedelta(days=i), value) for i, value in enumerate(values)]


def detect(values, start=date(2020, 6, 1)):
    observations = series(start, values)
    return detect_events(observations, 10, observations[0][0], observations[-1][0])


@pytest.mark.parametrize("hot_days,count", [(2, 0), (3, 1), (4, 1)])
def test_minimum_closed_run(hot_days, count):
    events = detect([0] + [11] * hot_days + [0])
    assert len(events) == count
    if events:
        assert events[0].duration_days == hot_days
        assert events[0].qualification_confirmed
        assert events[0].eligible_for_complete_metrics


@pytest.mark.parametrize("gap", [None, float("nan"), float("inf"), True, "11", 10])
def test_invalid_missing_or_equal_day_breaks_run(gap):
    events = detect([0, 11, 12, gap, 11, 12, 0])
    assert events == ()


def test_missing_calendar_day_is_not_joined():
    observations = series(date(2020, 1, 1), [0, 11, 12, 11, 12, 0])
    observations = [(day + timedelta(days=1) if i >= 3 else day, value) for i, (day, value) in enumerate(observations)]
    assert detect_events(observations, 10, observations[0][0], observations[-1][0]) == ()


def test_leap_day_is_consecutive():
    event, = detect([0, 11, 12, 13, 0], date(2020, 2, 27))
    assert [day.date.isoformat() for day in event.observed_days] == ["2020-02-28", "2020-02-29", "2020-03-01"]
    assert event.duration_days == 3


def test_cross_year_event_keeps_full_dates_and_metrics_outside_selection():
    observations = series(date(2019, 12, 29), [0, 11, 12, 13, 14, 0])
    event, = detect_events(observations, 10, "2020-01-01", "2020-01-03")
    assert event.start_date == date(2019, 12, 30)
    assert event.end_date == date(2020, 1, 2)
    assert event.started_in_selection is False
    assert event.duration_days == 4
    assert event.peak_temperature_celsius == 14
    assert event.mean_exceedance_celsius == 2.5
    assert len([day for day in event.observed_days if day.date.year == 2020]) == 2
    json.dumps(event.as_dict(), allow_nan=False)


def test_two_distinct_events_and_nonintersecting_runs():
    observations = series(date(2020, 1, 1), [0, 11, 11, 11, 0, 12, 12, 12, 0])
    assert len(detect_events(observations, 10, "2020-01-01", "2020-01-09")) == 2
    event, = detect_events(observations, 10, "2020-01-05", "2020-01-09")
    assert event.start_date == date(2020, 1, 6)


def test_trailing_run_is_finalized_with_unknown_full_duration():
    event, = detect([0, 11, 12, 13])
    assert event.truncated_end and not event.truncated_start
    assert event.start_date == date(2020, 6, 2)
    assert event.end_date is None
    assert event.duration_days is None
    assert event.peak_temperature_celsius is None
    assert event.mean_exceedance_celsius is None
    assert event.observed_peak_temperature_celsius == 13
    assert event.observed_mean_exceedance_celsius == 2
    assert event.started_in_selection is True
    assert not event.eligible_for_complete_metrics


def test_short_open_candidate_is_not_a_confirmed_heatwave():
    event, = detect([0, 11, 12])
    assert not event.qualification_confirmed
    assert event.duration_days is None
    assert event.as_dict()["observed_duration_days"] == 2
    assert not event.eligible_for_complete_metrics


def test_both_open_edges_have_unknown_start_year_and_full_metrics():
    event, = detect([11, 12, 13])
    assert event.truncated_start and event.truncated_end
    assert event.started_in_selection is None
    assert event.start_date is event.end_date is event.duration_days is None
    assert event.qualification_confirmed


def test_unknown_start_before_selection_is_definitely_not_a_selected_start():
    observations = series(date(2019, 12, 31), [11, 12, 13, 0])
    event, = detect_events(observations, 10, "2020-01-01", "2020-01-03")
    assert event.truncated_start
    assert event.started_in_selection is False


def test_order_independence_iso_dates_and_input_immutability():
    observations = series(date(2020, 1, 1), [0, 11, 12, 13, 0])
    original = deepcopy(observations)
    expected = detect_events(observations, 10, "2020-01-01", "2020-01-05")
    assert detect_events(((day.isoformat(), value) for day, value in reversed(observations)), 10,
                         "2020-01-01", "2020-01-05") == expected
    assert observations == original


def test_duplicate_dates_rejected_even_when_null():
    observations = series(date(2020, 1, 1), [0, 11, 12, 13, 0])
    with pytest.raises(ValueError, match="Duplicate"):
        detect_events(observations + [("2020-01-01", None)], 10, "2020-01-01", "2020-01-05")


def test_empty_and_uncovered_selection_fail_clearly():
    with pytest.raises(ValueError, match="cover"):
        detect_events([], 10, "2020-01-01", "2020-01-02")
    with pytest.raises(ValueError, match="cover"):
        detect_events([("2020-01-02", 11)], 10, "2020-01-01", "2020-01-02")
    with pytest.raises(ValueError, match="ordered"):
        detect_events([], 10, "2020-01-02", "2020-01-01")
    with pytest.raises(ValueError, match="finite"):
        detect_events([], float("nan"), "2020-01-01", "2020-01-02")


def test_cold_context_and_internal_short_run_produce_no_event():
    assert detect([0, 0, 0]) == ()
    assert detect([0, 11, 0]) == ()


def block(year, hot_dates=(), all_hot=False):
    dates = calendar(year)
    hot = set(hot_dates)
    return CachedYear({"dates": dates, "temperature_2m_max": [11 if all_hot or day in hot else 0 for day in dates]}, "hit")


class FakeOperation:
    def __init__(self, loaded, available=None, failure=None):
        self.years = dict(loaded)
        self.available = dict(available or {})
        self.failure = failure
        self.calls = []

    def load_selection(self, selection):
        return dict(self.years)

    def extend(self, direction, *, from_year):
        year = from_year + direction
        self.calls.append(year)
        if self.failure:
            raise self.failure()
        value = self.available.get(year)
        if value is not None:
            self.years[year] = value
        return value


def test_right_extension_confirms_three_day_run():
    operation = FakeOperation({2020: block(2020, ["2020-12-30", "2020-12-31"])},
                              {2021: block(2021, ["2021-01-01"])})
    result = detect_with_context(operation, Selection(start_year=2020, end_year=2020), 10)
    event, = result.events
    assert operation.calls == [2021]
    assert event.duration_days == 3
    assert event.end_date == date(2021, 1, 1)
    assert event.started_in_selection is True
    assert result.warnings == result.incomplete_years == ()


def test_extension_can_disqualify_short_candidate():
    operation = FakeOperation({2020: block(2020, ["2020-12-30", "2020-12-31"])}, {2021: block(2021)})
    result = detect_with_context(operation, Selection(start_year=2020, end_year=2020), 10)
    assert result.events == ()
    assert result.incomplete_years == ()


def test_left_extension_preserves_previous_year_start():
    operation = FakeOperation({2020: block(2020, ["2020-01-01", "2020-01-02"])},
                              {2019: block(2019, ["2019-12-31"])})
    result = detect_with_context(operation, Selection(start_year=2020, end_year=2020), 10)
    event, = result.events
    assert operation.calls == [2019]
    assert event.start_date == date(2019, 12, 31)
    assert event.duration_days == 3
    assert event.started_in_selection is False


def test_extension_repeats_only_while_relevant_run_is_open():
    operation = FakeOperation({2020: block(2020, ["2020-12-30", "2020-12-31"])},
                              {2021: block(2021, all_hot=True), 2022: block(2022)})
    result = detect_with_context(operation, Selection(start_year=2020, end_year=2020), 10)
    event, = result.events
    assert operation.calls == [2021, 2022]
    assert event.duration_days == 367
    assert result.context_end == date(2022, 12, 31)


def test_source_or_year_limit_retains_truncation_and_marks_selected_year():
    operation = FakeOperation({2025: block(2025, ["2025-12-30", "2025-12-31"])})
    result = detect_with_context(operation, Selection(start_year=2025, end_year=2025), 10)
    event, = result.events
    assert not event.qualification_confirmed
    assert event.truncated_end
    assert result.incomplete_years == (2025,)
    assert set(result.warnings) == {"context_source_or_year_limit", "unresolved_event_boundary"}


@pytest.mark.parametrize("failure,warning", [(WeatherOperationTimeout, "context_time_limit"), (ProviderUnavailable, "context_weather_unavailable"), (InvalidWeatherPayload, "context_weather_unavailable")])
def test_extension_failure_is_explicit_and_finite(failure, warning):
    operation = FakeOperation({2020: block(2020, ["2020-12-29", "2020-12-30", "2020-12-31"])}, failure=failure)
    result = detect_with_context(operation, Selection(start_year=2020, end_year=2020), 10)
    event, = result.events
    assert event.qualification_confirmed and not event.eligible_for_complete_metrics
    assert event.duration_days is None
    assert len(operation.calls) == 1
    assert result.incomplete_years == (2020,)
    assert warning in result.warnings


def test_database_failure_is_not_silently_treated_as_context_limit():
    operation = FakeOperation({2020: block(2020, ["2020-12-31"])}, failure=DatabaseUnavailable)
    with pytest.raises(DatabaseUnavailable):
        detect_with_context(operation, Selection(start_year=2020, end_year=2020), 10)


def test_gapped_baseline_does_not_hide_selection_context_edge():
    # Baseline 2020 is separated from selected 2024 context by missing 2021/2022.
    operation = FakeOperation({2020: block(2020), 2023: block(2023, all_hot=True),
                               2024: block(2024, ["2024-01-01", "2024-01-02"])},
                              {2022: block(2022)})
    result = detect_with_context(operation, Selection(start_year=2024, end_year=2024), 10)
    event, = result.events
    assert operation.calls == [2022]
    assert event.start_date == date(2023, 1, 1)
    assert event.duration_days == 367


def test_unrelated_open_baseline_run_does_not_trigger_extensions():
    operation = FakeOperation({1990: block(1990, ["1990-01-01"]), 2024: block(2024)})
    result = detect_with_context(operation, Selection(start_year=2024, end_year=2024), 10)
    assert operation.calls == []
    assert result.events == ()


def test_stale_context_warning_survives_coordination():
    year = block(2020)
    year.warnings = ("stale_weather_data",)
    result = detect_with_context(FakeOperation({2020: year}), Selection(start_year=2020, end_year=2020), 10)
    assert result.warnings == ("stale_weather_data",)


def test_both_unresolved_edges_stop_and_mark_incomplete():
    operation = FakeOperation({2020: block(2020, all_hot=True)})
    result = detect_with_context(operation, Selection(start_year=2020, end_year=2020), 10)
    event, = result.events
    assert operation.calls == [2019, 2021]
    assert event.truncated_start and event.truncated_end
    assert event.started_in_selection is None
    assert result.incomplete_years == (2020,)
    assert not event.eligible_for_complete_metrics
