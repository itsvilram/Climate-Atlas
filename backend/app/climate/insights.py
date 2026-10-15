"""Metric-derived statements; no hard-coded change, significance, or attribution."""

from .metrics import aggregate_metrics
from .trends import describe_trends, rolling_averages


def build_insights(summary: dict, trend: dict) -> list[str]:
    label = "Partial observed totals" if summary["partial"] else "Observed totals"
    insights = [f"{label}: {summary['event_count']} event starts and {summary['heatwave_days']} heatwave days in the selected period."]
    if summary["excluded_boundary_event_count"]:
        insights.append(f"{summary['excluded_boundary_event_count']} unresolved boundary runs/candidates are shown separately and excluded from standard totals.")
    regression = trend["regression"]
    if regression["slope_events_per_decade"] is None:
        insights.append(regression["reason"])
    else:
        insights.append(f"Descriptive event-count slope: {regression['slope_events_per_decade']:+.2f} events per decade across {regression['fit_year_count']} eligible years.")
    comparison = trend["comparison"]
    if comparison["reason"]:
        insights.append(comparison["reason"])
    elif comparison["percent_change"] is None:
        insights.append(f"First/last five-year means differ by {comparison['absolute_change_events_per_year']:+.2f} events per year; percentage change is unavailable because the initial mean is zero.")
    else:
        insights.append(f"First/last five-year mean event count changed by {comparison['percent_change']:+.1f}% ({comparison['absolute_change_events_per_year']:+.2f} events per year).")
    return insights


def analyze_metrics(observations, events, start_year: int, end_year: int, *, incomplete_years=()) -> dict:
    """Pure B06 entry point for later API orchestration; no persistence or I/O."""
    result = aggregate_metrics(observations, events, start_year, end_year, incomplete_years=incomplete_years)
    result["annual_metrics"] = rolling_averages(result["annual_metrics"])
    result["trend"] = describe_trends(result["annual_metrics"], start_year, end_year)
    result["insights"] = build_insights(result["summary"], result["trend"])
    return result
