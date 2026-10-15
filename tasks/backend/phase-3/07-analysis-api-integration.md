# B07: Analysis API integration

Phase: 3

Status: Accepted

## Problem

The frontend needs one consistent persisted response tying together validation, cached weather, and calculations.

## Proposed solution (no code)

Implement POST /api/v1/analyses orchestration. Check weather freshness/revisions, reuse valid analysis or compute from stored weather, save it, then read the saved result. Key cache entries by selection, source revisions, baseline, and method/model/coordinate versions. Define typed response groups and safe error codes; coalesce identical work and bound cache/output growth.

## Dependencies

B06 reviewed and accepted.

## Deliverables

Integrated endpoint; finalized response schemas; analysis-cache invalidation; consistent errors.

## Completion checks

- [x] Real request returns database-backed JSON — real default POST matches saved Atlas result
- [x] repeat avoids unnecessary provider work — live repeat is an analysis hit with zero additional provider requests
- [x] revision changes invalidate results — baseline and boundary-context revision tests pass
- [x] finite JSON numbers/ISO dates/nulls serialize correctly.

## Review focus

Check all response groups in BACKEND_PLAN.md, Mongo internal IDs excluded, stale warnings update on cache hits, and framework errors use the common envelope.

## Implementation evidence

### Final live verification — 15 October 2026

After the user confirmed the Atlas network-access update (“done”), reran
`backend/.venv/Scripts/python.exe -m app.verify_analysis`: **exit 0, PASS**.

- Default real Delhi 1990–2020 POST returned **HTTP 200**, **31 annual rows**,
  **71 event starts**, in **90.86 seconds** for the first request.
- Response validated against the typed contract and exactly matched the saved
  Atlas result after readback.
- Repeat POST returned an analysis cache hit with the original calculation time
  and **zero additional provider requests**.
- Actual weather/analysis records remain in Atlas; no synthetic fixture was used
  for this live request. No URI/password was printed; TLS validation stayed enabled.
- Final local regression evidence remains **214 passed** and no broken
  requirements (recorded below). No implementation changes followed those checks.
- Reviewed the successful live result against all B07 completion checks; no new
  findings. Earlier TLS-blocked notes below are historical and superseded.

Latency limit for later handoff: this cold local ASGI request took 90.86 seconds.
This is not evidence that a chosen hosting platform can sustain a cold request;
B09 must assess host limits and use the planned persisted-job approach if needed.
No hosting choice, deployment, B08 work, or submission was performed.

### Implementation and earlier verification history

Implemented on 15 October 2026 after explicit B06 acceptance (“do next”, following
clarification of the earlier stop). Read task requirements and related contracts
before coding; no applicable AGENTS.md found in the workspace/ancestors.

Changed files:

- `backend/app/analysis_schemas.py`: typed response groups; finite numbers, ISO
  dates/aware timestamps, nullable metrics, explicit event/source/quality contracts.
- `backend/app/api/{__init__,analyses}.py`: synchronous POST `/api/v1/analyses`
  route with validated selection, response schema, and documented error envelope.
- `backend/app/services/analysis.py`: source-freshness/revision orchestration,
  threshold/detection/metrics composition, versioned deterministic cache keys,
  referenced context-year checks, current cache-hit warnings, stored-result hash,
  save/readback, coalescing, serialized weather work, pending/output limits.
- `backend/app/repositories/analyses.py`, `backend/app/database.py`: latest-selection
  lookup/index and scoped cleanup of old pipeline/revision/LRU entries.
- `backend/app/main.py`: lifespan service wiring, distinct safe errors, sanitized
  validation field names, and preservation of framework HTTP headers.
- `backend/app/config.py`, `backend/.env.example`: validated cache/event/byte/pending
  capacity settings. Actual local credentials were not modified.
- `backend/app/verify_analysis.py`: opt-in real ASGI POST/Atlas verification command;
  compares persisted response and checks repeat reuse without provider calls.
- `backend/tests/test_analysis.py`, `backend/tests/test_foundation.py`: B07 API/cache/
  coalescing/failure tests and updated configured-database requirement for the route.
- `backend/API.md`, `backend/README.md`: finalized contract, safe errors, cache and
  capacity behavior, local verification instructions and operational limits.
- B06/B07 task files and task index: acceptance/status/evidence.

Verification results:

- Final `backend/.venv/Scripts/python.exe -m pytest backend/tests -q --tb=short`:
  **214 passed**, one pre-existing Starlette HTTPX deprecation warning, 16.08 seconds.
- `backend/.venv/Scripts/python.exe -m pip check`: **No broken requirements found**.
- API tests use HTTPX mock provider, mongomock persistence, and actual ASGI route/
  service/calculation code. A default synthetic request yields 31 event starts and
  155 days; its JSON equals the stored result. Repeat performs no provider requests
  or threshold recalculation and updates persisted cache-hit metadata.
- Tests cover changed source revisions, referenced extension-year refresh, updated
  stale warnings/timestamps with unchanged revisions, cache payload corruption,
  new pipeline signatures, scoped LRU cleanup, lowered limits on cache hits,
  event/byte/pending/year caps, identical in-flight coalescing and failure cleanup.
- Strict HTTP inputs, malformed JSON, 405 headers, OpenAPI response groups,
  insufficient baseline through the actual pipeline, safe distinct 422/429/502/
  503/504 codes, no internal Mongo IDs, finite JSON and null metrics are verified.
- Unknown user-supplied field names and secret-canary values do not appear in
  validation responses. Existing source-control ignore checks pass.
- Ran `backend/.venv/Scripts/python.exe -m app.verify_analysis` twice. Both attempts
  failed before API startup with the safe **Atlas TLS internal-error alert** hint.
  No real analysis POST succeeded, no new real analysis persistence is claimed,
  and no connection string/password was printed. Certificate validation stayed on.

External verification blocker: the configured Atlas cluster is not accepting a
verified TLS connection from this process. Requested confirmation/update of the
active current-IP network-access entry. Once resolved, rerun the real verifier,
fix any findings and rerun affected checks, then mark Ready for review. The live
check will persist genuine required yearly weather and the default Delhi analysis.
This is local verification, not deployment. No B08/B09 implementation was started.

## Findings and fixes

- Checked every BACKEND_PLAN.md response group and climate counting convention.
  Public event records omit raw daily observations to bound response growth while
  preserving dates, full/observed metrics, and uncertainty flags. No silent event
  truncation is used; output capacity errors are explicit.
- Ensured source freshness is checked before analysis lookup and cached extension
  years are also revalidated. Changed baseline or optional boundary revisions
  invalidate the result; stable revisions refresh dynamic stale/cache timestamps.
- Review found retention cleanup needed on hits as well as misses, especially
  after lowering the configured cap. Added last-access indexing/cleanup and a
  regression test. Cleanup preserves unrelated records without the app namespace.
- Added persisted-result hash verification so even finite accidental payload
  corruption recomputes instead of serving a schema-valid wrong value.
- Coalesced followers now recheck byte/event limits after their status annotation;
  configured initial year-cap and unavailable-calendar failures have safe codes.
- Validation errors suppress unknown field names as well as submitted values;
  framework 405 preserves `Allow` while using the common error envelope.
- All final local checks pass. No remaining local implementation findings.
- Unresolved: required real Atlas-backed POST/repeat verification is blocked by
  TLS/network access. Do not mark Ready for review until it succeeds.
- Known non-blocking limit: pre-existing HTTPX TestClient deprecation warning.
  Coordination/caps are per process; per-IP and cold-request limits/proxy trust
  remain B08. Deployment/public-host checks remain B09 and are not performed here.
- Workspace has no Git repository/index; nothing was staged or committed.
  Secrets and confidential PROBLEM.md remain excluded; no deployment/submission.

## User review gate

Implementation, local review/checks, and real Atlas-backed POST/repeat verification
pass. Accepted by the user on 15 October 2026 with “do next”, authorizing B08 only.
