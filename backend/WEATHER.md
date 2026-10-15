# Weather ingestion and cache (B03)

This service runs synchronously in worker threads. It adds no analysis endpoint or
climate calculations. The application lifespan owns one `WeatherService` when
MongoDB is configured and closes its HTTP client on shutdown. Direct consumers
must close services they create.

## Provider verification

Checked 15 October 2026 against the official [historical API documentation](https://open-meteo.com/en/docs/historical-weather-api).
The fixed endpoint is `https://archive-api.open-meteo.com/v1/archive`; requests pin
`models=era5`, `daily=temperature_2m_max`, `temperature_unit=celsius`,
`timeformat=iso8601`, and the configured city timezone. Coordinates come only from
the curated region configuration. Redirects are rejected. ERA5 is reanalysis, not
a station observation. Source coverage begins in 1940 with a five-day delay.

The [free API terms](https://open-meteo.com/en/terms) allow non-commercial use below
600 calls/minute, 5,000/hour, and 10,000/day. The [pricing documentation](https://open-meteo.com/en/pricing)
counts long periods as multiple calls, so one yearly HTTP request is not one
billable call. Requests run sequentially with at least three seconds between starts.
This pacing is per service instance; deployment-wide quotas and request admission
remain B08 work. Avoid multiple concurrent weather operations on one service until
B07/B08 adds admission/coalescing. Repeated cached reads consume no provider calls.

The [data licence](https://open-meteo.com/en/licence) is CC BY 4.0. Stored source
metadata carries provider/dataset credit, provider and licence links, and an
explanation of normalization changes. The future UI must display linked Open-Meteo
attribution alongside its weather-derived data; no UI work is included in B03.

## Normalization and storage

- Reconstruct all 365/366 ISO calendar dates in sorted order, preserving February
  29. Missing dates become null; supplied nulls remain null. Never interpolate.
- Reject invalid/out-of-year/duplicate dates, missing fields, empty calendars,
  mismatched arrays, wrong date/temperature units, timezone/UTC-offset mismatch,
  and invalid or distant grid coordinates. Grid points must be within one degree
  of the requested point, a deliberately generous validation guard for this model.
- Accept `Asia/Kolkata` and its `Asia/Calcutta` provider alias; verify local offsets.
  `tzdata` supplies portable IANA timezone data on Windows.
- Non-numeric values, booleans, NaN/infinity, and temperatures outside **[-90, 65] °C**
  become flagged nulls. These are broad application plausibility bounds, not a
  definition of heatwaves. Valid endpoints are inclusive.
- Quality stores expected/valid day counts, coverage fraction, and a reason per
  null date: `missing_date`, `provider_null`, `invalid_value`, or
  `implausible_temperature`. Low coverage is preserved and exposed, not represented
  as zero temperature. B04 will enforce reference-period coverage.
- Each year includes requested/grid coordinates, canonical/provider timezone,
  UTC offset, units, attribution, aware UTC retrieval time, and identity fields
  (region, coordinate version, ERA5 model, year, schema version).

Normalized documents are upserted then read from MongoDB; consumers receive the
saved record without `_id`. Failed payload validation never writes the response.
Readback and cache reuse revalidate the calendar, metadata, values, quality, and
content hash; malformed cache entries trigger a refresh instead of being reused.

## Cache and revisions

Reuse records less than 30 days old. Exactly 30 days triggers refresh. Future-dated
records are not fresh and cannot be used as stale fallback. A SHA-256 content
revision covers identity, normalized observations, flags, and source metadata;
it excludes retrieval time and MongoDB `_id`. Identical refreshed content keeps
its revision; changed values/metadata change it. B07 must check freshness first
and include these revisions in the analysis cache key before reusing results.
No analyses are generated or deleted by this task.

If refresh fails, a validated stored year with at least 95% coverage can be returned
with `cache_status=stale` and `stale_weather_data` warning. Its original timestamp
and revision remain intact. Missing/corrupt/inadequate records produce a safe
provider/validation error. Database failures do not silently fall back to memory.
An exhausted operation budget terminates work; it cannot be extended by fallback.

## Year planning and B05 coordination

```python
operation = service.operation("delhi")
years = operation.load_selection(selection)
# Later, B05 can explicitly request adjacent context with the same operation:
previous = operation.extend(-1)
following = operation.extend(1)
```

The plan is the union of 1990–2020, selected complete years, and the preceding and
following selected calendar years where fully available. No partial current-year
records are cached. The latest complete year is based on UTC today minus the
provider's five-day delay. Thus in October 2026 the latest complete year is 2025;
2026 cannot supply full following-year context. `maximum_year` exposes that limit.

Each operation shares one monotonic budget and a maximum 40 unique years,
including extensions. `extend` loads only the next adjacent year and returns
`None` at the source/year-count boundary. B05 must decide whether a run is open,
request extensions, and flag truncation if context cannot be completed. B03 never
chooses arbitrary extra years based on temperatures.

B05 can pass `from_year=loaded_boundary_year` to `extend` when a gap separates the
baseline from selected-period context. The anchor must already be loaded; only
its immediately adjacent year can be added, with the same budget and year cap.

## Bounds and verification

`WEATHER_CALL_TIMEOUT_SECONDS=20`, `WEATHER_OPERATION_TIMEOUT_SECONDS=240`,
`WEATHER_MAX_RETRIES=2`, `WEATHER_REQUEST_INTERVAL_SECONDS=3`, and
`WEATHER_MAX_YEARS=40` are configurable within validated bounds. The per-call
allowance is split among HTTP I/O phases; streaming checks the remaining monotonic
budget and caps decoded response size at 256 KB. MongoDB work uses the remaining
operation deadline as well as its own timeout. Deadlines are cooperatively checked
between synchronous operations; socket timeouts bound individual I/O waits.

Only 408, 429, 500, 502, 503, 504 and transport failures retry (at most three total
attempts by default). Backoff starts at 0.5 seconds and doubles. `Retry-After`
seconds/HTTP dates are honored if they fit the operation budget; no early retry is
performed when they do not. Bad payloads and other HTTP errors do not retry.

Run from the repository root:

```powershell
./backend/.venv/Scripts/python.exe -m pytest backend/tests -q
./backend/.venv/Scripts/python.exe -m app.verify_weather
```

The opt-in real-data check uses Delhi 2020/2021, retains those real weather cache
documents, reconnects to Atlas to check persistence and overlap reuse, and prints
only non-sensitive status/quality information. It does not warm the full baseline
or default analysis. Missing-data and malformed-provider cases use synthetic
fixtures only in automated tests.
