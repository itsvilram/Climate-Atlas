# Analysis API (B07)

Run the backend as documented in README.md. Configure the ignored `backend/.env`
for Atlas. Without database configuration, health/regions remain available and
analysis requests return a safe 503. Interactive schemas are at `/docs`; the exact
typed contract is `/openapi.json` and `app.analysis_schemas.AnalysisResponse`.

## Request

`POST /api/v1/analyses`, `Content-Type: application/json`:

```json
{"region_id":"delhi","start_year":1990,"end_year":2020,"hazard":"heatwave"}
```

The JSON body is required; `{}` uses the documented defaults. Only the five
configured city IDs, integer years 1990–2025 in order, and `heatwave` are accepted.
Strings/floats/booleans for years, unknown fields, unsupported hazards, malformed
JSON, and unknown cities return the common validation envelope. No arbitrary
coordinates, provider URLs, or database configuration are accepted in the request.

## Response groups

| Group | Contents |
| --- | --- |
| `region` | City ID/name, representative coordinates, canonical timezone |
| `period` | Selected start/end year and hazard |
| `methodology` | Fixed baseline, linear percentile, unrounded Celsius threshold, strict comparison, minimum run length, version, baseline quality, limitations |
| `summary` | Event starts, selected-period heatwave days, full-event duration, selected-day intensity/peak, completeness and excluded-boundary count |
| `annual_metrics` | One row per selected calendar year, metrics/coverage/completeness/reasons and nullable trailing five-year frequency mean |
| `trend` | Descriptive events/decade regression and first/last five-calendar-year comparison, with fit years and unavailable explanations |
| `events` | Intersecting complete events and explicitly uncertain/truncated candidates, full vs observed dates/metrics, qualification and start-in-selection flags |
| `insights` | Metric-derived statements; partial/unavailable results labelled |
| `data_quality` | Current warnings, incomplete selected years, excluded boundary records, units/counting metadata |
| `source` | Open-Meteo/ERA5 attribution, licence/changes, versions, generation time, cache status, and source-year revisions/retrieval times/grid points/coverage |

All numeric response fields reject non-finite values. Dates/datetimes use ISO
strings; unavailable metrics remain JSON null. MongoDB `_id`, internal cache keys,
and credentials are absent. Full daily weather arrays are not returned. See
[CLIMATE.md](CLIMATE.md) for exact counting and uncertainty rules, and
[WEATHER.md](WEATHER.md) for normalization, source attribution, and freshness.

## Persistence and cache

The synchronous route runs in a worker thread. One analysis service per running
process serializes weather operations and coalesces simultaneous identical
validated selections. Distinct pending selections are bounded. Queue waiting and
work share the operation time allowance. This is single-process coordination.
B08 adds [per-IP/cold limits and provider budgets](OPERATIONS.md); no distributed
lock or multi-instance limiter is claimed.

Before looking up an analysis, load required stored weather and refresh expired
years. On a possible cache hit, also recheck every referenced boundary-extension
year for freshness/revision changes, using the same year/time limits. The key
includes selection, the pipeline/threshold/baseline/model/coordinate/schema versions,
source revisions, stable boundary warnings, and context policy (source maximum year
and year cap). Changed revisions produce a new result. Transiently unresolved
boundary work is retried instead of cached indefinitely as a successful hit.

Computed results are validated/bounded, saved to `analyses`, and read back for the
response. Hits refresh current weather timestamps/cache statuses/stale warnings,
persist that metadata, and read back again. Generation time remains the original
calculation time. A payload hash prevents reuse of corrupted stored result data.
Stale warnings can appear or clear on an analysis hit without a content revision
change. Simultaneous followers receive `analysis_cache_status=coalesced` and the
same bounded result; ordinary statuses are `computed` or `hit`.

`analyses` has unique `analysis_key` and selection/last-access indexes. Cleanup only
touches records marked `cache_namespace=analysis-v1`: remove old pipeline signatures,
obsolete revisions for the same selection/policy, then least recently accessed
records beyond the configured cap. Unrelated database records are preserved.
Metadata refresh on hits also enforces the cap. Database errors never silently
substitute an in-memory response.

## Operational bounds and errors

| Setting | Default | Purpose |
| --- | --- | --- |
| `ANALYSIS_MAX_CACHE_ENTRIES` | 100 | Application-owned saved results; allowed 1–1000 |
| `ANALYSIS_MAX_EVENTS` | 5000 | Public event/candidate records; allowed 1–5000 |
| `ANALYSIS_MAX_RESPONSE_BYTES` | 4000000 | Compact UTF-8 JSON limit; allowed 1000–10000000 |
| `ANALYSIS_MAX_PENDING` | 8 | Distinct queued/running selections; allowed 1–32 |

Weather timeouts/retries/year limits still apply. Output excess fails explicitly;
events are never silently truncated. B08 implements per-IP/cold limits, proxy
policy, and HTTP/body admission. Deployment checks remain B09.

All errors use `{"error":{"code":"...","message":"..."}}`, with optional safe
validation `details` (field/code/message). Inputs, unknown field names, driver
exception text, raw provider bodies, and connection strings are not echoed.

| HTTP | Code | Meaning |
| --- | --- | --- |
| 422 | `invalid_input` | Body/schema validation |
| 400/408/413 | `invalid_input`, `request_timeout`, `request_too_large` | Invalid framing, slow body, excessive body |
| 403 | `origin_not_allowed` | Actual API request from a denied browser origin |
| 429 | `rate_limited`, `cold_rate_limited`, `rate_limiter_capacity` | Per-IP admission/tracker capacity, with Retry-After |
| 503 | `request_capacity` | HTTP concurrency cap reached |
| 422 | `insufficient_baseline_data` | Fixed baseline fails coverage requirements |
| 422 | `insufficient_weather_data` | Selected complete years not available yet |
| 429 | `provider_rate_limited` | Provider throttled ingestion; retry later |
| 502 | `provider_unavailable`, `invalid_weather_data` | Provider/normalization failure with no usable fallback |
| 503 | `database_unavailable` | Database not configured or operation failed |
| 503 | `analysis_busy`, `analysis_output_limit`, `weather_context_limit` | Work, response, or configured context capacity exceeded |
| 504 | `operation_timeout` | Time budget exhausted |
| varies | `http_error` | Framework HTTP errors, e.g. 404/405 |
| 500 | `internal_error` | Unexpected safe failure |

## Verification

From the repository root:

```powershell
./backend/.venv/Scripts/python.exe -m pytest backend/tests -q
./backend/.venv/Scripts/python.exe -m app.verify_analysis
```

The opt-in verifier issues real default POST requests through the ASGI application
with actual Atlas/Open-Meteo connections. It persists genuine weather/results,
compares the HTTP response with the stored document, and confirms repeat analysis
reuse without additional provider requests. It is a local integration check, not
a deployed/public HTTP smoke test. A cold default request may require over 30
sequential yearly fetches; no deployment latency claim is made by B07.
