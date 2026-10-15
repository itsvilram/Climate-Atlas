# Frontend Implementation Plan

Status: local frontend implementation and automated review complete. All numbered tasks are Accepted or Ready for review in `tasks/frontend/README.md`. Real local integration and production Chromium checks pass; deployment remains pending authorization. Scope follows `APP_PLAN.md`, with API details in `BACKEND_PLAN.md` and `backend/API.md`.

## Objective

Build a responsive dashboard where users select a city and years, run heatwave analysis, and understand the results, methodology, and data limitations.

## Stack and boundaries

- React, TypeScript, Vite, Recharts, and ordinary responsive CSS.
- Use backend JSON as the source of truth for metrics and insights. Do not duplicate percentile, event-detection, or trend calculations in the browser.
- Configure only a public backend base URL through `VITE_API_BASE_URL`.
- MongoDB credentials and weather fetching remain in the backend.
- One dashboard page; authentication, maps, custom boxes, extra hazards, and PDF export are outside the core scope.

## Visual direction for F01

Use a light, restrained analytical dashboard: warm off-white page, white panels,
dark slate text, teal for primary actions, and amber for heat/quality emphasis.
Define shared CSS tokens for colors, spacing, radii, typography, and focus states.
Use a system sans-serif stack, clear heading hierarchy, and tabular numerals for
metrics. Keep units and explanations adjacent to values. Charts share consistent
year axes and legends; completeness cues include text or patterns as well as color.
Establish the shell at 375 × 812 and 1440 × 900, with a 320px-width overflow check.
F01 establishes these conventions; data charts and request behavior remain in
their numbered tasks.

## Backend handoff and request budget

B01–B09 are accepted. B09 provides a real response fixture and
generated OpenAPI in `backend/fixtures/`.
Use `backend/HANDOFF.md` and the runtime public schemas as contract references.
B08 retained synchronous POST analysis with a default 240-second backend operation
budget. Plan a 270-second browser analysis timeout to allow transport/response
margin, a separate 15-second regions timeout, and no automatic analysis retries.
Reconcile these values if the configured backend budget changes. Browser abort
does not guarantee cancellation of server work.

F08 verifies real HTTP integration against the local backend first. Host request
limits remain unverified: the measured cold Mumbai request took 144.61 seconds.
Before production integration, verify the chosen host/proxy supports the backend
budget with margin; otherwise revise the API to a persisted job/status workflow
and update dependent frontend tasks. Public HTTPS/CORS and deployed requests are
separate checks performed only after deployment authorization.

## Proposed structure

```text
frontend/
  src/
    api/client.ts
    types/analysis.ts
    components/
      AnalysisFilters.tsx
      RequestStatus.tsx
      SummaryCards.tsx
      FrequencyChart.tsx
      HeatwaveDaysChart.tsx
      DurationIntensityCharts.tsx
      InsightsPanel.tsx
      EventsTable.tsx
      AnnualMetricsTable.tsx
      MethodologyPanel.tsx
      DataQualityPanel.tsx
    pages/Dashboard.tsx
    styles.css
  .env.example
  package.json
```

## Step 1: Scaffold and API contract

- Create React/TypeScript/Vite project and production build configuration.
- Define types matching the final backend response, including nullable metrics and incomplete-year flags.
- Implement a small API client with safe error parsing and abort support, using the request budgets above.
- Load cities/defaults/year bounds from `GET /api/v1/regions`.
- Submit selection through `POST /api/v1/analyses`.
- Use a sanitized backend-generated real-data fixture after B09 for development; until then, any local mock must be clearly marked as development data and never presented as live results.

Completion check: types and error shape agree with the actual backend contract.

## Step 2: Dashboard layout and filters

Desktop: header, filter row, summary cards, charts, insights, tables, methodology/quality details. Mobile: stack these sections with readable spacing and horizontally scrollable tables where needed.

Filters:

- City dropdown: Delhi, Mumbai, Bengaluru, Chennai, Hyderabad from the API.
- Hazard displayed as Heatwave; avoid offering unimplemented hazards.
- Start/end year inputs within backend-supported limits, initially 1990-2020.
- Analyze button and brief inline validation for invalid ranges.

Keep filter values separate from the parameters of the last successful result. Every result section must clearly identify the city and years it represents.

Completion check: keyboard users can select valid parameters and submit; invalid ranges show helpful text.

## Step 3: Request states

| State | User experience |
| --- | --- |
| Loading regions | Loading status; analysis controls unavailable until options load |
| Ready, no analysis | Explain what selecting Analyze will show |
| First analysis loading | Visible loading message; note that initial historical fetch can take longer |
| Reanalysis loading | Retain prior results labeled with their original parameters and show new request status |
| Success | Render returned results and source/cache metadata |
| Zero events | Show zero counts and explain no qualifying events; other metrics remain unavailable |
| Insufficient data | Explain coverage issue; do not present it as zero heatwaves |
| Provider/database failure | Show safe backend message and a retry action |
| Rate limited | Explain retry timing if supplied by backend |
| Busy, timeout, or capacity limit | Explain that the analysis could not complete and offer a deliberate retry; do not retry expensive work automatically |

Disable duplicate submissions, cancel obsolete requests where possible, and use a request ID to prevent late responses from overwriting newer results. Aborting a browser request is not assumed to cancel backend work. Do not automatically retry expensive analysis requests repeatedly.

If the backend introduces a job/status API, update this stage to poll at bounded intervals, stop on terminal states/unmount, and display job status before integration.

## Step 4: Metrics and charts

### Summary cards

- Events starting within selected years.
- Heatwave days occurring within selected years.
- Mean full duration of events starting within selected years, in days.
- Peak heatwave temperature within the selected period, in degrees Celsius.

Use an em dash or 'Not available' for null values. Show partial-data warnings next to affected summaries. Explain that events crossing year boundaries can contribute days without an event start in that year.

### Charts

| Chart | Data and display |
| --- | --- |
| Annual frequency | Event count bars and trailing five-year average line; integer event axis |
| Annual heatwave days | Day counts by year with incomplete years visibly marked |
| Duration | Mean/max full duration of events starting each year; gaps for null values |
| Intensity | Mean daily exceedance above threshold in degrees Celsius; separate axis/chart from duration |

- Give axes and tooltips explicit units and definitions.
- Do not connect lines across missing/null values or substitute zero.
- Distinguish partial observations using marker/pattern/text, not color alone.
- Show regression slope as backend-provided descriptive text; draw a fit line only if the backend returns the required fit values.
- Include an annual metrics table as a readable alternative to charts.
- Make charts responsive and avoid excessive animation.

Completion check: all plotted values match the API, and zero differs visibly from unavailable data.

## Step 5: Insights, events, and methodology

### Insights

- Render backend-calculated statements about totals, duration, and first/last window comparisons.
- Display slope units and eligible-year count when available.
- Explain unavailable comparisons for short ranges, incomplete windows, or zero starting frequency.
- Do not add causal or statistical-significance claims.

### Events table

- Show full start/end dates and complete metrics only when available. Clearly distinguish observed segment dates/metrics from full-event values for truncated events, and label uncertain candidates that have not met confirmed qualification.
- Label events that overlap the selection but started outside it.
- Preserve backend qualification and completeness flags; never present partial or uncertain observations as complete events.
- Paginate long lists on the client within the backend's bounded response size.
- Show a clear empty state when no events qualify.

### Methodology and quality panels

- Fixed 1990-2020 baseline, region-specific 95th-percentile threshold, strictly above threshold, minimum three consecutive days.
- Annual percentile definition and lack of seasonal adjustment.
- Missing-day handling, incomplete-year rules, event counting convention.
- Representative city coordinate and reanalysis/grid-point limitation.
- Provider/model, units, retrieval time, valid-day coverage, and stale-data warnings.
- Link source attribution to the provider documentation.

Completion check: users can understand why a day/event qualifies and what the data cannot establish.

## Step 6: Accessibility and visual quality

- Use semantic labels, buttons, headings, and table headers.
- Visible keyboard focus, readable contrast, and touch-friendly controls.
- Announce loading/errors via appropriate live status text; avoid moving focus unexpectedly.
- Keep explanatory text close to its metric/chart.
- Test narrow/mobile and desktop widths; no page-wide overflow from charts.
- Provide a table/text equivalent for chart values.

## Step 7: Optional CSV export

Only after the core is verified:

- Export returned annual metrics with city, years, units, completeness flags, and baseline/method metadata.
- Escape CSV values safely, including spreadsheet formula prefixes in text fields.
- Name the download using the city and selected years.
- Export only the currently displayed successful result; do not export an in-flight selection.

## Step 8: Verification and delivery

| Scenario | Expected result |
| --- | --- |
| Default Delhi request | Real data fills cards, plots, events, and methodology |
| Alternate city/range | Results and threshold label update consistently |
| Single/short range | Results display; unavailable long-term trend is explained |
| No qualifying events | Zero counts, null duration/intensity, informative empty events table |
| Partial/insufficient data | Clear warning/error; not silently converted to zeros |
| Failure and retry | Safe message; successful results recover normally |
| Rapid request changes | Older response cannot replace newer results |
| Keyboard/mobile | Controls, tables, and essential information remain usable |
| Production integration | Correct API URL, CORS, HTTPS, and successful real request |

Run TypeScript checks and the production build. Use focused automated tests only for meaningful request-state behavior that needs protection; perform browser checks for charts, responsive layout, and accessibility.

Use controlled test responses for zero events, partial data, uncertain boundaries,
malformed JSON/shape, non-JSON errors, network failure, timeout, and Retry-After
(both delay-seconds and HTTP-date). Test duplicate submission, cancellation, and
out-of-order responses. Label test data explicitly and keep it out of production
fallback behavior. Check browser layouts at 375 × 812 and 1440 × 900 plus 320px
width and 200% zoom; record keyboard, focus, status-announcement, contrast, and
chart/table checks. Real local default/alternate responses verify data agreement;
controlled cases verify states that real provider data may not reproduce.

Deploy only after implementation is ready and deployment is authorized. Configure the public API URL, check the actual deployed backend, and document setup, source/methodology limitations, and AI use in README.

## Frontend definition of done

- [x] Filters use backend-supported regions and years.
- [x] Loading, errors, retries, empty results, and stale results are handled clearly.
- [x] Metrics/charts match the real backend response.
- [x] Missing/partial data and null metrics are represented honestly.
- [x] Events, methodology, and source information have tested accessible structure.
- [x] Mobile/desktop and keyboard checks pass in Chromium; manual speech/other engines not claimed.
- [x] Production build and real local integration pass; deployed integration is recorded as pending.
- [x] Optional features have not displaced required functionality.

Implementation order: backend completion and contract handoff -> frontend -> full application verification and delivery documentation.
