"""Descriptive frequency trends using eligible calendar years only."""

from math import fsum

from .metrics import validate_period


def _rows(annual_metrics):
    rows = {}
    for row in annual_metrics:
        year, count, complete = row["year"], row["event_count"], row["complete"]
        if type(year) is not int or not 1 <= year <= 9998 or year in rows:
            raise ValueError("Annual years must be unique calendar integers.")
        if type(count) is not int or count < 0 or type(complete) is not bool:
            raise ValueError("Annual counts must be nonnegative integers with explicit completeness.")
        rows[year] = dict(row)
    return dict(sorted(rows.items()))


def rolling_averages(annual_metrics) -> list[dict]:
    rows = _rows(annual_metrics)
    for year, row in rows.items():
        window = [rows.get(previous) for previous in range(year - 4, year + 1)]
        row["rolling_average_event_count"] = (
            fsum(item["event_count"] for item in window) / 5
            if all(item is not None and item["complete"] for item in window) else None
        )
    return list(rows.values())


def describe_trends(annual_metrics, start_year: int, end_year: int) -> dict:
    validate_period(start_year, end_year)
    rows = _rows(annual_metrics)
    if any(year < start_year or year > end_year for year in rows):
        raise ValueError("Annual metrics must be inside the selected period.")
    eligible = [(year, row["event_count"]) for year, row in rows.items() if row["complete"]]
    regression = {"slope_events_per_decade": None, "fit_year_count": len(eligible),
                  "fit_years": [year for year, _ in eligible], "reason": None,
                  "interpretation": "Descriptive linear event-count change; no significance or causal claim."}
    if len(eligible) < 10:
        regression["reason"] = "At least 10 eligible years are required for a regression trend."
    else:
        mean_year = fsum(year for year, _ in eligible) / len(eligible)
        mean_count = fsum(count for _, count in eligible) / len(eligible)
        slope = fsum((year - mean_year) * (count - mean_count) for year, count in eligible) / fsum((year - mean_year) ** 2 for year, _ in eligible)
        regression["slope_events_per_decade"] = slope * 10
    comparison = {"first_window": None, "last_window": None,
                  "absolute_change_events_per_year": None, "percent_change": None,
                  "reason": None, "percentage_unavailable_reason": None}
    if end_year - start_year + 1 < 10:
        comparison["reason"] = "At least 10 selected calendar years are required for a first/last five-year comparison."
    else:
        first = list(range(start_year, start_year + 5))
        last = list(range(end_year - 4, end_year + 1))
        if not all(year in rows and rows[year]["complete"] for year in first + last):
            comparison["reason"] = "Both first/last five-calendar-year windows must contain only eligible years."
        else:
            initial = fsum(rows[year]["event_count"] for year in first) / 5
            final = fsum(rows[year]["event_count"] for year in last) / 5
            comparison["first_window"] = {"start_year": first[0], "end_year": first[-1], "mean_event_count": initial}
            comparison["last_window"] = {"start_year": last[0], "end_year": last[-1], "mean_event_count": final}
            comparison["absolute_change_events_per_year"] = final - initial
            if initial == 0:
                comparison["percentage_unavailable_reason"] = "The initial five-year mean is zero; report absolute change."
            else:
                comparison["percent_change"] = (final - initial) / initial * 100
    return {"regression": regression, "comparison": comparison}
