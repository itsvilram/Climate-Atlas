from copy import deepcopy
from datetime import date, timedelta
import json

import pytest

from app.climate.events import detect_events
from app.climate.insights import analyze_metrics, build_insights
from app.climate.metrics import aggregate_metrics
from app.climate.trends import describe_trends, rolling_averages


def observations(first, last, hot=None):
    hot = hot or {}
    return [(first + timedelta(days=i), hot.get(first + timedelta(days=i), 20.0))
            for i in range((last - first).days + 1)]


def rows(first, counts, incomplete=()):
    return [{"year": first + i, "event_count": count, "complete": first + i not in incomplete}
            for i, count in enumerate(counts)]


def test_cross_year_allocations_reconcile_and_previous_start_has_duration_null():
    hot = {date(2019, 12, 30): 31, date(2019, 12, 31): 32,
           date(2020, 1, 1): 33, date(2020, 1, 2): 34}
    weather = observations(date(2019, 1, 1), date(2020, 12, 31), hot)
    events = detect_events(weather, 30, "2019-01-01", "2020-12-31")
    result = analyze_metrics(weather, events, 2019, 2020)
    first, last = result["annual_metrics"]
    assert (first["event_count"], last["event_count"]) == (1, 0)
    assert (first["heatwave_days"], last["heatwave_days"]) == (2, 2)
    assert first["mean_duration_days"] == 4
    assert last["mean_duration_days"] is None
    assert first["mean_exceedance_celsius"] == 1.5
    assert last["mean_exceedance_celsius"] == 3.5
    assert result["summary"]["mean_exceedance_celsius"] == 2.5
    assert result["summary"]["heatwave_days"] == sum(row["heatwave_days"] for row in result["annual_metrics"])
    assert result["summary"]["event_count"] == sum(row["event_count"] for row in result["annual_metrics"])
    selected = aggregate_metrics(weather, events, 2020, 2020)
    assert selected["summary"]["event_count"] == 0
    assert selected["summary"]["heatwave_days"] == 2
    assert selected["summary"]["mean_duration_days"] is None
    assert selected["summary"]["peak_temperature_celsius"] == 34


def test_full_duration_and_selected_period_peak_intensity():
    hot = {date(2020, 12, 30): 31, date(2020, 12, 31): 32,
           date(2021, 1, 1): 39}
    weather = observations(date(2020, 1, 1), date(2021, 1, 2), hot)
    events = detect_events(weather, 30, "2020-01-01", "2020-12-31")
    summary = aggregate_metrics(weather, events, 2020, 2020)["summary"]
    assert summary["event_count"] == 1 and summary["heatwave_days"] == 2
    assert summary["mean_duration_days"] == summary["max_duration_days"] == 3
    assert summary["peak_temperature_celsius"] == 32
    assert summary["mean_exceedance_celsius"] == 1.5


def test_day_weighted_mean_is_not_average_of_year_means():
    hot = {date(2019, 12, 31): 31, date(2020, 1, 1): 33, date(2020, 1, 2): 35}
    weather = observations(date(2019, 1, 1), date(2020, 12, 31), hot)
    events = detect_events(weather, 30, "2019-01-01", "2020-12-31")
    summary = aggregate_metrics(weather, events, 2019, 2020)["summary"]
    assert summary["mean_exceedance_celsius"] == 3
    assert summary["mean_exceedance_celsius"] != 2.5


def test_no_events_zero_counts_null_metrics_and_json_safe_metadata():
    weather = observations(date(2020, 1, 1), date(2020, 12, 31))
    result = analyze_metrics(weather, [], 2020, 2020)
    summary = result["summary"]
    assert summary["event_count"] == summary["heatwave_days"] == 0
    for field in ["mean_duration_days", "max_duration_days", "mean_exceedance_celsius", "peak_temperature_celsius"]:
        assert summary[field] is None
    assert summary["complete"] and not summary["partial"]
    assert result["annual_metrics"][0]["expected_days"] == 366
    assert result["counting_metadata"]["units"]["duration"] == "days"
    json.dumps(result, allow_nan=False)


@pytest.mark.parametrize("year,missing,complete", [(2019, 18, True), (2019, 19, False), (2020, 18, True), (2020, 19, False)])
def test_calendar_coverage_threshold(year, missing, complete):
    weather = observations(date(year, 1, 1), date(year, 12, 31))[missing:]
    row, = aggregate_metrics(weather, [], year, year)["annual_metrics"]
    assert row["complete"] is complete
    assert row["partial"] is not complete
    assert row["valid_days"] == row["expected_days"] - missing


def test_truncated_runs_are_excluded_and_high_coverage_year_is_incomplete():
    weather = observations(date(2020, 1, 1), date(2020, 12, 31), {
        date(2020, 12, 29): 31, date(2020, 12, 30): 32, date(2020, 12, 31): 33})
    events = detect_events(weather, 30, "2020-01-01", "2020-12-31")
    result = analyze_metrics(weather, events, 2020, 2020)
    row, = result["annual_metrics"]
    assert row["coverage"] == 1
    assert not row["complete"] and row["event_count"] == row["heatwave_days"] == 0
    assert "unresolved_event_boundary" in row["incomplete_reasons"]
    assert result["summary"]["excluded_boundary_event_count"] == 1
    assert result["excluded_boundary_events"][0]["duration_days"] is None
    assert result["insights"][0].startswith("Partial observed totals")
    assert "shown separately" in result["insights"][1]


def test_uncertain_short_candidate_and_explicit_b05_incomplete_years():
    weather = observations(date(2020, 1, 1), date(2020, 12, 31), {date(2020, 12, 31): 31})
    events = detect_events(weather, 30, "2020-01-01", "2020-12-31")
    result = aggregate_metrics(weather, events, 2020, 2020)
    assert not result["excluded_boundary_events"][0]["qualification_confirmed"]
    assert not result["summary"]["complete"]
    result = aggregate_metrics(weather, [], 2020, 2020, incomplete_years=(2020,))
    assert not result["annual_metrics"][0]["complete"]


def test_rolling_averages_need_five_consecutive_eligible_years():
    annual = rows(2000, list(range(10)), incomplete=(2005,))
    original = deepcopy(annual)
    result = rolling_averages(annual)
    assert all(row["rolling_average_event_count"] is None for row in result[:4])
    assert result[4]["rolling_average_event_count"] == 2
    assert all(row["rolling_average_event_count"] is None for row in result[5:])
    assert annual == original
    assert all(row["rolling_average_event_count"] is None for row in rolling_averages([row for row in annual if row["year"] != 2002]))
    assert rolling_averages(rows(2000, [0] * 5))[-1]["rolling_average_event_count"] == 0


def test_regression_uses_actual_calendar_years_and_reports_per_decade():
    years = [2000, 2001, 2002, 2005, 2006, 2009, 2012, 2013, 2018, 2020]
    annual = [{"year": year, "event_count": (year - 2000) * 2, "complete": True} for year in years]
    result = describe_trends(annual, 2000, 2020)["regression"]
    assert result["slope_events_per_decade"] == pytest.approx(20)
    assert result["fit_year_count"] == 10 and result["fit_years"] == years
    assert describe_trends(rows(2000, [2] * 10), 2000, 2009)["regression"]["slope_events_per_decade"] == 0


def test_ineligible_year_is_not_fit_and_outlier_cannot_change_slope():
    annual = rows(2000, list(range(10)) + [10000], incomplete=(2010,))
    result = describe_trends(annual, 2000, 2010)["regression"]
    assert result["fit_year_count"] == 10
    assert result["slope_events_per_decade"] == pytest.approx(10)
    annual[0]["complete"] = False
    result = describe_trends(annual, 2000, 2010)["regression"]
    assert result["slope_events_per_decade"] is None and "10 eligible" in result["reason"]


def test_zero_initial_comparison_reports_absolute_change_not_percentage():
    comparison = describe_trends(rows(2000, [0] * 5 + [2] * 5), 2000, 2009)["comparison"]
    assert comparison["absolute_change_events_per_year"] == 2
    assert comparison["percent_change"] is None
    assert "zero" in comparison["percentage_unavailable_reason"]
    both_zero = describe_trends(rows(2000, [0] * 10), 2000, 2009)["comparison"]
    assert both_zero["absolute_change_events_per_year"] == 0 and both_zero["percent_change"] is None


def test_nonzero_comparison_and_incomplete_windows():
    annual = rows(2000, [2] * 5 + [4] * 5)
    comparison = describe_trends(annual, 2000, 2009)["comparison"]
    assert comparison["percent_change"] == 100
    assert comparison["absolute_change_events_per_year"] == 2
    annual[0]["complete"] = False
    comparison = describe_trends(annual, 2000, 2009)["comparison"]
    assert comparison["percent_change"] is None and "eligible" in comparison["reason"]
    # A middle incomplete year does not invalidate otherwise eligible edge windows.
    annual = rows(2000, [2] * 11, incomplete=(2005,))
    assert describe_trends(annual, 2000, 2010)["comparison"]["percent_change"] == 0


def test_comparison_does_not_shift_calendar_windows_around_gaps():
    annual = [row for row in rows(2000, [2] * 15) if row["year"] != 2001]
    comparison = describe_trends(annual, 2000, 2014)["comparison"]
    assert comparison["absolute_change_events_per_year"] is None
    assert comparison["reason"]


def test_short_range_has_unavailable_trend_explanations_and_no_percentage_claim():
    weather = observations(date(2020, 1, 1), date(2020, 12, 31))
    result = analyze_metrics(weather, [], 2020, 2020)
    assert result["trend"]["regression"]["reason"]
    assert result["trend"]["comparison"]["reason"]
    assert all("%" not in insight for insight in result["insights"])
    assert any("10 selected" in insight for insight in result["insights"])


def test_insights_derive_slope_and_zero_comparison_from_metrics():
    trend = describe_trends(rows(2000, [0] * 5 + [2] * 5), 2000, 2009)
    summary = {"partial": False, "event_count": 10, "heatwave_days": 30, "excluded_boundary_event_count": 0}
    insights = build_insights(summary, trend)
    assert "10 event starts and 30 heatwave days" in insights[0]
    assert any("Descriptive" in value and "events per decade" in value for value in insights)
    assert any("+2.00 events per year" in value and "initial mean is zero" in value for value in insights)
    assert not any("caused" in value or "significant" in value for value in insights)


def test_invalid_duplicate_observations_overlapping_events_and_inputs_fail():
    weather = observations(date(2020, 1, 1), date(2020, 12, 31), {
        date(2020, 6, 1): 31, date(2020, 6, 2): 32, date(2020, 6, 3): 33})
    events = detect_events(weather, 30, "2020-01-01", "2020-12-31")
    with pytest.raises(ValueError, match="Duplicate"):
        aggregate_metrics(weather + [weather[0]], events, 2020, 2020)
    with pytest.raises(ValueError, match="overlap"):
        aggregate_metrics(weather, events + events, 2020, 2020)
    with pytest.raises(ValueError, match="match"):
        aggregate_metrics([(day, 20) for day, _ in weather], events, 2020, 2020)
    for start, end in [(2021, 2020), (True, 2020), (2020.0, 2021)]:
        with pytest.raises(ValueError):
            aggregate_metrics([], [], start, end)
    with pytest.raises(ValueError):
        describe_trends(rows(2000, [1, 2]) + rows(2000, [3]), 2000, 2001)
    with pytest.raises(ValueError):
        describe_trends(rows(1999, [1]), 2000, 2001)


def test_end_to_end_pure_result_does_not_mutate_inputs():
    weather = observations(date(2020, 1, 1), date(2020, 12, 31))
    before = deepcopy(weather)
    first = analyze_metrics(weather, [], 2020, 2020)
    assert analyze_metrics(weather, [], 2020, 2020) == first
    assert weather == before


def test_duration_is_event_weighted_while_intensity_is_day_weighted():
    hot = {date(2020, 6, 1) + timedelta(days=i): 31 for i in range(3)}
    hot.update({date(2020, 7, 1) + timedelta(days=i): 35 for i in range(5)})
    weather = observations(date(2020, 1, 1), date(2020, 12, 31), hot)
    events = detect_events(weather, 30, "2020-01-01", "2020-12-31")
    summary = aggregate_metrics(weather, events, 2020, 2020)["summary"]
    assert summary["event_count"] == 2
    assert summary["heatwave_days"] == 8
    assert summary["mean_duration_days"] == 4 and summary["max_duration_days"] == 5
    assert summary["mean_exceedance_celsius"] == 28 / 8


def test_boundary_incomplete_year_flows_through_rolling_fit_and_comparison():
    hot = {date(year, 6, 1) + timedelta(days=i): 31 for year in range(2000, 2010) for i in range(3)}
    hot.update({date(2009, 12, 29) + timedelta(days=i): 32 for i in range(3)})
    weather = observations(date(2000, 1, 1), date(2009, 12, 31), hot)
    events = detect_events(weather, 30, "2000-01-01", "2009-12-31")
    result = analyze_metrics(weather, events, 2000, 2009)
    last = result["annual_metrics"][-1]
    assert last["coverage"] == 1 and not last["complete"]
    assert last["event_count"] == 1 and last["heatwave_days"] == 3
    assert last["rolling_average_event_count"] is None
    assert result["trend"]["regression"]["fit_year_count"] == 9
    assert result["trend"]["regression"]["slope_events_per_decade"] is None
    assert result["trend"]["comparison"]["reason"]
    assert result["summary"]["partial"]


def test_decreasing_counts_have_negative_slope_and_percentage():
    trend = describe_trends(rows(2000, list(range(10, 0, -1))), 2000, 2009)
    assert trend["regression"]["slope_events_per_decade"] == pytest.approx(-10)
    comparison = describe_trends(rows(2000, [4] * 5 + [2] * 5), 2000, 2009)["comparison"]
    assert comparison["absolute_change_events_per_year"] == -2
    assert comparison["percent_change"] == -50
