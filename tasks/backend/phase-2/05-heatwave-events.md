# B05: Heatwave event detection

Phase: 2

Status: Accepted

## Problem

Hot days must be grouped into genuine consecutive events without joining across missing days or splitting at calendar years.

## Proposed solution (no code)

Detect runs of at least three consecutive days above the B04 threshold. Missing/invalid observations break runs; leap days are normal. Preserve full dates, duration, peak, and exceedance. Request boundary extensions through B03 within configured limits and flag unresolved truncation. Return intersecting events with whether their start lies inside the selected period.

## Dependencies

B04 reviewed and accepted.

## Deliverables

Pure event detector; boundary-context coordination; event schema and truncation flags.

## Completion checks

- [x] Two hot days fail, three qualify
- [x] gaps break events
- [x] cross-year/leap-day runs are correct
- [x] trailing runs are finalized
- [x] truncated events are visibly flagged.

## Review focus

Check full vs selected-period duration and prohibit presenting unresolved truncated duration as complete. Define conservative handling of uncertain boundary events in totals and trends before acceptance.

## Implementation evidence

Implemented and verified on 15 October 2026 after the user accepted B04 with
“do next”. Read the task's problem, solution, dependencies, checks, review focus,
and related plan/B06 requirements before coding. No applicable AGENTS.md found.

Changed files:

- `backend/app/climate/events.py`: pure sorted/consecutive-day detector, immutable
  event/day schema, full vs observed dates/metrics, qualification/selection flags,
  JSON-safe serialization, strict B04 threshold reuse.
- `backend/app/services/events.py`: B03 boundary coordination with one existing
  operation/budget, explicit warnings, and affected incomplete selected years.
- `backend/app/services/weather.py`: optional loaded-year anchor for adjacent
  extension when baseline and selected context are separated by unloaded years;
  existing budget/source/year-cap protections retained.
- `backend/tests/test_events.py`, `backend/tests/test_weather.py`: pure edge cases,
  extension coordination/failure checks, and actual B03 operation integration
  using mock provider/database only.
- `backend/CLIMATE.md`, `backend/WEATHER.md`, `backend/README.md`: event contract,
  uncertainty policy, and boundary-interface documentation.
- `APP_PLAN.md`, `BACKEND_PLAN.md`, B06 task review focus: conservative unresolved
  boundary policy recorded for later aggregation. No B06 implementation added.
- B04/B05 task files and backend index: acceptance/status/evidence.

Verification:

- `backend/.venv/Scripts/python.exe -m pytest backend/tests -q --tb=short`:
  **160 passed**, one pre-existing Starlette HTTPX deprecation warning, 12.60 seconds.
- `backend/.venv/Scripts/python.exe -m pip check`: **No broken requirements found**.
- Review added three cases for malformed extension data, both unresolved edges,
  and invalid extension anchors/directions. Reran affected checks with
  `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_events.py backend/tests/test_weather.py -q --tb=short`:
  **76 passed**, 7.42 seconds (includes all three added cases).
- Closed two-day runs fail; three-day runs qualify. Equality, nulls, non-finite,
  invalid values, and absent dates break continuity. Sorting/duplicate validation,
  leap days, year transitions, trailing runs, immutable inputs, and daily units
  are verified. Full event metrics use all event days, not only selected days.
- Boundary checks cover left/right/both truncation, one/two-day uncertain candidates,
  unknown starts, multiple adjacent extensions, candidates disqualified by new
  context, source/year/time limits, invalid/provider context failures, database
  error propagation, stale warnings, and irrelevant baseline runs.
- Actual B03 WeatherOperation tests load the baseline/selection via HTTPX mock
  transport and mongomock, then verify the correct adjacent year is loaded from
  a gapped context. Year-cap and shared-time-budget cases stop with explicit
  truncation/incomplete-year flags, without extra requests.
- No real weather fetches, Atlas writes, new endpoints, secrets in outputs, or
  confidential PROBLEM.md changes. Existing regression/ignore checks passed.

External verification limit: B05 uses synthetic event/context fixtures, not a real
31-year analysis. Full real-data/API orchestration remains later work. No annual
aggregation, trends, frontend, deployment, or submission work was performed.

## Findings and fixes

- Found that B03's original extension chose the outermost loaded year. With a gap
  between baseline and a later selection this could extend the wrong context.
  Added `from_year` requiring an already-loaded anchor and exactly one adjacent
  year. B03 integration tests prove it loads 2022 beside 2023 context rather than
  extending an unrelated 1990 baseline boundary. Budget/cap protections still pass.
- Confirmed completed events preserve full dates/duration/peak/exceedance; dates
  are not clipped to selection. Trailing runs finalize with an open-edge flag.
- Conservative uncertainty contract: an open run with >=3 observed hot days is
  confirmed but truncated; shorter open runs are uncertain candidates. Full unknown
  start/end and full duration/peak/exceedance are null, while observed metrics are
  explicitly named. Unknown start-in-selection is nullable unless a prior start
  can already be proven.
- `eligible_for_complete_metrics` is false for every unresolved event/candidate.
  B06 must exclude them from standard totals/summaries and mark affected selected
  years incomplete for rolling/regression/comparison windows, independently of
  daily coverage. Recorded the same rule in plans and B06 review focus. Observed
  segments remain visible; partial counts cannot imply a complete zero-event year.
- Reviewed extension failure behavior: source/year/time/provider/validation limits
  preserve uncertainty with warnings; required-data and database failures propagate.
  Both blocked directions terminate after one attempt each. Full affected tests pass.
- Unresolved implementation issues: none identified within B05 scope.
- Known non-blocking limit: existing HTTPX TestClient warning. No Git repository
  exists here; nothing was staged or committed.

## User review gate

Implementation, review fixes, and checks pass. Accepted by the user on 15 October
2026 with “do next”, authorizing B06 only. Later tasks retain their review gates.
