# Frontend dashboard

F01 provides the dashboard shell; F02 adds the validated API client; F03 connects
discovery, filters, and request states. Analysis runs only on deliberate submission.
The last successful result is retained and labeled during reanalysis or failure.
F04 adds summary cards, annual charts, and an accessible annual table. F05 adds
insights/events; F06 adds methodology and quality panels. No mock climate values appear.

## Setup

Use Node 22.18 or newer (verified with Node 24.19.0/npm 11.17.0).
From `frontend/`:

```powershell
npm ci
npm run dev
npm run typecheck
npm test
npm run check:api
npm run check:client-bundle
npm run build
npm run preview
```

The development server binds to loopback at http://127.0.0.1:5173. The preview
command serves the built app locally. This is not a deployment.
Copy `.env.example` to `.env` if no frontend/.env exists. The only
planned variable is VITE_API_BASE_URL, a public backend URL; all VITE_ variables
can be exposed to the browser. Never copy backend credentials into this folder.

## Visual conventions

`src/styles.css` defines the light paper background, white panels, slate text,
teal actions/focus, amber heat indicator, spacing scale, and 12px panel radii.
System sans-serif typography and tabular metric numerals keep the page readable.
Responsive grids collapse at 900px and 580px. Placeholder values mean unavailable,
not zero; no invented chart marks suggest a completed analysis.

## Verification status

TypeScript and production build pass. Development server startup and HTTP 200
were verified. npm installation reported zero known vulnerabilities.
21 Node/SSR tests and 8 production Chromium browser tests pass. Actual browser
checks cover 375×812, 1440×900, 320px, keyboard/focus, tooltip interaction, axe,
200%-equivalent reflow/text resizing, and real local backend/CORS integration.
See [verification report](VERIFICATION.md) for scope, evidence, and limitations.

AI assistance generated implementation, tests, and documentation and helped run
verification. User review and independent scientific validation remain separate
from automated checks. No deployment or submission has been performed.

## F02 contract and client

`src/api/client.ts` exports `createApiClient` for explicit configuration and
`configuredApiClient` for Vite's public VITE_API_BASE_URL. Missing/invalid URL
configuration fails safely. There is no fallback host, redirect following,
cookie authentication, automatic retry, or fixture fallback. The only routes are
GET regions and POST analyses. Pass an AbortSignal to either method; browser
cancellation does not guarantee server work stops.

Analysis timeout is 270 seconds, regions 15 seconds, including response body
parsing. Reconcile analysis timing if the backend's 240-second budget changes.
ApiError distinguishes HTTP, network, timeout, abort, invalid request, and invalid
response. Valid backend errors retain safe code/message/details and Retry-After
seconds. Malformed payloads and transport failures use generic messages without
raw diagnostics. Render error messages as text.

`npm run generate:api` generates types and standalone runtime validators from
`backend/fixtures/openapi.json`. `check:api` detects drift without writing files.
Do not manually edit generated openapi.d.ts or validators.js. Validation preserves
nulls, rejects invalid nested types/dates/nonfinite numbers, and neither coerces
values nor fills defaults. TypeScript 5.9 satisfies the OpenAPI generator's peer
range. Ajv compiles standalone validators during generation, not in the browser.

Eight Node tests cover the real B09 response and controlled failure cases.
`check:client-bundle` separately bundles the unwired client for browsers and checks
for CommonJS/Node runtime references. Real HTTP/CORS/UI checks also pass in the browser suite.

## F03 filters and request states

Start the backend with its README command and run npm run dev. The ignored local
frontend/.env points at http://127.0.0.1:8000. For this frontend's default origin,
the backend ALLOWED_ORIGINS must explicitly include http://127.0.0.1:5173; localhost
is a distinct origin. Keep database settings only in backend configuration.

The dashboard loads city options/defaults/bounds, then waits for Analyze. Correct
invalid years inline. Editing fields cancels ownership of an active request; the
Cancel request action does likewise. Backend work may continue after browser abort.
Errors retain previous results and provide deliberate retry advice. No automatic
analysis retry or automatic default analysis is performed. Newest-request IDs guard
against old successes and errors, independently of abort behavior.

The final suite includes store concurrency/failure cases, server-rendered markup,
and actual browser interaction with both controlled cases and a real backend.

## F04 metrics and charts

Summary values and four annual charts use backend fields without recalculation.
The backend supplies the five-year rolling mean. Duration and intensity have
separate charts/units; no regression fit is invented. Null values remain gaps,
zero remains numeric zero, and display values round to two decimals. Partial years
have starred labels, an explicit list, hatched bars, and tooltip/table reasons.
The annual table provides every chart value plus coverage and peak temperatures.
Chart code loads only after a successful analysis; all sections retain the response
selection label during reanalysis.

The real-response fixture is test-only. Narrow-screen chart rendering, actual
tooltip interaction, and page overflow checks pass in standalone Chromium.

## F05/F06 interpretation and evidence

Insights/trends are backend-provided. Events paginate ten records per page and
separate full metrics from observed segments, uncertain candidates, and truncated
runs. Methodology/quality sections explain the fixed annual threshold, missing
days, counting rules, reanalysis/grid-point limits, incomplete years, and boundary
exclusions. Expand baseline/source details for annual coverage and retrieval times,
cache status, returned grid coordinates, and revisions. Attribution links point to
Open-Meteo and CC BY 4.0. All metadata remains tied to the displayed response.

Mobile rendering, native disclosures, and axe checks pass. Manual screen-reader
speech output and other browser engines are not claimed.

## F07 responsive/accessibility review

Control-border contrast, touch targets, narrow filter/header wrapping, skip-link
focus, and reduced-motion styles have been improved. All 21 tests and the build
pass; the new test checks actual CSS text/action/focus/control color pairs.
Real Chromium keyboard/viewport tests pass. Reflow uses a 720 CSS-pixel viewport
(200%-zoom equivalent from 1440px) plus 200% root-font resizing. This is not a claim
of manual zoom-menu or speech-output testing.

## F08/F09 production-browser verification and deployment preparation

After normal setup, install the test browser and run:

```powershell
npx playwright install chromium
npm run test:browser
npx playwright show-report "$env:TEMP/climate-hazard-verification/browser-report"
```

Tests build a real production bundle and launch separate services on 5180/8001.
Atlas must be configured as for normal backend startup. No source environment is
printed. Controlled responses are test-only; the separate live case queries actual
Delhi/default/repeat and Mumbai/2020 data and checks local CORS. The normal build
can be restored afterward with `npm run build` using your public API URL.

Reports, traces, and screenshots live under the OS temporary directory in
`climate-hazard-verification/` to avoid OneDrive sync locks. Existing ignored old
artifacts were not deleted. The tests do not move the project or disable OneDrive.
See [verification](VERIFICATION.md) and [deployment preparation](DEPLOYMENT.md).
Nothing is deployed; Docker image checks remain unavailable while the Docker
Desktop daemon is stopped. Public hosting/network/timeout checks are pending.
