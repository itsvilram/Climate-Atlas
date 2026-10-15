# B03: Weather ingestion and cache

Phase: 1

Status: Accepted

## Problem

Historical provider data can be incomplete or inconsistent, and repeated queries must not fetch the same years unnecessarily.

## Proposed solution (no code)

Fetch Open-Meteo ERA5 daily maxima in Celsius/local timezone using a fixed host. Verify provider parameters, limits, and attribution before implementation. Fetch yearly blocks for the union of baseline, selection, and boundary context. Validate payloads and calendars, preserve gaps, flag invalid values, store normalized records, and read them back. Reuse blocks for 30 days; refresh expired data with finite retries/time budgets and warn on usable stale fallback.

## Dependencies

B02 reviewed and accepted.

## Deliverables

Provider adapter; normalization rules including documented plausibility bounds; yearly cache/revision policy; quality metadata.

## Completion checks

- [x] Real yearly data persists
- [x] overlap reuses years
- [x] nulls and leap dates survive correctly
- [x] malformed payloads are rejected
- [x] rate limits/timeouts/failures are bounded.

## Review focus

Check missing and duplicate dates, units and array lengths, provenance, freshness, and stale fallback. Coordinate boundary extensions with B05 rather than fetching arbitrary years.

## Implementation evidence

Implemented and verified on 15 October 2026 after the user accepted B02 with
“do next”. Read the problem, solution, dependencies, checks, and review focus
before coding; no applicable AGENTS.md found in the workspace or ancestors.

Changed files:

- `backend/app/services/{__init__,weather_data,weather_provider,weather}.py`:
  fixed-host ERA5 adapter, calendar normalization, validated yearly records,
  revisions, 30-day caching, stale warnings, sequential pacing/retries, operation
  budgets, year planning, and bounded adjacent-year access for later B05 use.
- `backend/app/config.py`, `backend/.env.example`: validated weather timeout,
  retry, pacing, and year-count settings. Actual local credentials were not changed.
- `backend/app/main.py`: lifespan ownership/cleanup of the weather service when
  persistence is configured; no new routes.
- `backend/pyproject.toml`: HTTPX promoted to runtime dependency; portable IANA
  timezone data added for Windows.
- `backend/app/verify_weather.py`: opt-in real-data/Atlas check retaining genuine
  cached Delhi 2020/2021 records, then verifying reuse after a fresh connection.
- `backend/tests/test_weather.py`: normalization, provenance, cache, revision,
  retry, pacing, deadline, stale fallback, and boundary checks.
- `backend/WEATHER.md`, `backend/README.md`: provider verification references,
  attribution, bounds, storage/cache policy, verification, and B05/B07 handoff.
- `tasks/backend/README.md`, B02 and B03 task files: acceptance/status/evidence.

Provider verification: checked official Open-Meteo historical API, terms, pricing,
and licence documentation before implementation (links in `backend/WEATHER.md`).
Pin ERA5 daily maximum temperature, Celsius, local timezone, and ISO dates. Long
requests count as multiple API calls; full-year requests are paced at least three
seconds apart. Attribution/licence/change metadata is stored with every year.
Plausibility bounds are inclusive -90 to 65 Celsius; invalid observations become
flagged nulls. Duplicate/invalid dates, units, structure, and provenance errors
reject a payload. No interpolation or synthetic demo data is used.

Verification results:

- Installed editable project with development extras. Added tzdata 2026.5; runtime
  HTTPX 0.28.1, PyMongo 4.19.0, Python 3.12.14.
- Final `backend/.venv/Scripts/python.exe -m pytest backend/tests -q --tb=short`:
  **91 passed**, one pre-existing Starlette HTTPX deprecation warning, 5.93 seconds.
- `backend/.venv/Scripts/python.exe -m pip check`: **No broken requirements found**.
- First successful `backend/.venv/Scripts/python.exe -m app.verify_weather`:
  Delhi 2020 fetched and persisted, **366/366 valid days**, leap day present;
  after reconnecting, 2020 reused with no provider call; overlapping 2021 fetched
  and read back from Atlas with one new provider request.
- Repeated live verification after review fixes: **PASS**, both 2020/2021 are
  cache hits and the second service reports **zero provider requests**. Real
  yearly cache documents are retained; no test fixtures were substituted.
- Automated checks include gaps/nulls/non-finite/implausible values, leap dates,
  duplicates, invalid dates, units, mismatched arrays, timezone alias/offset,
  provenance, cache corruption, exact 30-day freshness, stable/changed revisions,
  stale adequate vs inadequate records, future timestamps, bounded responses,
  transient/permanent errors, 429 cooldown, transport timeouts, slow streams,
  selection/baseline overlap, and shared-budget adjacent-year limits.
- Existing B01/B02 checks, including ignore rules and secret-safe failures, pass.
  No secrets or confidential PROBLEM.md contents were displayed or added to source.

## Findings and fixes

- Initial tests and first real provider normalization exposed missing Windows IANA
  timezone data. Added explicit tzdata runtime dependency and reinstalled; local
  timezone validation and real fetch/persistence then passed.
- Reviewed streaming deadlines: removed target-size buffering so a slow response
  reaches the overall-budget check after each incoming chunk. Added a slow-stream
  test proving it stops at the shared deadline without saving partial data.
- Reviewed retry exhaustion: retain Retry-After cooldown even on the final failed
  attempt so stale fallback/next-year work cannot immediately retry the provider.
  Added a cross-year cooldown check; final full suite passes.
- Reviewed shutdown: database cleanup is in a finally block even if HTTP-client
  cleanup fails. No HTTP client is created when persistence is unconfigured.
- Reviewed cache validity and safety: recompute calendar/quality/hash, refuse
  future-dated stale fallback, preserve original timestamp/revision on stale use,
  and reject inadequate stale coverage. A successful refresh changes revision
  only when content/provenance changes.
- Reviewed year planning and B05 coordination: no partial current-year fetch;
  selection context and explicit adjacent extensions share a maximum-year/source
  boundary, unique-year cap, and operation deadline. No event detection was added.
- Unresolved implementation issues: none identified within B03 scope.
- Limits/handoff: live verification covers two real yearly blocks, not a full
  baseline/default analysis. Tests cover synthetic invalid/gapped payloads. B04
  must enforce baseline coverage; B05 must flag unresolved boundary truncation;
  B07 must check source freshness/revisions before returning analysis cache hits.
  Admission, coalescing and deployment-wide quotas remain B07/B08. Use the service
  sequentially in worker threads. Synchronous deadlines are cooperative between
  operations with bounded socket waits, not process cancellation.
- The pre-existing HTTPX TestClient deprecation warning remains non-failing. This
  workspace has no Git repository to audit; no files were staged or committed.

## User review gate

Implementation, review fixes, automated checks, and real-data/Atlas verification
pass. Accepted by the user on 15 October 2026 with “okay do next now”, authorizing
B04 only. Later tasks retain their own review gates.
