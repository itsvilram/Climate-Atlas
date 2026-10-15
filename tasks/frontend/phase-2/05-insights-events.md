# F05: Insights and events

Phase: 2

Status: Accepted (user authorized F06 with “do next”)

## Problem

Users need concise interpretation and event-level evidence, including events that cross selected-year boundaries or have unresolved boundaries.

## Proposed solution (no code)

Display backend-generated insights and trend availability explanations. Build a bounded, client-paginated events table that distinguishes complete events, truncated observed segments, and uncertain candidates. Show observed versus full dates/metrics separately when full values are unavailable, and label whether an event started inside the selection.

## Dependencies

F02 and F03; B05/B06 counting and boundary semantics; B09 contract handoff.

## Deliverables

Insights panel, trend interpretation, event table, and clear empty/partial states.

## Completion checks

- [x] Insights are rendered from backend output without causal or significance claims.
- [x] Trend slope units and eligible-year count are shown where available.
- [x] Unavailable trends/comparisons include the backend explanation.
- [x] Uncertain candidates are not presented as confirmed heatwaves.
- [x] Truncated observed metrics are never labeled as full-event metrics.
- [x] Events starting outside the selection are identified; long lists are paginated.

## Implementation evidence

User authorized F05 while F04 viewport checks remain pending; no unperformed
browser check is marked passed.

Changed: frontend/src/components/InsightsPanel.tsx, EventsTable.tsx, event-pages.ts;
pages/Dashboard.tsx; styles.css; tests/events-ui.test.mjs; task/index documentation.
Insights and trends use response statements, slopes, fit-year counts, window values,
and unavailable explanations without recalculating climate results. Event rows
separate full versus observed dates/duration/temperature metrics and expose all
qualification, truncation, completeness, and selection-start semantics. Unknown
start-in-selection remains unknown. Ten records per page, clamped page bounds,
disabled end controls, and response-key remount reset pagination for a new result.
The table explicitly distinguishes record count from summary event-start count.

15 October 2026: all 19 tests pass; TypeScript/production build and OpenAPI drift
check pass. New server-rendered test checks real insights/trend values, first-page
row bounds and complete pagination coverage, uncertain/truncated/outside-selection
records, null full versus observed metrics, missing trend/comparison explanations,
escaped text, and empty table state. Controlled fixtures remain test-only.

## Findings and fixes

Reviewed qualification_confirmed separately from eligible_for_complete_metrics;
confirmed truncated runs remain excluded from complete metrics, while uncertain
candidates are explicitly not confirmed. No full values are reconstructed from
observed segments. Pagination uses the response events list without duplicating
data_quality.excluded_boundary_events, which is metadata about those records.

During verification user reported city loading failure. Local backend was not
listening on port 8000. Started it with process-local explicit CORS origins for
127.0.0.1/localhost:5173; verified real GET regions HTTP 200, five cities, and
Access-Control-Allow-Origin matching http://127.0.0.1:5173. No backend secret or
persistent environment configuration was changed. User can retry city loading.

Unresolved: browser inventory remains empty; interactive browser, keyboard, and
viewport checks remain unverified. Earlier F01/F04 viewport checks remain pending.
No deployment/submission or F06 implementation performed. Stop for user review.

## Review focus

Check `qualification_confirmed`, `eligible_for_complete_metrics`, truncation flags, nullable full metrics, and start-in-selection semantics.

## User review gate

Record implementation evidence and stop for explicit user acceptance before F06.
