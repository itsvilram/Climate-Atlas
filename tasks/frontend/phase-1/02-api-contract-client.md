# F02: API contract and client

Phase: 1

Status: Accepted (user authorized F03 with “do next”)

## Problem

The dashboard needs a typed boundary for region discovery, analysis requests, nullable results, and safe backend errors.

## Proposed solution (no code)

Define frontend types from `backend/API.md`, `backend/HANDOFF.md`, generated OpenAPI, and the backend's public schemas. Build a small client for `GET /api/v1/regions` and synchronous POST analysis, with safe error parsing and cancellation support. B09 acceptance remains required for final contract freeze. Do not reproduce climate calculations in TypeScript.

Use a 270-second analysis timeout for the default 240-second backend budget and
a separate 15-second regions timeout. Reconcile timing if backend configuration
changes. Handle malformed/non-JSON responses as safe client errors; TypeScript
types alone do not validate network responses. Add runtime contract validation at
the API boundary and deliberate handling for unexpected shapes.

## Dependencies

F01; B07 API documentation. Final contract freeze depends on accepted B08/B09 handoff.

## Deliverables

Typed region, selection, analysis, and error contracts; API client; local configuration example.

## Completion checks

- [x] Types include nullable metrics, completeness flags, source metadata, and uncertain/truncated event fields.
- [x] API errors retain safe code/message/details without exposing internal data.
- [x] Client requests use only the configured public backend base URL.
- [x] Client contract is checked against the accepted OpenAPI/schema handoff before integration is declared complete.
- [x] Focused checks cover malformed/invalid response shapes, network failure, abort versus timeout, and safe non-JSON errors.
- [x] Retry-After delay-seconds and HTTP-date are parsed safely; analyses are not automatically retried.

## Implementation evidence

User authorized F02 with “do next”; F01 viewport checks remain pending and were
not marked passed or accepted.

Changed: src/api/client.ts, src/types/analysis.ts, src/api/generated/openapi.d.ts,
validators.js and validators.d.ts; scripts/generate-api.mjs and
check-client-bundle.mjs; tests/client.test.ts; package.json/package-lock.json,
tsconfig.json, frontend README, and task/index documentation.

15 October 2026: eight focused tests pass. They cover real B09 response equality,
nested nullability/uncertain fields, invalid types/dates/extra fields/nonfinite
numbers, discovery route, error code/details/status retention, Retry-After,
invalid selections/configuration, malformed JSON/non-JSON failures, network
failure, pre-abort/in-flight abort, timeout including response body, and one-call
behavior without retries. npm run build passes TypeScript and production bundling.
npm run check:api confirms generated artifacts match accepted OpenAPI.
npm run check:client-bundle passes a separate browser bundle of the unwired client
without require()/Node runtime references. Installation reported zero known
vulnerabilities (99 packages audited).

No dashboard API wiring or request-state UI (F03), climate logic, backend changes,
live expensive requests, deployment, or submission. Existing public .env.example
is retained; no credentials/private material were copied or read.

## Review findings and fixes

- Generator requires TypeScript 5.x: selected compatible 5.9 without forced peer
  resolution. Aligned Node types to Node 24; minimum Node 22.18 supports native
  TypeScript test execution.
- Initial standalone validators contained an ajv-formats CommonJS require despite
  ESM mode. Generator emits an ESM import and rejects unexpected remaining require.
  All tests and the separate browser bundle pass after correction.
- The client is intentionally absent from F01's shell bundle. Added a separate
  bundle check so shell build success cannot mask client bundling failures.
- Reviewed timer/listener cleanup, timeout across JSON reads, distinct abort
  causes, and safe handling of malformed response/transport diagnostics.

Unresolved: F01 viewport checks remain pending; real HTTP/CORS/UI integration
remains F03/F08 work. F02 has no outstanding completion-check failure.

## Review focus

Check exact field names and nullability against backend schemas, runtime response validation, and the synchronous B08/B09 request budget.

## User review gate

Record implementation evidence and stop for explicit user acceptance before F03.
