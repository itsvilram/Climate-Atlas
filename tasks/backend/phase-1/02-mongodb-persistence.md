# B02: MongoDB persistence

Phase: 1

Status: Accepted

## Problem

Weather and results must survive restarts and be read from a NoSQL database without exposing credentials.

## Proposed solution (no code)

Use the existing Atlas cluster and one reused PyMongo client. Define weather_years and analyses repositories, unique indexes, upserts, lifecycle cleanup, bounded connection timeouts, and explicit database failure handling. Keep the URI in backend environment configuration.

## Dependencies

B01 reviewed and accepted.

## Deliverables

Database schemas/indexes; repository interfaces; secure connection configuration; connectivity verification.

## Completion checks

- [x] Atlas connectivity succeeds — live ping passed
- [x] write/read round trip works — both repositories verified on Atlas
- [x] duplicates are prevented — live upsert/count and duplicate rejection checks passed
- [x] failures are safe
- [x] URI/password never appear in outputs — secret-canary and live verification output checks passed

## Review focus

Check identity includes region coordinate version, model, year, schema version; document least-privilege user and network access; do not claim connection verified until it is tested.

## Implementation evidence

### Final verification — 15 October 2026

After the user's latest Atlas access update, the first retry still returned the
TLS alert. Waited 20 seconds for propagation and retried: **exit 0, PASS** for
database ping, repository write/read, replacement upserts, unique indexes/duplicate
rejection, and exact verification-record cleanup. Both `weather_years` and
`analyses` were exercised on the configured Atlas database. No connection string
or password was printed. Certificate validation remained enabled.

Final regression run: `backend/.venv/Scripts/python.exe -m pytest backend/tests -q`
— **53 passed**, one pre-existing Starlette HTTPX deprecation warning, 5.03 seconds.
`backend/.venv/Scripts/python.exe -m pip check` — **No broken requirements found**.

Reviewed the final results against every B02 completion check and review focus;
no unresolved implementation issues identified. Atlas administrative least-privilege
roles are documented but were not independently audited. All earlier pending/TLS
notes below are historical and superseded by this successful live verification.
No weather fetching, climate calculations, frontend work, deployment, submission,
or B03 implementation was performed. B02 awaits user acceptance.

### Implementation and earlier verification history

Implementation performed on 15 October 2026, after the user's acceptance of B01
(“okay move to next part”). B02 only; no weather fetching, climate calculations,
analysis endpoint, frontend, deployment, or submission work.

Changed files:

- `backend/pyproject.toml`: PyMongo runtime and mongomock development dependencies.
- `backend/app/config.py`, `backend/.env.example`: secret URI, database name,
  bounded connection/operation/pool settings; placeholders only.
- `backend/app/database.py`: one shared client, ping, unique indexes, primary
  readback, majority-acknowledged writes, cleanup, and database access helper.
- `backend/app/repositories/{__init__,base,weather,analyses}.py`: typed weather
  identity; read/replacement-upsert/readback interfaces; `_id` exclusion; safe
  failures and bounded duplicate-race retry.
- `backend/app/main.py`: worker-thread startup/shutdown and safe 503 envelope.
- `backend/app/regions.py`: explicit coordinate configuration version `"1"`.
- `backend/app/verify_database.py`: opt-in ping, write/read/upsert/duplicate check
  with isolated UUID-labelled fixtures and exact-record cleanup.
- `backend/tests/test_persistence.py`, `backend/tests/test_foundation.py`: B02
  checks and B01 regression isolation from local database configuration.
- `backend/README.md`: connection setup, least-privilege/network guidance,
  document/index contracts, verification command and limits.
- `tasks/backend/README.md`, B01 and B02 task files: acceptance, status, evidence.

Verification:

- Installed editable project with development extras. Tested PyMongo 4.19.0,
  dnspython 2.9.0, mongomock 4.3.0 on Python 3.12.14.
- Final `backend/.venv/Scripts/python.exe -m pytest backend/tests -q`:
  **49 passed**, one pre-existing Starlette HTTPX deprecation warning, 12.72 seconds.
- `backend/.venv/Scripts/python.exe -m pip check`: no broken requirements.
- Checks cover each weather identity field, unique index definitions, replacement
  upserts, readback, no internal `_id`, identity override rejection, duplicate-race
  retry, missing documents, shared client/pool/timeout configuration, failed-startup
  cleanup, shutdown, safe 503, and configuration bounds.
- Actual PyMongo checks use a non-listening loopback port and malformed URI to
  verify bounded failure and safe errors, without contacting Atlas.
- Secret canaries verify no URI/password in settings repr, returned errors, or
  verification command output. Existing Git-ignore checks still pass.
- The smoke-verifier logic was exercised against mongomock and confirms it keeps
  unrelated records intact. This is not proof of Atlas connectivity or durability.
- `backend/.venv/Scripts/python.exe -m app.verify_database` returned exit 2:
  `NOT RUN: configure MONGODB_URI in backend/.env first.`

External verification limit: neither `backend/.env` nor a process MONGODB_URI is
configured. Real Atlas ping, persistence, and duplicate rejection have **not** been
verified. A secure local configuration request was sent to the user. Once supplied,
run the verifier, review results, fix any findings, and only then mark Ready for
review. There is still no Git repository/index here; nothing was staged or committed.

## Findings and fixes

### Live verification follow-up (15 October 2026)

- User configured the ignored `backend/.env` and requested verification.
- Safe structural checks found an accidental duplicated `MONGODB_URI=` prefix
  with nested surrounding quotes. Removed only that assignment wrapper locally;
  no credentials or connection string were displayed.
- Live verifier advanced past URI parsing, but could not establish a connection.
  Retried with a temporary 15000 ms timeout; failure category is **TLS negotiation**.
  Certificate validation remains enabled. Atlas ping/write/read/duplicate checks
  are still unverified; no successful database writes were reported.
- Added fixed, credential-free verifier hints for URI, authentication,
  authorization, DNS/configuration, server selection, and TLS failures.
- Removed the temporary structural diagnostic script after use.
- Reran the full regression suite: **49 passed**, one pre-existing warning,
  4.11 seconds. Root ignore-rule checks remain passing.
- Current unresolved issue: inspect Atlas network allowlist/cluster availability
  and local TLS/network interception. Status remains In progress; B03 is untouched.

### Initial implementation review

Further diagnostic follow-up: another live retry returned the specific
`TLSV1_ALERT_INTERNAL_ERROR` category. The next administrative check is Atlas
Network Access: confirm this machine's current public IP is allowed. This is a
diagnostic lead, not proof of an allowlist problem. No Atlas management connection
is configured in this workspace, so no access-list changes were made. Added
fixed diagnostic messages and secret-canary tests distinguishing internal TLS
alerts, certificate verification, other TLS errors, and general reachability.
Regression result: **53 passed**, one pre-existing warning, 7.49 seconds.
B02 remains In progress and B03 remains Not started.

After the user reported the Atlas network update ready, the live verifier still
returned a TLS internal-error alert. Direct credential-free network diagnostics
confirmed SRV DNS resolution succeeds and TCP connects to all three resolved
database nodes; verified TLS handshakes receive the same internal-error alert on
all three. This narrows the failure to the TLS/access path, not a basic DNS or TCP
failure; it does not prove whether Atlas access policy or network interception is
responsible. No authentication or persistence checks succeeded. The temporary
diagnostic script was removed. A separate public-IP lookup was rejected by
automatic approval review because it would contact an additional third party;
it was not performed or bypassed. No credentials were displayed and no TLS
validation was disabled. Atlas allowlist project/IP/active status still needs
confirmation; B02 remains In progress.

- Reviewed B02 requirements against the implementation. Weather identity includes
  region, coordinate version, model, year, and schema version. Analysis key is
  uniquely indexed; deterministic key generation remains B07's responsibility.
- Ensured client cleanup also runs when index creation fails after a successful
  ping. Both ping-failure and index-failure tests pass.
- Removed obsolete `pymongo[srv]` extra after installation warned it no longer
  exists; dnspython is provided by PyMongo. Reinstalled and checked dependencies.
- Isolated foundation tests from local Atlas configuration so automated regression
  checks do not create live clients when a developer supplies credentials.
- Enforced majority write acknowledgement and primary readback to keep repository
  semantics reliable even if URI query options specify weaker settings.
- First test invocation ran before dependency installation finished and could not
  collect PyMongo/mongomock tests. Subsequent runs after installation passed; final
  run is recorded above.
- Unresolved: real Atlas verification requires local credentials/network access.
  Least-privilege roles and the Atlas allowlist must be configured administratively;
  application unit tests cannot prove those settings.
- Pre-existing Starlette HTTPX TestClient deprecation warning remains non-failing.

## User review gate

Implementation, local checks, and live Atlas checks pass. Accepted by the user on
15 October 2026 with “do next”. B03 is authorized; later tasks retain review gates.
