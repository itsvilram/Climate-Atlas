# B08: Security and operational limits

Phase: 3

Status: Accepted (user authorized B09 with “start next”)

## Problem

Public requests can exhaust provider quotas/resources or expose configuration without explicit controls.

## Proposed solution (no code)

Finalize CORS allowlist, per-IP limits plus stricter cold-work limits, trusted-proxy policy, work concurrency, finite retries/timeouts, safe logs, and cache cleanup. Preserve fixed provider hosts and server-only credentials. Measure cold latency and decide whether a persisted job/status API is necessary for hosting constraints before freezing the contract.

## Dependencies

B07 reviewed and accepted; basic safe fetching/secret handling already required in earlier tasks.

## Deliverables

Documented operational settings; rate-limit/error behavior; latency evidence and synchronous/job decision.

## Completion checks

- [x] Excess calls are limited
- [x] allowed/denied origins behave correctly
- [x] failures terminate within budgets
- [x] logs contain no secrets
- [x] cold requests meet the chosen execution budget or contract is revised.

## Review focus

Check single-instance limiter limitations, concurrent distinct requests, proxy spoofing, and data/output limits. Update frontend plan if job API is adopted.

## Implementation evidence

Implemented and verified on 15 October 2026 after the user accepted B07 with
“do next”. Read B08 problem, proposed solution, dependencies, deliverables,
completion checks, review focus, and related plans before coding. No applicable
AGENTS.md found in the workspace/ancestors.

Changed files:

- `backend/app/limits.py`: atomic bounded sliding-window client limits, trusted
  proxy/IP normalization, and process-wide weighted provider quota accounting.
- `backend/app/operations.py`: HTTP/body/concurrency admission, safe common-envelope
  limits, original request deadline, and closed-field JSON request logging.
- `backend/app/config.py`, `backend/.env.example`: validated general/cold/client/body/
  concurrency/proxy/provider-budget settings; placeholders only, local .env unchanged.
- `backend/app/main.py`, `backend/app/api/analyses.py`: middleware/CORS ordering,
  operational state, cold admission/deadline propagation, cache log annotation,
  and retry guidance on provider-budget failures.
- `backend/app/services/{analysis,weather,weather_provider}.py`: once-per-leader cold
  accounting before fetch/compute, non-resetting queue deadline, production provider
  gates per HTTP attempt including retries, retained finite work/resource bounds.
- `backend/app/verify_operations.py`: opt-in real cold-city timing and warm reuse
  check without deleting cache or fabricating cold data.
- `backend/tests/test_operations.py`: rate, concurrency, spoofing, CORS, body/time,
  provider budget, settings, deadline and secret-canary verification.
- `backend/tests/test_analysis.py`, `backend/tests/test_foundation.py`: internal
  admission callback compatibility, isolated B07 test quotas, and safe Uvicorn
  startup settings. Existing behavior/regressions retained.
- `backend/OPERATIONS.md`, `backend/API.md`, `backend/README.md`: exact settings,
  run command, proxy/logging policy, errors, limitations, timing and sync decision.
- B07/B08 task files and task index: acceptance/status/evidence.

Verification:

- Final `backend/.venv/Scripts/python.exe -m pytest backend/tests -q --tb=short`:
  **238 passed**, one pre-existing Starlette HTTPX deprecation warning, 8.25 seconds.
- `backend/.venv/Scripts/python.exe -m pip check`: **No broken requirements found**.
- `backend/.venv/Scripts/python.exe -m app.verify_operations`: **exit 0, PASS**.
  Genuine cold **Mumbai 1990-2020** returned **HTTP 200 in 144.61 seconds**, with
  **33 provider attempts**, including conservative quota pacing. Weather and
  analysis persisted in Atlas. Warm repeat: **HTTP 200 in 0.94 seconds**, analysis
  hit, **zero provider attempts**. No cache records were deleted to manufacture
  a cold result and no synthetic data was used for this run.
- After review fixes, `backend/.venv/Scripts/python.exe -m app.verify_analysis`:
  **exit 0, PASS**. Real Delhi returned 31 annual rows and 71 starts in 1.09 seconds;
  response matched Atlas, repeat was an analysis hit with no provider requests.
- Request logs from real checks contain only route/method/status/duration/cache;
  no URI/password, IP, query, request headers/body, or raw exception appeared.
- Excess/invalid requests consume general quota; new calculations/refreshes are
  cold-charged once; warm hits are not cold-charged. Limits return safe 429 and
  integer Retry-After. Limiter memory and atomic concurrent admission are tested.
- Tests prove right-to-left trusted-chain handling, ignored untrusted/spoofed
  XFF/Forwarded/X-Real-IP, duplicate/malformed/oversized chains, IPv4-mapped IPv6,
  unsafe proxy configuration rejection, and stable fail-closed invalid peers.
- CORS tests cover accepted/denied preflights and actual origins, forbidden wildcard
  settings, no cookie allowance, and CORS/retry headers on allowed-origin failures.
- Chunked/declared oversized and slow bodies stop before application work; expired
  request deadlines do not reset; global HTTP concurrency rejects/releases correctly.
  Existing queue, source-year, response, cache, timeout/retry and failure tests pass.
- Provider budgets count every attempted year/retry, wait only within the remaining
  allowance, and return bounded retry guidance for longer quota exhaustion. Tests
  verify atomic windows and no early retry. Fixed provider host/TLS remain intact.

Execution/contract decision:

- Retain synchronous POST for the selected **240-second local/single-instance
  execution budget**; the measured cold alternate-city request fits. No persisted
  job/status API or frontend-plan change is adopted in B08.
- No production host is selected or verified. B09 must confirm a host/proxy supports
  this duration plus I/O margin; otherwise revise to persisted jobs and update the
  frontend contract before deployment/integration. Local timing does not prove
  free-tier hosting or public-demo compatibility.
- Administrative Atlas roles/network restrictions are documented, not claimed
  independently audited. No deployment, submission, or B09 implementation occurred.

## Findings and fixes

- Confirmed all request accounting is bounded and thread-safe. Provider budgets
  are global to the reused service so rotating client IPs does not bypass them.
  They are conservative estimates (40 weighted units/yearly attempt), not the
  provider's authoritative usage counter or protection across other processes.
- Review found coalesced duplicates could occupy worker slots outside distinct-work
  accounting. Added a global HTTP cap before body/thread-pool admission; concurrent
  rejection/release tests pass. Single-instance limitations are explicit.
- Reviewed body parsing: enforce actual bytes before framework parsing, skip empty
  buffered chunks, reject invalid framing, and bound slow receives with an async
  deadline. Propagate the original deadline into queued work and reject already
  expired work before any provider/cache computation.
- Proxy spoofing is blocked only when the original socket peer is preserved.
  Updated documented Uvicorn command and startup check to use
  `--no-proxy-headers --no-access-log`; deployment must verify this and configure
  only real proxy CIDRs. Broad/wildcard trust is rejected.
- Unexpected API exceptions are caught before raw request traceback logging; safe
  output and secret-canary log tests pass. Request logs omit user-controlled raw
  paths, query strings, bodies/headers, credentials, and exception text.
- Retained B07 cache cleanup/output limits and B03 fixed-host/finite I/O behavior.
  Cold timing was measured with real production provider quotas; final live warm
  request verification and full regression suite pass after review fixes.
- Unresolved implementation issues: none identified in B08 scope.
- External limits: hosting/proxy compatibility still needs B09 verification; no
  multi-process/distributed limiter is claimed. Synchronous deadlines are cooperative
  with finite I/O waits, not forced worker cancellation. Existing HTTPX deprecation
  warning remains non-failing.
- Secrets and confidential PROBLEM.md remain excluded. No local .env edits,
  staging, commits, deployment or submission; this workspace has no Git repository.

## User review gate

Implementation, review fixes, local checks, real cold timing, and warm persistence
verification pass. B08 is Ready for review. Stop here; start B09 only after
explicit user acceptance.
