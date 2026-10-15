# Backend Implementation Plan

Status: B01–B09 implemented and accepted; local regression/Atlas/frontend-integration checks pass. Deployment and container runtime verification remain external pending checks. Shared scope and methodology are defined in `APP_PLAN.md`.

## Task execution

The backend is divided into **three phases with three tasks each** in [the backend task index](tasks/backend/README.md). Each task defines its problem, proposed solution, completion checks, and review gate without code. Implement one task at a time, review and fix it, and wait for user acceptance before starting the next task.

## Objective

Deliver a Python API that fetches real historical weather, persists it in MongoDB Atlas, detects heatwaves, and returns reproducible analysis suitable for frontend charts.

## Stack and configuration

- Python, FastAPI, Pydantic, PyMongo synchronous, NumPy, HTTPX, Pytest.
- Database: `climate_hazard_analyzer` on the existing Atlas cluster.
- Environment variables: `MONGODB_URI`, `MONGODB_DB`, `ALLOWED_ORIGINS`, provider/request timeout settings, and configurable rate limits.
- Commit `.env.example` with placeholders; ignore `.env`, local environments, cache files, and the confidential problem summary.
- Reuse one MongoClient with bounded connection timeouts. Close it on shutdown.
- Keep synchronous database/network work in synchronous routes or a worker thread so it does not block the async event loop.

## Modules

```text
backend/
  app/
    main.py                 # startup, routes, CORS, error handlers
    config.py               # environment settings
    regions.py              # curated cities and coordinates
    schemas.py              # request/response validation
    api/analyses.py
    services/weather.py     # fixed-provider client and normalization
    services/analysis.py    # cache and calculation orchestration
    repositories/weather.py
    repositories/analyses.py
    climate/threshold.py
    climate/events.py
    climate/metrics.py
    climate/trends.py
  tests/
  .env.example
  pyproject.toml
```

## Step 1: API skeleton and database access

- Configure Delhi, Mumbai, Bengaluru, Chennai, and Hyderabad with stable IDs and representative coordinates/timezones.
- Support complete years 1990-2025; default Delhi, 1990-2020.
- Validate known city IDs, integer years, start <= end, allowed range, and `heatwave` hazard only.
- Connect with a dedicated database user and verify Atlas connectivity without printing the URI/password.
- Create unique indexes before accepting analysis requests.
- Add basic health and region endpoints.

Completion check: service starts, health and region responses validate, invalid requests are rejected, and Atlas is reachable.

## Step 2: Weather ingestion and persistent cache

Source: [Open-Meteo Historical Weather API](https://open-meteo.com/en/docs/historical-weather-api). Verify current parameters, limits, and attribution requirements when implementing.

- Request daily `temperature_2m_max`, Celsius, fixed ERA5 model, and the city's local timezone.
- Fetch the union of the 1990-2020 baseline and requested years, plus boundary years needed for event continuity.
- Split fetches into yearly blocks; start with sequential fetching and increase to bounded concurrency only if measured latency requires it and provider limits permit it.
- Set per-call and total-operation timeouts. Retry transient failures finitely, with backoff and respect for provider rate-limit responses.
- Validate date/value array lengths, units, dates, finite numbers, duplicate dates, and plausible temperature bounds. Treat implausible values as flagged invalid observations; document bounds.
- Reconstruct the full expected daily calendar. Missing/invalid values stay missing; never interpolate them for heatwave detection.
- Persist normalized blocks before analyzing and read the stored records back for calculations.

`weather_years` document fields:

| Field group | Contents |
| --- | --- |
| Identity | region ID, coordinate/config version, model, year, schema version |
| Daily data | Matching date and maximum-temperature arrays; null for invalid/missing values |
| Provenance | Provider, returned grid coordinates, timezone, Celsius units |
| Quality | Expected/valid day counts, coverage, flags |
| Cache | Fetched timestamp and content revision/hash |

Use a unique identity index and upserts. Reuse fresh blocks for 30 days. Refresh expired blocks on demand and invalidate dependent analyses when content revisions change. If refresh fails, adequate cached records can be used with a stale-data warning; absence of usable data produces an error.

Completion check: a second overlapping query reuses stored years; bad provider payloads do not become valid cached records.

## Step 3: Climate calculation functions

### Threshold

- Fix the baseline to 1990-2020, independent of selected years.
- Require >=95% valid days overall and in each baseline year.
- Calculate the 95th percentile of valid daily maxima using NumPy's linear method.
- Use strictly greater than the threshold, not greater than or equal.
- Identify this as a simple annual percentile definition, not an official heat alert or seasonal threshold.

### Event detection

- Detect runs of >=3 qualifying consecutive calendar days.
- Missing/invalid days break a run; leap days are ordinary dates.
- Detect over a continuous date sequence, not separately for each year.
- Fetch preceding/following years and extend if an event remains open at a loaded boundary, within a configured operation/data limit. If that limit or source boundary is reached, flag truncation instead of claiming a complete duration.
- Preserve full event dates, duration, peak temperature, and mean threshold exceedance.
- Return events intersecting the selected period, with whether they started inside it. Count events by start year; allocate days by their actual year.
- Unresolved outer boundaries expose observed segments separately from null full-event metrics; short open runs remain uncertain candidates. Exclude truncated runs/candidates from complete totals and mark affected selected years incomplete for rolling/regression/comparison eligibility, even with >=95% daily coverage. B05 defines these flags; B06 applies the policy.

### Aggregation and trends

- Annual values: event count, heatwave days, mean/max event duration, mean daily exceedance, peak temperature, coverage, completeness.
- Summary event count/durations use events starting within the selection; selected-period heatwave days/intensity include intersecting events. Include these definitions in response metadata.
- No events: count/day totals zero; duration/intensity/peak values null.
- Coverage <95%: partial observed values and incomplete flag; exclude from trend/comparison calculations.
- Five-year trailing frequency average requires all five consecutive years eligible.
- Regression requires at least ten eligible years and uses actual calendar years; report slope per decade and fit-year count without significance/causal claims.
- Compare first/last five calendar-year windows only for ranges >=10 years and fully eligible windows. Zero starting average gives absolute change, not a percentage.

Completion check: calculations are deterministic and independent of API/database code.

## Step 4: Analysis endpoint and saved results

| Endpoint | Contract |
| --- | --- |
| `GET /api/v1/health` | Basic service availability; no sensitive diagnostics |
| `GET /api/v1/regions` | Cities, coordinates, year limits, default selection |
| `POST /api/v1/analyses` | Validated selection -> persisted analysis JSON |

Request example:

```json
{"region_id":"delhi","start_year":1990,"end_year":2020,"hazard":"heatwave"}
```

Response top-level groups: `region`, `period`, `methodology`, `summary`, `annual_metrics`, `trend`, `events`, `insights`, `data_quality`, `source`.

- Define explicit units and nullable fields in Pydantic schemas.
- Use JSON-safe finite numbers and ISO dates; exclude MongoDB internal IDs.
- Analysis cache key includes selection, coordinate/model version, baseline, method version, and source revisions.
- Check source freshness before serving a cached analysis.
- Store generated results in `analyses`, then read the saved document for the response.
- Coalesce identical cold work within one process; unique indexes prevent duplicate persisted entries.
- Bound cache size and remove obsolete versions.
- Generate insights from metrics rather than hard-coded percentage claims.

Errors use a stable shape: `error.code`, `error.message`, and safe optional details. Suggested statuses: 422 invalid input/insufficient data, 429 rate limit, 502 provider failure, 503 database unavailable, 504 operation timeout. Normalize framework validation errors to the same contract.

Completion check: the response validates against its schema and charts can consume it without recalculating climate logic.

## Step 5: Security and operational limits

- Allow only configured provider hosts; users cannot supply arbitrary fetch URLs or coordinates.
- Configure explicit frontend CORS origins.
- Apply per-IP request limits and a stricter limit for cold computations; trust forwarded IP headers only from a configured proxy.
- Bound concurrent work, timeouts, retries, cache growth, and output size.
- An in-process limiter/coalescer is suitable only for the initial single-instance deployment; document this limitation.
- Log request outcome, timing, and cache status without credentials or raw connection strings.
- Use a database user restricted to the application database; configure Atlas network access for the backend host.

## Step 6: Meaningful verification

| Area | Checks |
| --- | --- |
| Threshold | Stable across requested ranges; equality excluded; inadequate baseline rejected |
| Events | Two vs. three days, missing-day break, leap day, cross-year run, boundary truncation |
| Metrics | Day allocation vs. start-year count; no-event nulls; incomplete coverage |
| Trends | Complete rolling windows, actual years for regression, insufficient years, zero denominator |
| API | Valid/invalid selections, response shape, safe errors, rate limit |
| Persistence | Overlapping-year reuse, cache hit, changed revision invalidation, stale fallback |
| Real data | One city query persisted in Atlas; repeat query uses cache; independently inspect sample event dates/temperatures |

Use synthetic fixtures only for automated edge-case tests. The actual demo uses real provider data.

## Step 7: Frontend handoff and deployment preparation

- Freeze response types and give the frontend an example fixture generated from a real successful request.
- Document local run command, environment variables, API errors, and source/methodology assumptions.
- Warm the default Delhi query.
- Measure a cold alternate-city request against the chosen host's request limit. If it cannot finish reliably, change to a persisted job/status API and update the frontend plan before integration.
- Verify deployment health, MongoDB access, CORS, and one public analysis request.

## Backend definition of done

- [x] Real weather data and results are persisted in Atlas.
- [x] Climate functions pass the listed edge-case tests.
- [x] Repeated/overlapping queries reuse data correctly.
- [x] Safe, documented JSON contract is ready for the frontend.
- [x] Quality warnings and methodology limitations are returned explicitly.
- [x] Secret/private-file exclusions are configured; verification outputs omit credentials.
- [x] Deployment configuration is prepared and local real-data smoke checks pass; container/host/public verification remains pending.

Next stage: frontend implementation using the verified API. This document does not authorize or perform deployment/submission by itself.
