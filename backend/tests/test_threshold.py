from datetime import date, datetime, timedelta
import json
import math

import numpy as np
import pytest

from app.climate.threshold import InsufficientBaselineData, calculate_threshold, is_hot_day


def days(year):
    first = date(year, 1, 1)
    return [first + timedelta(days=i) for i in range((date(year + 1, 1, 1) - first).days)]


@pytest.fixture
def baseline():
    dates = [day for year in range(1990, 2021) for day in days(year)]
    return [(day, 20 + i / 1000) for i, day in enumerate(dates)]


def test_percentile_matches_independent_manual_fixture_and_keeps_precision(baseline):
    result = calculate_threshold(baseline)
    # 11,323 values: sorted x[i] = 20 + i/1000.
    # Linear rank=(n-1)*.95=10,755.9, interpolating x[10755] and x[10756].
    assert result.threshold_celsius == pytest.approx(30.7559, rel=0, abs=1e-12)
    assert result.threshold_celsius != round(result.threshold_celsius, 2)
    assert not is_hot_day(result.threshold_celsius, result.threshold_celsius)
    assert is_hot_day(math.nextafter(result.threshold_celsius, math.inf), result.threshold_celsius)


@pytest.mark.parametrize("start,end", [(1990, 2020), (1990, 2025), (2000, 2010), (2021, 2025)])
def test_different_selected_ranges_keep_fixed_baseline_threshold(baseline, start, end):
    # Baseline is always present; additional selected/context years cannot move it.
    extra = [(day, 1000.0) for year in range(start - 1, end + 2) if year < 1990 or year > 2020 for day in days(year)]
    assert calculate_threshold(baseline + extra).threshold_celsius == calculate_threshold(baseline).threshold_celsius


def test_leap_year_denominators_and_metadata(baseline):
    result = calculate_threshold(baseline)
    coverage = result.baseline_coverage
    assert coverage.expected_days == coverage.valid_days == 11323
    years = {year.year: year for year in coverage.years}
    assert years[2000].expected_days == years[2020].expected_days == 366
    assert years[1990].expected_days == 365
    assert sum(year.expected_days == 366 for year in coverage.years) == 8
    metadata = result.methodology()
    assert metadata["baseline_start_year"] == 1990
    assert metadata["baseline_end_year"] == 2020
    assert metadata["comparison"] == ">"
    assert metadata["percentile_method"] == "linear"
    assert metadata["temperature_unit"] == "\u00b0C"
    assert metadata["seasonal_adjustment"] is False
    assert "not an official" in metadata["limitation"]
    assert metadata["threshold_celsius"] == result.threshold_celsius
    json.dumps(metadata, allow_nan=False)


@pytest.mark.parametrize("year,kept,passes", [(1990, 347, True), (1990, 346, False), (2020, 348, True), (2020, 347, False)])
def test_per_year_95_percent_boundary(baseline, year, kept, passes):
    retained = set(days(year)[:kept])
    data = [(day, value) for day, value in baseline if day.year != year or day in retained]
    if passes:
        assert calculate_threshold(data).baseline_coverage.eligible
    else:
        with pytest.raises(InsufficientBaselineData) as error:
            calculate_threshold(data)
        assert error.value.inadequate_years == (year,)
        # Total coverage alone would pass, but this year must still reject it.
        assert error.value.coverage.coverage > 0.95


def test_overall_coverage_insufficient_and_whole_year_absence(baseline):
    with pytest.raises(InsufficientBaselineData) as error:
        calculate_threshold([])
    assert error.value.coverage.valid_days == 0
    assert error.value.coverage.expected_days == 11323
    with pytest.raises(InsufficientBaselineData) as error:
        calculate_threshold([(day, value) for day, value in baseline if day.year != 2001])
    assert error.value.inadequate_years == (2001,)


@pytest.mark.parametrize("invalid", [None, float("nan"), float("inf"), -float("inf"), True, "30", 10**1000])
def test_invalid_values_count_as_missing_without_becoming_zero(baseline, invalid):
    data = [(day, invalid if day.year == 2020 else value) for day, value in baseline]
    with pytest.raises(InsufficientBaselineData) as error:
        calculate_threshold(data)
    assert error.value.inadequate_years == (2020,)
    assert error.value.coverage.valid_days == 11323 - 366
    assert not is_hot_day(invalid, 30)


def test_nulls_within_coverage_limit_are_omitted_from_percentile(baseline):
    # Removing one smallest value gives n=11322; rank=10754.95, original index=10755.95.
    baseline[0] = (baseline[0][0], None)
    assert calculate_threshold(baseline).threshold_celsius == pytest.approx(30.75595, rel=0, abs=1e-12)


def test_duplicate_baseline_day_cannot_inflate_coverage(baseline):
    with pytest.raises(ValueError, match="Duplicate baseline date"):
        calculate_threshold(baseline + [(baseline[0][0], None)])


@pytest.mark.parametrize("bad_date", ["2020-02-30", "20200101", "2020-1-1", datetime(2020, 1, 1), None])
def test_malformed_dates_are_rejected(baseline, bad_date):
    with pytest.raises(ValueError, match="calendar dates"):
        calculate_threshold([(bad_date, 30)] + baseline)


def test_iso_dates_generators_order_and_input_are_preserved(baseline):
    original = list(baseline)
    expected = calculate_threshold(baseline)
    result = calculate_threshold((day.isoformat(), value) for day, value in reversed(baseline))
    assert result == expected
    assert baseline == original


def test_constant_baseline_and_strict_exceedance(baseline):
    result = calculate_threshold((day, 35.125) for day, _ in baseline)
    assert result.threshold_celsius == 35.125
    assert not is_hot_day(35.125, result.threshold_celsius)
    assert not is_hot_day(35.124, result.threshold_celsius)
    assert is_hot_day(np.float64(35.126), result.threshold_celsius)


@pytest.mark.parametrize("bad_threshold", [None, True, "30", float("nan"), float("inf")])
def test_invalid_threshold_is_an_error(bad_threshold):
    with pytest.raises(ValueError, match="finite number"):
        is_hot_day(40, bad_threshold)


def test_selected_subset_without_full_baseline_is_rejected(baseline):
    with pytest.raises(InsufficientBaselineData) as error:
        calculate_threshold((day, value) for day, value in baseline if 2000 <= day.year <= 2010)
    assert error.value.code == "insufficient_baseline_data"
    assert 1990 in error.value.inadequate_years
    assert 2020 in error.value.inadequate_years


def test_missing_days_in_every_year_retain_full_calendar_denominator(baseline):
    # Retain the minimum adequate count per year, including leap years.
    retained = {day for year in range(1990, 2021) for day in days(year)[:math.ceil(len(days(year)) * 0.95)]}
    result = calculate_threshold((day, value) for day, value in baseline if day in retained)
    assert result.baseline_coverage.expected_days == 11323
    assert result.baseline_coverage.valid_days == 10765
    assert result.baseline_coverage.coverage >= 0.95
    assert all(year.eligible for year in result.baseline_coverage.years)
