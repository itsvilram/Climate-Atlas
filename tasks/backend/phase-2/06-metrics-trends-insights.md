# B06: Metrics, trends, and insights

Phase: 2

Status: Accepted

## Problem

Counts and trend statements can mislead if event boundaries, missing data, or zero denominators are ignored.

## Proposed solution (no code)

Count events by start year and allocate heatwave days to their actual years. Calculate duration, peak, and mean threshold exceedance using APP_PLAN.md conventions. Zero events give zero counts and null other metrics. Years below 95% coverage are partial and excluded from trends. Add complete five-year rolling windows, descriptive regression with at least ten eligible years, and first/last five-year comparisons for ranges of at least ten years. Generate evidence-based insights.

## Dependencies

B05 reviewed and accepted.

## Deliverables

Annual and summary metrics; descriptive trend functions; insight rules; explicit units/counting metadata.

## Completion checks

- [x] Cross-year allocation reconciles
- [x] null differs from zero
- [x] actual years enter regression
- [x] incomplete windows are excluded
- [x] zero baseline yields absolute change
- [x] short ranges explain unavailable trends.

## Review focus

B05 boundary policy: use only `eligible_for_complete_metrics=true` events in
standard totals and summaries. Keep truncated confirmed segments and uncertain
candidates visible separately; their observed duration is not a full duration.
Union B05 `incomplete_years` with coverage-incomplete years, excluding them from
rolling/regression/comparison windows even when daily coverage is >=95%. Partial
counts must not be described as complete zero-event evidence.

Check summary/annual definitions, unresolved boundary uncertainty, comparison windows, and claims. Do not assert causation or statistical significance.

## Implementation evidence

Implemented and verified on 15 October 2026 after B05 acceptance (“do next”).
Read B06 problem, solution, dependencies, checks, review focus, and related plans
before coding. No applicable AGENTS.md found in workspace or ancestors.

Changed files:

- `backend/app/climate/metrics.py`: pure annual/summary aggregation, actual-calendar
  coverage, boundary/coverage eligibility, full-event vs selected-day conventions,
  null metrics, excluded-run details, validation, and units/counting metadata.
- `backend/app/climate/trends.py`: complete trailing five-year averages, centered
  least-squares regression on actual eligible calendar years, ten-year minimum,
  first/last calendar-window comparisons, zero-denominator handling/explanations.
- `backend/app/climate/insights.py`: pure B06 composition and metric-derived insight
  statements, including partial/unavailable labels; no significance/causal claims.
- `backend/tests/test_metrics.py`: completion checks and boundary/weighting/review
  regressions using synthetic fixtures only.
- `backend/CLIMATE.md`, `backend/README.md`: public calculation contracts, units,
  weighting, eligibility, and limitations.
- B05/B06 task files and backend task index: acceptance/status/evidence.

Verification:

- `backend/.venv/Scripts/python.exe -m pytest backend/tests -q --tb=short`:
  **183 passed**, one pre-existing Starlette HTTPX deprecation warning, 12.75 seconds.
- `backend/.venv/Scripts/python.exe -m pip check`: **No broken requirements found**.
- After review added three weighting/boundary/decreasing-trend cases, ran
  `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_metrics.py -q --tb=short`:
  **23 passed**, 0.27 seconds, including all three new cases.
- Cross-year fixture: one four-day event starts 30 December 2019 and ends
  2 January 2020. Annual start counts are 1/0, days 2/2; full duration is four
  days in the start year and null in the following year. Summary counts/day totals
  reconcile; a 2020-only selection has zero starts and two days with positive
  intensity/peak and null duration.
- Verified full duration includes post-selection days while selected intensity/peak
  exclude them; summary intensity is day-weighted, duration event-weighted.
- Missing/null/invalid weather retains full calendar denominators; leap/non-leap
  95% cutoffs pass/fail correctly. No events gives zero counts and null metrics.
- B05 boundary runs/candidates are separately visible and excluded; affected years
  are partial even at full daily coverage. End-to-end test proves this also removes
  them from rolling windows, regression, and edge-window comparisons.
- Regression fixture uses nonconsecutive actual years and counts twice their offset:
  expected **20 events/decade**. Ineligible outlier exclusion, insufficient fit years,
  constant and decreasing slopes are checked.
- Rolling windows require five consecutive eligible years, retaining real zeroes.
  Comparisons use fixed first/last five calendar years; missing/ineligible windows
  are unavailable, a zero first mean reports absolute change, and shorter selections
  explain unavailable trends without a percentage claim.
- Output is JSON-safe, input collections remain unchanged, and duplicate observations,
  overlapping events, mismatched event/weather values, and invalid years fail clearly.

External verification limits: this pure calculation task uses synthetic fixtures;
it does not fetch weather, write to Atlas, or claim a full real-data analysis. No
API integration, rate-limiter/deployment, frontend, or submission work was started.
Secrets and PROBLEM.md remain excluded; local .env was not changed.

## Findings and fixes

- Reviewed annual/summary definitions against APP_PLAN.md and B05 uncertainty policy.
  Start counts/durations and selected-day intensity/peak use distinct denominators;
  no clipping of full durations or averaging yearly intensity means.
- Confirmed unresolved boundary years union with coverage-incomplete years, including
  automatic derivation from events if the explicit B05 year list is omitted. Their
  retained counts are labelled partial and cannot drive complete-year trends.
- Confirmed actual calendar years enter centered regression; edge comparison windows
  never slide around gaps; true zero rolling means remain zero rather than null.
- Review removed an unused import and added unequal-duration weighting, decreasing
  slopes/percentages, and boundary-to-trend integration tests. All affected checks
  pass after those changes.
- Insights contain computed counts/slopes/window changes or explicit unavailable
  reasons, with no causal or statistical-significance assertion.
- Unresolved implementation issues: none identified within B06 scope.
- Known non-blocking limit: existing HTTPX TestClient deprecation warning. Real
  API/persistence orchestration remains B07. No Git repository/index exists here;
  nothing was staged or committed.

## User review gate

Implementation, review, and checks pass. Accepted by the user on 15 October 2026
with “do next”, confirming the earlier stop and authorizing B07 only.
