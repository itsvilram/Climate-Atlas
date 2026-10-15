# F04: Summary metrics and charts

Phase: 2

Status: Ready for review — browser viewport and tooltip checks pass

## Problem

Users need to compare annual heatwave frequency, days, duration, and intensity without frontend calculations changing backend results.

## Proposed solution (no code)

Render backend summary metrics and annual rows in summary cards, responsive charts, and a readable annual table. Show units and definitions, use null gaps rather than zero, and distinguish incomplete years with a non-color-only signal.

## Dependencies

F02 and F03; accepted analysis contract from B09 for final verification.

## Deliverables

Summary cards, annual frequency and heatwave-day charts, duration and intensity charts, and annual metrics table.

## Completion checks

- [x] Displayed values match the API without recomputation.
- [x] Zero and unavailable metrics are visibly distinct.
- [x] Partial/incomplete years are identified in charts and table.
- [x] Axes and tooltips include correct units and definitions.
- [x] Charts remain usable on narrow screens and do not create page-wide overflow.

## Implementation evidence

Changed: frontend/src/components/SummaryCards.tsx, AnnualCharts.tsx,
AnnualMetricsTable.tsx, metric-format.ts, RequestStatus.tsx; pages/Dashboard.tsx;
styles.css; tests/metrics-ui.test.mjs and request-ui.test.mjs; frontend README,
task/index status documentation. No backend or confidential configuration changes.

Cards render summary event starts, days, full mean duration, and selected-period
peak. Four Recharts panels use unchanged backend annual rows: event starts plus
backend five-year mean, day totals, mean/max full duration, and mean exceedance.
No percentile/event/trend calculations occur in the frontend. Display rounds to
two decimals; chart data remains unrounded. Null values stay gaps (connectNulls
false); no-analysis, null, and zero labels differ.

Incomplete years have starred year labels, an explicit year list, hatched bars,
tooltip status/reasons, and table quality labels. Summary partial status is visible.
Axes/legends/tooltips name units; frequency/day axes use integer ticks. The annual
table exposes every metric, coverage/day counts, rolling mean, and quality reasons
with headers/caption and a keyboard-focusable horizontal scroll region.

15 October 2026: 18 tests pass, including comparison of all annual rows against
the real B09 response, summary values, selection labels, null/zero/partial states,
tooltip labels and chart descriptions. TypeScript and production build pass.
Contract drift and client browser-bundle checks pass. Fixtures remain test-only;
the dashboard displays only successful backend responses.

## Review findings and fixes

- Follow-up: user reported Vite 504 Outdated Optimize Dep for React modules.
  Isolated SSR test caches by test process, disabled dependency discovery in those
  servers, and restarted the actual development server with --force. All 18 tests
  pass. This prevents test config changes from invalidating the live browser's
  dependency optimizer cache. Browser tabs still need a hard reload for new URLs.

- Initial main bundle exceeded 500 kB. Lazy-loaded charts after a successful
  response; final main/chart chunks are about 369/377 kB, with no size warning.
- Replaced placeholder metric colors with readable dark text for real values.
- Disabled HMR/WebSockets in server-rendered tests to avoid shared development-port
  collisions; affected checks rerun after the correction.
- Reviewed full-duration versus selected-day conventions, null gap configuration,
  direct chart/table fields, and non-color completeness cues. No regression fit
  line is invented; trend interpretation remains F05.

Resolved during final verification: isolated Playwright Chromium renders all four
charts at 1440/375/320px; actual hover tooltips expose event counts and units.
Opened data disclosures/table regions create no page-wide overflow. Screenshots,
axe checks, and keyboard/reflow checks pass. Manual screen-reader speech and
cross-browser testing are not claimed. See frontend/VERIFICATION.md.

## Review focus

Check annual counting conventions, null handling, missing-value gaps, labels, and chart/table agreement.

## User review gate

Record implementation evidence and stop for explicit user acceptance before F05.
