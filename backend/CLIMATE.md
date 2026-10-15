# Baseline threshold (B04)

`app.climate.threshold` contains pure functions and immutable result/coverage
records. It imports no API, weather-provider, settings, or persistence modules.
B05 provides event detection; B06 provides pure aggregation, trends, and insights.

```python
from app.climate.threshold import calculate_threshold, is_hot_day

# One city's normalized daily maxima, including the complete baseline:
result = calculate_threshold(observations)  # iterable of (calendar date, value)
qualifies = is_hot_day(temperature, result.threshold_celsius)
metadata = result.methodology()
```

Dates may be `datetime.date` objects or canonical `YYYY-MM-DD` strings. Datetimes,
malformed dates, and duplicate baseline dates are rejected. Input order does not
matter and inputs are not mutated. A caller can adapt stored B03 year arrays with
`zip(record["dates"], record["temperature_2m_max"])`; storage orchestration remains
outside this module. The caller must provide one city's Celsius daily maxima,
already normalized by B03 (including plausibility bounds and provenance checks).

Only 1990–2020 contributes to the threshold, regardless of selected or boundary
years. The function accepts no selected-range parameter. Missing calendar days,
nulls, booleans, non-numeric values, and non-finite numbers count as absent; no
interpolation or zero substitution occurs. Coverage uses the actual calendar:
**11,323 expected days**, including eight leap days. At least 95% must be valid
overall and in each of the 31 years. For example, a 365-day year requires at least
347 valid days and a 366-day year requires at least 348. Coverage checks use exact
integer comparisons, avoiding rounding a deficient year up to 95%.

`InsufficientBaselineData` includes a safe message, stable
`insufficient_baseline_data` code, coverage records, and inadequate-year IDs.
HTTP error mapping is deferred to API integration. An empty/missing baseline fails
without calling NumPy on an empty sample.

The threshold is the 95th percentile of all valid baseline daily maxima, calculated
with [NumPy's explicit `method="linear"`](https://numpy.org/doc/stable/reference/generated/numpy.percentile.html).
For sorted values `x[0..n-1]`, use rank `h=(n-1)*0.95` and interpolate between the
adjacent values around `h`. Calculation uses float64 and retains the returned
precision. For the manual fixture `x[i]=20+i/1000` with 11,323 dates, `h=10755.9`
and the threshold is **30.7559 °C**. Detection must use the stored numeric threshold;
display rounding must never be fed back into `is_hot_day`.

A hot day is strictly greater than the threshold. Equality is excluded; invalid
observations cannot qualify. An invalid/non-finite threshold raises an error.
Methodology metadata records baseline years, percentile/method/version, full
threshold, units, strict comparison, quality, and limitations. Version:
`annual-p95-linear-v1`.

This is one annual threshold applied to every season, with **no seasonal
adjustment**. It is an application definition, not an official meteorological
heat alert. Calling a day hot does not yet establish a heatwave; event detection
belongs to B05.

Run `backend/.venv/Scripts/python.exe -m pytest backend/tests -q` from the root.
B04 uses synthetic arithmetic/coverage fixtures only. It neither fetches nor
claims to have verified a real 31-year baseline threshold.

## Heatwave events (B05)

`app.climate.events.detect_events(observations, threshold, period_start, period_end)`
is pure and returns immutable event records. It sorts dates, rejects duplicates,
requires loaded context to cover the selected period, and detects at least three
consecutive days strictly above the unrounded B04 threshold. Missing calendar days,
null/invalid values, and threshold equality break runs. Leap days and December–January
are ordinary continuous calendar days. Inputs are not mutated.

Completed runs shorter than three days are discarded. Confirmed runs intersecting
the selection retain full dates, full duration, peak Celsius temperature, mean
threshold exceedance, and daily observations; dates are never clipped to selection.
`started_in_selection` distinguishes prior-year starts from selected-period days.
Per-day observations allow B06 to allocate days to their actual calendar year.

Hot runs touching the first or last loaded day have `truncated_start` or
`truncated_end`. A missing/invalid internal day breaks a run under the methodology;
it is not silently bridged. For an open outer boundary:

- `observed_start_date`, `observed_end_date`, `observed_duration_days`, observed
  peak/mean exceedance, and daily observations describe only the loaded segment.
- The unknown full start/end date is null; full `duration_days`, peak, and mean
  exceedance are null until both boundaries close. No observed duration is presented
  as a complete duration.
- At least three observed hot days confirm qualification even if full extent is
  unknown. One/two hot days at an open edge are retained as **uncertain candidates**
  (`qualification_confirmed=false`), not counted as confirmed heatwaves.
- If the true start is unknown, `started_in_selection` is null unless observed
  days already precede the selection, which proves a prior start.

`app.services.events.detect_with_context(operation, selection, threshold)` coordinates
with an existing B03 operation. It loads required data and examines only the contiguous
loaded component covering the selection. Relevant open runs request adjacent full
years through `extend(direction, from_year=loaded_boundary_year)`, preserving the
same operation deadline, source limits, and unique-year cap. This anchor handles
gaps between the fixed baseline and later selected years. It does not recompute the
threshold. Unrelated open baseline runs do not trigger extra fetching.

Extensions stop when the relevant run closes, ceases to qualify, reaches source/year
limits, or encounters time/provider/validation failure. Failures loading required
initial data and database failures propagate; failed optional extension returns
explicit warning codes and preserves truncation. Stale-weather warnings survive.
The result includes events, loaded context dates, warnings, and selected
`incomplete_years` affected by unresolved boundaries.

**Conservative B06 handoff:** only `eligible_for_complete_metrics=true` events enter
standard event/day totals, duration, intensity, or peak summaries. Truncated confirmed
runs and uncertain candidates remain visible as observed context, excluded from
complete totals. Mark affected selected years incomplete even if their temperature
coverage is >=95%, and exclude them from rolling averages, regression, and comparison
windows. Do not describe resulting partial counts as complete zero-event evidence.
No annual totals or trend calculations are implemented by B05 itself.

## Metrics, trends, and insights (B06)

`app.climate.insights.analyze_metrics(observations, events, start_year, end_year,
incomplete_years=...)` combines the pure B06 functions. Pass B05 events and its
`incomplete_years`, plus normalized weather date/value pairs. It returns `summary`,
`annual_metrics`, `trend`, `insights`, `excluded_boundary_events`, and
`counting_metadata`. API/persistence orchestration remains B07 work. Inputs are not
mutated and no I/O occurs.

Annual event frequency counts complete confirmed events in their actual start
year. Summary count includes only starts within the selection. Mean/max duration
uses the full duration of those events, including days outside the selection/year.
Heatwave days are allocated to the year of each day, including events starting in
a prior year. Intensity is the day-weighted mean exceedance; peak is the highest
temperature among included days within that year/selection. Duration is averaged
by event, not by heatwave day. Thus a year can have zero starts, positive heatwave
days/intensity/peak, and null duration. With no included events/days, counts are
zero and unavailable duration/intensity/peak values are null.

Coverage counts finite normalized observations against actual 365/366-day calendars.
Missing dates and invalid observations never become zeros. Below 95% coverage or
an unresolved B05 boundary makes the year `complete=false`, `partial=true`, with
explicit `incomplete_reasons`. The summary is partial if any selected year is
incomplete. Excluded boundary runs/candidates remain separately visible; incomplete
zero counts must not be interpreted as proof of a complete event-free year.
Aggregation also derives affected boundary years from events, so a caller cannot
accidentally make a truncated run eligible by omitting the explicit B05 year list.
Duplicate observations, overlapping/repeated events, and selected event days that
do not match weather values are rejected rather than double-counted.

`rolling_averages` adds `rolling_average_event_count`: a trailing five-calendar-year
frequency mean only when all five consecutive years exist and are eligible. True
zero-event windows give zero; insufficient/ineligible windows give null.

`describe_trends` fits ordinary least squares to eligible `(calendar year, event
count)` pairs only when at least ten are available. It reports the slope multiplied
by ten (events per decade), fit-year count/list, or an unavailable explanation.
Centering the actual years/counts avoids treating gaps as adjacent observations.
The slope is descriptive and supplies no significance or causal attribution.

For selected spans of at least ten years, compare the first and last five calendar
years only when both windows are fully eligible. Never shift windows to skip gaps
or incomplete years. Report each mean and absolute change in events/year; report
percentage change only with a nonzero initial mean. A zero initial mean gives a
null percentage and an explicit explanation. An incomplete middle year can exclude
itself from regression without invalidating otherwise eligible edge windows.

Insights are generated from these computed values. Short ranges show observed
totals and unavailable-trend explanations. Partial summaries are labelled partial;
unresolved boundaries are described separately. Display rounding in insights does
not change numerical metric/trend values. Units and counting conventions travel
with the output. Tests use synthetic fixtures only; no real-data full analysis is
claimed by B06.
