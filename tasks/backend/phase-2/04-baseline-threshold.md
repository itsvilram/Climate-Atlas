# B04: Baseline and threshold

Phase: 2

Status: Accepted

## Problem

Thresholds based on each user's chosen range would make comparisons inconsistent.

## Proposed solution (no code)

Calculate the linear 95th percentile from valid daily maxima over fixed 1990-2020. Require at least 95% valid observations overall and in every baseline year. A qualifying hot day is strictly above the threshold. Keep this a pure calculation independent of storage/API.

## Dependencies

B03 reviewed and accepted.

## Deliverables

Baseline coverage validation; percentile function; methodology metadata and documented annual-threshold limitation.

## Completion checks

- [x] Different selected ranges retain the same threshold
- [x] insufficient baseline fails
- [x] equality is excluded
- [x] percentile matches a manually checked fixture.

## Review focus

Check baseline day denominators include leap years, no seasonal adjustment is claimed, and numerical precision is retained for detection.

## Implementation evidence

Implemented and verified on 15 October 2026 after the user accepted B03 and
authorized B04 with “okay do next now”. Read all B04 requirements and applicable
plan sections before coding. No AGENTS.md found in workspace or ancestors.

Changed files:

- `backend/app/climate/__init__.py`, `backend/app/climate/threshold.py`: pure
  fixed-baseline calculation, immutable coverage/result records, safe insufficient
  baseline error, methodology metadata, and strict hot-day comparison.
- `backend/tests/test_threshold.py`: manual percentile fixture, selected-range
  invariance, annual/overall coverage, leap denominators, invalid observations,
  duplicate/date validation, precision, metadata, and input immutability tests.
- `backend/pyproject.toml`: NumPy runtime dependency (`>=2,<3`).
- `backend/CLIMATE.md`, `backend/README.md`: input contract, methodology, manual
  fixture arithmetic, version, units, limitations, and B05 integration boundary.
- B03/B04 task files and `tasks/backend/README.md`: acceptance, status, evidence.

Verification:

- Installed editable backend development environment; tested NumPy 2.5.4 on
  Python 3.12.14. Verified explicit linear percentile usage against official NumPy
  documentation linked in `backend/CLIMATE.md`.
- Final `backend/.venv/Scripts/python.exe -m pytest backend/tests -q --tb=short`:
  **125 passed**, one pre-existing Starlette HTTPX deprecation warning, 13.49 seconds.
- `backend/.venv/Scripts/python.exe -m pip check`: **No broken requirements found**.
- Manual fixture: all 11,323 baseline calendar dates, sorted temperatures
  `x[i] = 20 + i/1000`; rank `(11323-1)*0.95 = 10755.9`; linear interpolation gives
  **30.7559 Celsius**. Test matches within absolute 1e-12, with no relative tolerance.
- Different selected/context ranges preserve that threshold because only dates
  from fixed 1990-2020 contribute. Passing a selected subset without the baseline
  fails rather than silently changing the reference period.
- Calendar denominator is **11,323**, including eight leap days. Tests verify
  non-leap annual cutoff 347/365 passes vs 346/365 fails, and leap cutoff 348/366
  passes vs 347/366 fails. A poor individual year rejects even when overall coverage
  exceeds 95%; minimum adequate counts across all years also pass.
- Equality and the immediately next representable float above the threshold are
  distinguished. Metadata retains unrounded threshold and explicitly records no
  seasonal adjustment. Missing/non-finite/non-numeric/bool values are not zeros.
- All existing B01-B03 regression checks, including source-control ignore and
  secret-safety checks, pass. No credentials/local .env values or PROBLEM.md
  contents were read into task outputs or added to source.

External verification limits: B04 is a pure calculation task tested with synthetic
arithmetic/coverage fixtures. No new weather requests/database writes were made;
no real full-baseline climate threshold is claimed. API/storage orchestration is
deferred to later tasks, and no event detection or aggregation was implemented.

## Findings and fixes

- Reviewed all deliverables, completion checks, and review focus against the code.
  Confirmed the module imports no API, repository, configuration, or provider code;
  calculation accepts a date/value iterable and performs no I/O.
- Confirmed missing dates retain full calendar denominators; exact integer coverage
  comparisons prevent rounding deficient years up to 95%. Duplicate baseline dates
  are rejected instead of increasing the valid-day numerator.
- Confirmed no seasonal adjustment/official heat-alert claim and no detection-time
  rounding. The result records method version `annual-p95-linear-v1`.
- Review strengthened percentile assertions to explicitly disable relative tolerance
  and added tests for selected-subset rejection, minimum adequate coverage across
  every year, and the Celsius metadata value. Reran the full suite successfully.
- Unresolved implementation issues: none identified in B04 scope.
- Known non-blocking limitation: existing HTTPX TestClient deprecation warning.
  Real-baseline integration and HTTP error mapping remain later-task responsibilities.
  This workspace has no Git repository/index; nothing was staged or committed.

## User review gate

Implementation, review, and checks pass. Accepted by the user on 15 October 2026
with “do next”, authorizing B05 only. Later tasks retain their review gates.
