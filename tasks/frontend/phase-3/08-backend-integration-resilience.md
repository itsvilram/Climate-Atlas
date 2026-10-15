# F08: Backend integration and resilience

Phase: 3

Status: Ready for review

## Problem

The dashboard must work against the accepted backend contract and its real latency, CORS, rate-limit, and failure behavior.

## Proposed solution (no code)

Configure the public API base URL for a running local backend and verify real HTTP requests against the accepted B09 contract. Follow B08's synchronous POST workflow, configured CORS, request budgets, and retry guidance. Verify safe error rendering, cancellation assumptions, stale-result protection, cache/source metadata, and real analysis results. The fixture supports development contract checks only.

Public HTTPS, deployed CORS, and chosen-host latency checks are pending deployment
verification in F09, performed only when authorized. Verify host compatibility
before production integration; revise the API and F02/F03 if a persisted job/status
workflow becomes necessary.

## Dependencies

F01-F07; B07, B08, and B09 explicitly accepted. If host verification later requires a job workflow, update the backend contract, F02/F03, and this task before production integration.

## Deliverables

Working backend-connected dashboard for supported regions and years; finalized configuration and error behavior.

## Completion checks

- [x] Region list/defaults/year limits match the live backend.
- [x] Analysis response validates against the accepted contract.
- [x] Browser analysis timeout is 270 seconds for the default local 240-second backend budget; configured differences are reconciled and documented.
- [x] Local CORS and controlled safe error/rate-limit/retry behavior pass.
- [x] Real source/cache metadata and controlled incomplete/uncertain event states render correctly.
- [x] No mock or fixture is represented as a live result.

## Implementation evidence and review

The user authorized all remaining tasks without individual stop gates. Changed:
frontend/playwright.config.ts, browser-tests/dashboard.spec.ts, package.json/lock,
verification/deployment/setup documentation, and task statuses. Playwright/axe are
development dependencies. Existing F02/F03 client/store handles the verified live
contract; no climate recomputation or production fixture fallback was introduced.

15 October 2026: production Chromium tests start isolated preview/backend services
on 5180/8001 with explicit local CORS. Real discovery returns all five cities and
defaults/year bounds. Default Delhi returns 31 rows/71 starts; repeat is a cache hit
with unchanged generation timestamp. Mumbai 2020 returns one annual row and matching
selection/result cards. These requests use the runtime schema validator before UI
commit. The independent backend verifier confirms exact saved Atlas response equality
and zero additional provider calls on repeats. CORS allowed origin passes with the
correct header; denied origin returns 403.

Controlled browser tests cover partial/null/stale/uncertain states, request races,
discovery recovery, empty records, rate limit/Retry-After, malformed JSON,
insufficient baseline, busy/database/provider/timeout errors, and deliberate recovery.
Node tests additionally exercise transport abort/timeout and no automatic retry.
The 270-second analysis and 15-second regions budgets remain unchanged.

Review findings: simulated cross-origin Retry-After must expose the header like the
real backend (already correctly configured); fixed the test fixture. City locator
now uses its accessible combobox name. Test output moved outside OneDrive after a
trace cleanup lock, without moving/deleting the project. No new cold-weather cache
deletion or quota-heavy benchmark was performed; prior cold timing is reused.

Unresolved external limits: host compatibility and public HTTPS/CORS remain pending
deployment authorization. Local browser checks do not claim deployed behavior.

## Review focus

Check real local default/alternate selections and cached requests. Reuse recorded
cold timings unless a genuine cold test is needed; do not delete shared caches to
manufacture it. Use clearly identified controlled responses for all documented
error classes, partial/uncertain states, and request races. Record local HTTP/CORS
evidence separately from pending deployed checks.

## User review gate

Record integration evidence and stop for explicit user acceptance before F09.
