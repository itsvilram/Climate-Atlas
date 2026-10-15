# Climate Hazard Trend Analyzer: Overall App Plan

Status: backend and frontend implemented with local automated review complete. See task indexes and frontend/VERIFICATION.md for evidence and review status. Nothing deployed or submitted; host/container/public verification remains pending.

## 1. Goal and scope

Build a working web app that lets a user select a city and historical years, detect heatwaves, and understand changes in their frequency, duration, and intensity.

Implement the backend first, verify its results and API contract, then build the frontend against that API. Prioritize a reliable deployed core within the assignment's approximate 8-10 hour scope.

### Core version

- Heatwave is the default and only implemented hazard.
- Select from a small curated list of Indian cities, initially Delhi, Mumbai, Bengaluru, Chennai, and Hyderabad.
- Represent each city by a documented coordinate. Results describe the weather grid point near that coordinate, not an average over the entire city or state.
- Select complete calendar years between 1990 and 2025, with a maximum 36-year range. Default: Delhi, 1990-2020.
- Display annual event counts, heatwave days, duration, and intensity, with a rolling average and descriptive trend.
- Provide event details, data-quality information, methodology, and cautious summary insights.
- Store fetched weather and computed results in MongoDB Atlas; repeated requests use stored results.

### After the core works

CSV export is the first optional enhancement. Map selection, custom boxes, additional hazards, PDF export, and advanced statistical tests are deferred. City selection satisfies the initial geographic selection scope; a map is optional.

## 2. Proposed technology choices

| Layer | Choice | Purpose |
| --- | --- | --- |
| Frontend | React, TypeScript, Vite | Interactive dashboard with typed API data |
| Charts | Recharts | Interactive annual plots and tooltips |
| Backend | Python, FastAPI, Pydantic | Validated JSON API and generated API documentation |
| Database driver | PyMongo synchronous | Connect to the selected Atlas setup |
| Database | MongoDB Atlas Free | Persistent weather cache and analysis results |
| Weather source | Open-Meteo Historical Weather API, fixed ERA5 model | Consistent historical daily maximum temperatures |
| Calculations | NumPy and small dedicated Python functions | Percentiles, event detection, rolling averages, regression |
| Validation | Pytest; frontend build and browser checks | Verify climate rules, API behavior, and user flow |

Open-Meteo supplies reanalysis data: modeled historical estimates informed by observations, rather than a local weather-station record. Pinning one model avoids mixing datasets across years. Verify the exact API parameters and usage limits during backend implementation.

Official references:

- [Open-Meteo historical API](https://open-meteo.com/en/docs/historical-weather-api)
- [PyMongo connection guide](https://www.mongodb.com/docs/languages/python/pymongo-driver/current/connect/mongoclient/)

## 3. Architecture and data flow

```text
React dashboard
    |
    | HTTPS JSON request: city + start year + end year
    v
FastAPI backend
    |-- Validate input and enforce request limits
    |-- Read cached analysis from MongoDB
    |-- If absent, read stored weather and fetch missing yearly blocks
    |       |
    |       v
    |   Open-Meteo -> validate -> store weather in MongoDB
    |
    |-- Read stored weather -> calculate heatwaves and trends
    |-- Store analysis -> read saved analysis -> return JSON
    v
React charts, metrics, event table, and explanations
```

The browser never connects directly to MongoDB and never receives database credentials. The backend owns weather fetching and calculations.

## 4. Heatwave methodology

These are proposed, documented assumptions rather than an official meteorological warning definition.

### Threshold

- Use daily maximum air temperature in Celsius.
- Fix the reference period to **1990-2020** for all selected analysis ranges.
- Calculate the 95th percentile of valid daily maxima over that full reference period using a documented linear percentile method.
- A hot day must be strictly above the threshold; equality does not qualify.
- This simple annual threshold identifies exceptionally hot periods. It does not adjust for seasonal variation and must be labeled accordingly.
- Require at least 95% valid reference-period days and adequate coverage in each reference year; otherwise reject the analysis with an insufficient-data explanation.

### Events and boundaries

- A heatwave is a run of at least three consecutive qualifying calendar days.
- Sort dates, detect duplicates, and treat missing or invalid dates as breaks in a run. Do not interpolate missing temperature values to create events.
- Detect events across December-January continuously. Fetch at least the full preceding and following calendar years where available, extending boundary data if a hot run remains open.
- Preserve full event dates and durations; flag any event truncated by the provider's data boundary.
- For unresolved outer boundaries, show observed dates/metrics separately; unknown full boundaries/duration/peak/intensity are null. Retain short open runs as uncertain candidates. Exclude all truncated runs/candidates from complete totals, mark their affected selected years incomplete, and exclude those years from trends and comparisons even when daily coverage is adequate.
- Count an event in the year it starts. Allocate heatwave days to the actual year of each day, including days in an event that started before the selected range.
- Explain this convention so an annual heatwave-day total can be positive even when the event-start count is zero.
- Leap days remain normal calendar days.

### Metrics and trends

| Metric | Definition |
| --- | --- |
| Annual frequency | Number of qualifying events starting in that year |
| Heatwave days | Number of days in qualifying events occurring in that year |
| Mean/max duration | Mean/maximum full duration of events starting in that year |
| Intensity | Mean temperature exceedance above the threshold across heatwave days in that year, in degrees Celsius |
| Peak temperature | Highest daily maximum among heatwave days in that year |
| Rolling average | Trailing five-year mean of annual frequency, shown only for complete valid windows |
| Regression slope | Descriptive linear change in annual event count, expressed as events per decade |

For years without events, frequency and heatwave days are zero; duration, intensity, and peak temperature are null rather than misleading zeros.

Mark years below 95% valid daily coverage as incomplete, expose observed counts as partial, and exclude them from trend fitting and comparison insights. Require at least ten eligible years for a regression trend. Do not describe the slope as statistically significant or attribute it to a cause.

For ranges of ten years or more, compare average event counts in the first and last five-year windows only when both windows have complete eligible years. If the initial average is zero, report an absolute change instead of dividing by zero. Shorter ranges show observed totals without a long-term percentage claim.

## 5. Data storage and caching

Database name: `climate_hazard_analyzer`.

| Collection | Stored information | Key/index |
| --- | --- | --- |
| `weather_years` | City coordinates, model, timezone, year, compact arrays of dates and daily maxima, units, quality flags, fetch timestamp, data revision | Unique city + model + year + schema version |
| `analyses` | Request parameters, baseline and method version, source revisions, annual metrics, events, threshold, insights, quality metadata | Unique deterministic analysis key |

Store weather in yearly documents rather than one document per daily value to reduce Atlas storage and indexing overhead. Keep cities in backend configuration rather than adding an unnecessary collection.

- Cache finalized historical weather for 30 days, then refresh on demand.
- Reuse overlapping years and the common reference period across queries.
- Invalidate analysis when a weather revision or methodology version changes; source freshness must be checked before returning cached analysis.
- Coalesce identical requests within the running backend and use unique indexes/upserts to prevent duplicate records.
- Bound analysis cache size, remove stale versions, and monitor database usage so repeated queries remain within the free tier.
- Cache metadata includes provider, model, coordinates, timezone, units, coverage, and retrieval time.
- On provider failure, return still-usable stored data with an explicit stale-data warning, or a clear error when adequate data is unavailable. Never substitute synthetic data silently.

## 6. Proposed API contract

| Endpoint | Purpose |
| --- | --- |
| `GET /api/v1/health` | Basic service status without credentials or infrastructure details |
| `GET /api/v1/regions` | Supported city IDs, names, coordinates, and supported years |
| `POST /api/v1/analyses` | Accept `region_id`, `start_year`, `end_year`, and `hazard: heatwave`; return saved analysis |

Analysis response groups:

- `region` and `period`: selected city, representative coordinates, years.
- `methodology`: baseline, percentile, threshold, minimum run length, method version.
- `summary`: totals and duration/intensity metrics with their units and counting convention.
- `annual_metrics`: chart-ready yearly values, coverage, completeness flags, and rolling average.
- `trend`: slope and window comparison, or an explanation when not available.
- `events`: dates, full duration, peak temperature, and boundary flags.
- `insights`: short statements derived from those values.
- `data_quality` and `source`: coverage, warnings, reanalysis attribution, model, cache/fetch metadata.

Use a consistent error shape with a safe message and error code. Handle invalid input, insufficient data, provider failure, database failure, and rate limits distinctly.

The first version uses a bounded synchronous request executed away from the async event loop. Fetch yearly blocks with conservative concurrency, finite retries, and an overall time budget. Warm the default demo query before delivery. If real cold requests cannot complete within hosting limits, introduce a persisted job/status API before frontend integration.

## 7. Frontend user experience

One responsive dashboard:

1. Header with app name and a brief purpose.
2. Filters: city, fixed Heatwave selector, start/end year, and Analyze button.
3. Loading, empty, validation, and retryable error states.
4. Summary cards: event count, heatwave days, average duration, and peak temperature.
5. Annual event count chart with five-year rolling average.
6. Heatwave-day and intensity/duration charts with explicit units and tooltips.
7. Evidence-based insight panel, including unavailable-trend explanations.
8. Event table with dates, durations, and peak temperatures; paginate long lists.
9. Methodology and data-quality panel explaining the threshold, city approximation, source, and limitations.

Retain the last successful results during a new request, visibly label their parameters, disable duplicate submissions, and prevent late responses from replacing newer selections. Chart information should also be accessible in text/table form. Use readable contrast, keyboard-operable inputs, and mobile layouts.

## 8. Part 1: Backend implementation

1. Create backend structure, dependency configuration, `.env.example`, and `.gitignore`.
2. Configure Atlas connection through environment variables and test connectivity without logging secrets.
3. Implement region configuration, input schemas, and API skeleton.
4. Implement weather fetching, units/date validation, coverage checks, yearly caching, and indexes.
5. Implement baseline threshold, event detection, annual aggregation, and trends as independently testable functions.
6. Implement persisted analysis responses, consistent errors, timeouts, rate limiting, and CORS configuration.
7. Test core climate edge cases and cache/API behavior; run a real-data smoke check.
8. Record the API contract, warm the default query, and prepare deployment settings.

Backend acceptance criteria:

- A valid request returns real-data results read from MongoDB.
- Repeating it reuses cached data without unnecessary provider calls.
- Different selected ranges use the same baseline threshold.
- Tests cover two-day vs. three-day runs, threshold equality, missing days, leap days, cross-year events, incomplete coverage, no events, and zero comparison denominator.
- Invalid input and upstream failures return useful errors.
- No secrets appear in responses, logs, or committed files.

## 9. Part 2: Frontend implementation

1. Scaffold React/TypeScript and configure the backend API base URL.
2. Build the responsive dashboard and filter validation.
3. Integrate region and analysis requests with all request states.
4. Add metrics, charts, insights, events, methodology, and quality warnings.
5. Verify default and alternate cities, different ranges, empty results, error recovery, keyboard access, and mobile layout.
6. Run the production build and test the deployed frontend/backend together.
7. Add CSV export only if core checks pass and time remains.

Frontend acceptance criteria:

- A user can select a city/range and get understandable results.
- Charts and displayed metrics agree with the backend response.
- Units, reference period, source, and missing-data limitations are visible.
- No-data years are distinguished from zero-event years.
- Loading and failure states are clear; the deployed app works on mobile and desktop.

## 10. Security and deployment

- Keep `MONGODB_URI` only in backend environment variables; commit placeholders only.
- Use a dedicated database user limited to the application database.
- Configure Atlas network access for local development and the chosen hosting environment.
- Allow requests only to configured weather-provider hosts; accept city IDs, not arbitrary URLs.
- Validate years and hazard; bound external requests and returned event lists.
- Apply a configurable per-IP request limit and a lower limit to cold computations. Document that an in-memory limiter covers a single backend instance.
- Allow only the intended frontend origins through CORS.
- Use one reused MongoClient with connection timeouts and pooling.
- Deploy frontend and backend separately, with Atlas shared between environments as appropriate.
- Candidate platforms: Vercel/Netlify for frontend and Render or another Python-capable host for backend. Verify current free-tier availability, request timeouts, and outbound connectivity before choosing.
- Record cold-start limitations and check the public demo immediately before submission.

## 11. Proposed project layout

```text
backend/
  app/
    main.py
    config.py
    schemas.py
    api/
    services/      # weather fetching and analysis orchestration
    climate/       # detection, aggregation, trends
    repositories/ # MongoDB access
  tests/
  .env.example
  pyproject.toml
frontend/
  src/
    api/
    components/
    pages/
    types/
  .env.example
  package.json
README.md
.gitignore
PROBLEM.md         # local/private; exclude from public repository
APP_PLAN.md
```

## 12. Time allocation and delivery

| Work | Target |
| --- | --- |
| Backend configuration and data pipeline | 2 hours |
| Climate logic, API, meaningful tests | 2.5 hours |
| Frontend dashboard and integration | 2.5 hours |
| Deployment, full-flow checks, README | 1.5 hours |
| Buffer or optional CSV export | 0.5-1.5 hours |

Adjust estimates after the first real weather/API check. If time becomes tight, cut optional exports and visual polish first while preserving persistence, correct logic, and deployment.

Delivery checklist: public solution repository excluding the confidential brief/summary, working deployed URL, README with setup/architecture/methodology/assumptions/limitations, and accurate AI-use disclosure. Submission deadline: **15 October 2026, 11:59 PM IST**.

## 13. Review checkpoint

Review this overall plan first. Once accepted, the next step is a detailed backend plan and backend implementation. Frontend implementation follows after the backend contract and climate calculations are verified.
