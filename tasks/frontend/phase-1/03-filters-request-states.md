# F03: Filters and request states

Phase: 1

Status: Accepted (user authorized F04 with “okay start”)

## Problem

Users need to select supported analysis parameters and understand loading, validation, and failure states without confusing old results for new ones.

## Proposed solution (no code)

Load city options, defaults, and supported year bounds from the regions endpoint. Provide the fixed Heatwave selection, validate ordered years, and implement loading, empty, success, retryable error, and reanalysis states. Keep the last successful result labeled with its own selection and prevent late responses from replacing newer results. Use the synchronous request budget and deliberate retry behavior documented in F02.

## Dependencies

F02 accepted. User authorized F03 while F01 browser viewport checks remain pending;
this does not mark F01 accepted or its checks passed. Use B08's synchronous POST
workflow and B09 timing guidance (270-second browser analysis timeout for the
default 240-second backend budget).

## Deliverables

Accessible filters, inline validation, request lifecycle, and status/error presentation.

## Completion checks

- [x] Region options and year bounds come from the API, not duplicated constants.
- [x] Invalid ranges are blocked with useful inline feedback.
- [x] Previous successful results remain clearly labeled during reanalysis.
- [x] Stale/late responses cannot overwrite the newest request.
- [x] Rate limit, busy, timeout, insufficient data, provider, and database failures have safe, deliberate handling.
- [x] Expensive analysis requests are not automatically retried.
- [x] Controlled response tests cover duplicate submits, cancellation/unmount, and out-of-order success/error responses without overwriting newer state.
- [x] Retry-After is shown usefully; insufficient data, malformed responses, and network failures remain distinct from zero-event results.

## Implementation evidence

Changed: frontend/src/state/analysis.ts; components/AnalysisFilters.tsx and
RequestStatus.tsx; pages/Dashboard.tsx; styles.css; tests/analysis-state.test.ts and
request-ui.test.mjs; package.json test script; frontend README and task/index status.
Created ignored frontend/.env containing only the public local backend URL, matching
.env.example. Backend credentials/configuration were not read or copied.

Cities, initial years, and bounds are loaded through F02's validated regions client.
No analysis runs automatically. Native labeled form controls and inline validation
block unsupported/reversed/noninteger/empty years. Request status covers discovery,
ready, first load, reanalysis, success/zero starts, cancellation, and safe failures.
Retry-After is displayed as a minimum wait from the response; retry stays deliberate.

The store owns separate discovery/analysis request IDs and abort controllers.
Editing filters or cancelling invalidates active analysis ownership; late successes
and errors cannot commit even if fetch ignores abort. Unmount disposes requests.
Duplicate submit is prevented synchronously and by the submit button. Last successful
response remains stored with its own region/period and visible provenance receipt.
Summary/chart/event presentation is explicitly pending F04–F06; no values are invented.

15 October 2026: npm test passed 16 tests (8 existing client, 7 new request-store,
1 server-rendered UI check). Controlled tests cover backend-provided defaults/bounds,
validation, no automatic analysis, duplicate submit, retained result, old success/error
races, edit/cancel/dispose, discovery failure/retry/race, all documented major failure
categories, response-selection mismatch, and zero-event success. UI markup check
verifies labeled native controls, API-derived bounds, invalid-field associations,
live announcements, disabled duplicate submit, cancel/retry actions, Retry-After,
insufficient-data explanation, and escaped untrusted text.

npm run build passed TypeScript and production bundling after the final review fix.
npm run check:api and check:client-bundle passed; no contract artifacts changed.

## Review findings and fixes

- Abort alone cannot protect state: added ownership guards for success and failure,
  tested with transports that ignore cancellation.
- A valid schema can describe a different selection: reject mismatched region/period
  without replacing the previous result.
- Regions schema permits omitted defaulted fields: fail safely if discovery lacks
  usable defaults, limits, or supported cities rather than inventing constants.
- Prevent submissions while discovery has a retained error, in addition to disabling
  controls. All 16 tests and the build passed after this review correction.

Unresolved verification limits: connected/in-app browser unavailable in prior checks;
F01 viewport and real interactive keyboard checks remain pending. Server-rendered
markup checks do not establish browser usability. Real local HTTP/CORS/backend UI
integration remains F08 verification. No deployment or submission performed.

## Review focus

Check cancellation assumptions, duplicate-submit prevention, keyboard operation, and consistency with B08's final request contract.

## User review gate

Record implementation evidence and stop for explicit user acceptance before Phase 2.
