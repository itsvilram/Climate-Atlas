# Local application verification — 15 October 2026

Backend and frontend implementation is complete for local review. Deployment is
not performed. The user's instruction to finish all remaining work superseded the
individual stop-after-each-task gates; it does not turn agent checks into user acceptance.

## Automated evidence

| Check | Outcome |
| --- | --- |
| Backend regression | 240 passed; one existing Starlette/HTTPX TestClient deprecation warning |
| Frontend Node/SSR tests | 21 passed |
| TypeScript (including browser tests/config) and production build | Passed |
| Generated OpenAPI drift and browser-client bundle | Passed |
| Production dependency audit | Zero known vulnerabilities at verification time |
| Python dependency compatibility | No broken requirements |
| Production Chromium browser suite | 8 passed; viewport, keyboard, accessibility, controlled failures, and real HTTP integration |

Playwright starts a production preview on port 5180 and a separate real backend on
8001 with explicit CORS. It never replaces the user's dev server or weakens TLS.
The local Atlas secret is read only by the backend. Run after normal dependency setup:

```powershell
npx playwright install chromium
npm run test:browser
npx playwright show-report "$env:TEMP/climate-hazard-verification/browser-report"
```

`npm test` covers concurrency/abort/unmount, malformed responses, safe errors,
timeouts, Retry-After, nullability, climate-field presentation, pagination, and
metadata. Browser tests add actual rendered charts/tooltips, native form validation
messages, keyboard skip link/focus, pagination/disclosures, controlled retry/recovery,
and late-response protection.

## Responsive and accessibility evidence

Chromium checks the no-analysis and successful dashboard at 1440×900, 375×812,
and 320×812. Document scroll width does not exceed the viewport; wide tables have
their own keyboard-focusable horizontal scroll regions. Baseline and source
disclosures are opened for these checks. Four SVG charts render at each size.
Chart values have an annual table alternative and incomplete years have text and
pattern cues. axe reports no violations under the tested WCAG A/AA tags.

Keyboard tests activate the skip link, check input focus styling, submit an invalid
range, submit a valid range, paginate events, and expand counting rules. Reflow is
tested at a 720 CSS-pixel viewport (equivalent to 200% zoom of a 1440px layout),
with an additional 200% root-font resize. This is not a claim of manually operating
browser zoom UI or listening to a screen reader. Native live regions, labels,
table headers, and disclosure semantics are verified by markup/axe/keyboard checks;
manual speech output and cross-browser testing remain additional validation.

Final screenshots, traces, and report are generated under the OS temp directory
`climate-hazard-verification/` (screenshots, browser-results, browser-report).
Earlier ignored workspace artifacts were retained, not deleted. Top screenshots were visually
inspected in addition to DOM assertions. These artifacts are local evidence, not
production assets or repository data.

## Real data versus controlled cases

Live browser integration uses actual backend responses, without route fixtures:
five city options, default Delhi 1990–2020, repeat cache hit with unchanged generation
time, and Mumbai 2020–2020. Delhi has 31 annual rows and 71 event starts. First
local run timings were about 1.33s/1.22s for default/repeat and 1.47s for Mumbai's
fresh short-range computation over stored weather. These are warm-data timings;
no claim of a new cold ingestion benchmark is made. Prior genuine cold Mumbai
took 144.61s; host compatibility remains unverified.

The independent backend `app.verify_analysis` also passed: HTTP response equals
the saved Atlas result and repeat requests add zero provider calls. Allowed local
CORS origin returns HTTP 200 with matching header; denied origin returns safe 403.

Controlled browser routes are test-only. They cover partial/null/stale/uncertain
records, zero/empty records, rate limit with Retry-After, malformed JSON, discovery
failure and recovery, insufficient data, busy/database/provider/timeout errors,
and out-of-order responses. They never become production fallbacks. Real data
cannot be assumed to reproduce every edge condition on demand.

## Review findings and remaining external checks

Earlier review fixed control contrast/targets, skip-link focus, narrow filter CSS
cascade, chart bundle loading, generated validator ESM compatibility, and Vite
test-cache interference. Final browser work corrected test setup rather than
masking product failures: simulated Retry-After needs CORS exposure just like the
real backend, and the city uses its accessible combobox name for robust discovery.
One expanded run passed every assertion but encountered OneDrive EBUSY while
closing a trace; output was moved to local temp and all eight tests passed cleanly.

No new climate calculations, optional export, authentication, maps, deployment,
or submission were introduced. No confidential brief/credentials were copied.
Ignored environment files, dependency folders, build/report output remain local;
gitignore does not control OneDrive syncing.

Docker CLI is installed but the Docker Desktop daemon is not running (named pipe
missing); backend image build/runtime remains unverified. Hosting selection,
timeouts, outbound network/Atlas restrictions, public HTTPS/CORS, and deployed
analysis/cache verification remain pending and require deployment authorization.
See [deployment preparation](DEPLOYMENT.md). Automated accessibility checks do not
establish full compliance or independent scientific validation.
