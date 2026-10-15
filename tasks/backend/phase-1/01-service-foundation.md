# B01: Service foundation

Phase: 1

Status: Accepted

## Problem

The backend needs a predictable structure, configuration, and input contract before external services or calculations are added.

## Proposed solution (no code)

Create the Python/FastAPI project, environment settings, curated city configuration, validated selection schemas, safe error envelope, and health/regions routes. Support 1990-2025 and heatwave only; default Delhi 1990-2020.

## Dependencies

None.

## Deliverables

Project structure; placeholder environment file; local run instructions; health/regions contracts.

## Completion checks

- [x] Service starts
- [x] city IDs and defaults are stable
- [x] invalid years, unknown cities, unsupported hazards, and reversed ranges fail clearly
- [x] secrets are ignored.

## Review focus

Confirm scope matches BACKEND_PLAN.md, strict integer validation is defined, and health output exposes no sensitive details.

## Implementation evidence

Implemented and verified on 14 October 2026, using Python 3.12.14 on Windows.

Changed files:

- `.gitignore`: excludes confidential `PROBLEM.md`, local environment/credential files, virtual environments, and generated Python artifacts; allows placeholder `.env.example` files.
- `backend/pyproject.toml`: installable FastAPI/Pydantic service and development dependencies; pytest configuration.
- `backend/.env.example`: placeholder local CORS configuration; no credentials.
- `backend/README.md`: setup/run/check commands, configuration, endpoint contracts, coordinate conventions, strict input rules, and source-control guidance.
- `backend/app/__init__.py`, `config.py`, `schemas.py`, `regions.py`, `main.py`: environment settings, five stable cities, selection schema, safe error envelope, health/regions routes, and explicit-origin CORS.
- `backend/tests/test_foundation.py`: automated completion checks, including a real Uvicorn subprocess and HTTP requests.
- `tasks/backend/README.md` and this file: status and review evidence.

Verification:

- Installed with `backend/.venv/Scripts/python.exe -m pip install -e './backend[dev]'` after creating the virtual environment.
- `backend/.venv/Scripts/python.exe -m pytest backend/tests -q`: **24 passed**, 1 dependency deprecation warning, in 2.19 seconds on the final run.
- `backend/.venv/Scripts/python.exe -m pip check`: **No broken requirements found**.
- Startup check launches Uvicorn on an ephemeral loopback port, requests health and regions, validates their JSON contracts, and terminates the process.
- Selection checks exercise Python and JSON inputs: unknown cities, unsupported hazards, out-of-range/reversed years, string/float/bool/null years, extra fields, single years, and the full supported range.
- Safe-error checks confirm submitted canary values and exception text are absent from responses. Health returns only `{"status":"ok"}`.
- Ignore checks run `git check-ignore` in an isolated temporary repository using the actual root ignore rules. Confidential brief, local environment files, keys, and generated files are ignored; source and `.env.example` remain eligible for tracking.

No applicable AGENTS.md was found in the workspace or its ancestors. No MongoDB, provider, climate, frontend, deployment, or submission work was performed. The future selection contract is tested through a test-only route; no analysis endpoint was added.

## Findings and fixes

- Reviewed implementation against the B01 deliverables, completion checks, and review focus. Confirmed strict integer validation rejects booleans, integral floats, and numeric strings; fixed city IDs/defaults and minimal health output match the plans.
- Initial verification found Windows CRLF conversion in the Git-ignore test input. Changed the test to NUL-delimited binary input/output; reran the entire suite successfully.
- Verified explicit CORS origins reject wildcard hosts, URL credentials, paths, unsupported schemes, and invalid ports. Confirmed no analysis route accidentally expands B01 scope.
- Unresolved implementation issues: none identified.
- Verification limits: this workspace has no Git repository, so there is no real index/history to audit; ignore behavior was verified in a temporary repository. Nothing was staged or committed. Python execution required sandbox approval because the installed runtime resides outside the workspace.
- Dependency warning: installed Starlette 1.8.0 warns that its HTTPX TestClient integration is deprecated in favor of HTTPX2. Tests pass; migration is deferred. Tested key versions: FastAPI 0.143.1, Pydantic 2.14.1, pydantic-settings 2.16.0, Uvicorn 0.54.0, Pytest 9.1.1, HTTPX 0.28.1.

## User review gate

Accepted by the user on 15 October 2026 with “okay move to next part”. B02 is authorized; later tasks retain their own review gates.
