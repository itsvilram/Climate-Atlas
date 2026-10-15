# Backend foundation and persistence

B01 provides service health, city configuration, environment settings, and the
selection schema. B02 adds optional MongoDB persistence. Health/regions can still
run without database credentials; persistence is unavailable in that mode.
B03 adds the [weather ingestion and cache service](WEATHER.md), with an opt-in
real-data smoke check. B04 adds the pure [baseline threshold calculation](CLIMATE.md).
B05 adds pure event detection and bounded boundary-context coordination. B06 adds
annual/summary metrics, descriptive trends, and insights. B07 adds the database-backed
[`POST /api/v1/analyses` endpoint](API.md).
B08 adds [operational controls](OPERATIONS.md): request/cold limits, proxy trust,
provider budgets, safe logs, and bounded HTTP concurrency/bodies.
B09 provides the [real-data frontend handoff](HANDOFF.md), public response/OpenAPI
snapshots, independent event audit, and deployment preparation.

## Local setup (Python 3.12 or newer)

From the repository root, in PowerShell:

```powershell
python -m venv backend/.venv
./backend/.venv/Scripts/python.exe -m pip install -e './backend[dev]'
if (-not (Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
./backend/.venv/Scripts/python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --no-proxy-headers --no-access-log
```

On this workstation, use `C:/Users/User/.local/bin/python3.12.exe` in place of
`python` if Python is absent from PATH. On POSIX systems use
`backend/.venv/bin/python` for the virtual environment commands.

Run checks from the repository root:

```powershell
./backend/.venv/Scripts/python.exe -m pytest backend/tests -q
```

`backend/.env` is optional and loaded relative to the backend directory regardless
of the current working directory. Process environment variables take precedence.
`ALLOWED_ORIGINS` is a JSON array of explicit HTTP(S) origins without trailing
slashes; it defaults to an empty array. CORS is enabled only for those origins.
The example permits the local Vite origin.

## MongoDB configuration and verification (B02)

Set `MONGODB_URI` only in the ignored `backend/.env` or process environment.
Use the Atlas-provided `mongodb+srv://` URI and URL-encode username/password
characters as required. Keep TLS enabled and leave certificate validation enabled.
Never paste connection strings into logs, chat, command arguments, or source.

Create a dedicated Atlas database user with the `readWrite` role limited to
`climate_hazard_analyzer` (not an Atlas admin/account user). This permits collection
and index creation and the application's reads/upserts. Restrict Atlas network
access to the developer machine's current public IP and, later, the backend's
outbound address. Avoid an unrestricted `0.0.0.0/0` rule. Verify roles/network
access in Atlas; application code cannot prove those administrative restrictions.

Configuration:

| Variable | Default | Meaning |
| --- | --- | --- |
| `MONGODB_URI` | unset | Secret connection string; unset runs foundation-only |
| `MONGODB_DB` | `climate_hazard_analyzer` | Application database |
| `MONGODB_TIMEOUT_MS` | `5000` | Selection, connect, socket, pool wait, and total operation timeout; 100–60000 ms |
| `MONGODB_MAX_POOL_SIZE` | `10` | Reused client pool limit; 1–100 |

When configured, startup creates one client per service process, pings the database,
and creates both unique indexes before the service becomes ready. Connection/index
failure aborts startup with a generic error. The client closes after failed startup
or normal shutdown. Startup/shutdown use a worker thread. Repository methods are
synchronous: use them from synchronous routes or a worker thread, not directly
inside async request handlers. Each database operation has a client-side deadline.
The health response remains service-only and does not expose infrastructure state.
Database failures in request processing use HTTP 503 with code
`database_unavailable`; driver exception text is not returned or logged by this code.
Writes require majority acknowledgement and readback uses the primary, including
when URI query options specify weaker write concern or a secondary read preference.

After configuring Atlas, run explicitly from the repository root:

```powershell
./backend/.venv/Scripts/python.exe -m app.verify_database
```

This pings Atlas, creates/verifies the application indexes, writes tagged UUID
verification records to `weather_years` and `analyses`, checks readback/upserts and
duplicate rejection, and deletes only those exact verification records. It never
drops collections or databases. These fixtures are not weather or climate results.
Exit codes: 0 passed; 1 failed; 2 URI missing. If connectivity is lost during cleanup,
tagged `verification_only: true` records can remain; inspect those before manually
removing them. Do not report Atlas verified until this command actually passes.

Unit tests use `mongomock` and driver mocks; they verify repository behavior and
failure/lifecycle paths but do not establish Atlas connectivity or durability.

## Persistence contracts

`Database.weather` and `Database.analyses` share the same client/database.
`get_database(request)` returns the lifespan-owned database or raises the safe
database-unavailable error. Both repositories expose `get(identity/key)` returning
a document or `None`, and `save(identity/key, payload)` performing an atomic
replacement upsert followed by a database read. Saved responses omit MongoDB `_id`.
Payloads cannot overwrite identity or `_id`. A duplicate-key insertion race retries
once as an update. No unbounded application retry loop is used.

| Collection | Identity / unique index | Payload contract |
| --- | --- | --- |
| `weather_years` | `region_id`, `coordinate_version`, `model`, `year`, `schema_version`; index `weather_identity_unique` | B03 will supply normalized date/temperature arrays, coordinates/timezone/units, quality/coverage, fetched timestamp, and content revision |
| `analyses` | `analysis_key`; index `analysis_key_unique` | B07 will supply request/method/source metadata and calculated response groups |

`WeatherIdentity` validates the immutable key, including strict integer year/schema
version. Boundary weather years may precede 1990. `REGION_COORDINATE_VERSION` is
`"1"`; increment it whenever city coordinates change. Model is part of identity;
B03 will pin real provider requests to ERA5. The eventual deterministic analysis key
must include selection, coordinate/model versions, baseline/method version, and
source revisions. B02 does not generate climate results or implement cache policy.
Payload mappings are a storage boundary, not a claim of provider-data validity;
normalization/quality validation belongs to B03 and result validation to B07.
Existing duplicate data causes unique-index creation to fail; this task does not
automatically delete or merge existing records.

## Contracts

- `GET /api/v1/health`: `{"status":"ok"}`. This reports service availability.
- `GET /api/v1/regions`: `regions` (city `id`, `name`, `latitude`, `longitude`,
  `timezone`), `supported_years` (`min`: 1990, `max`: 2025), and `defaults`
  (`region_id`: delhi, `start_year`: 1990, `end_year`: 2020, `hazard`: heatwave).
- `/docs` and `/openapi.json` describe the implemented routes.

Cities are ordered Delhi, Mumbai, Bengaluru, Chennai, Hyderabad. Fixed WGS84
points represent city centres; they are not city-wide averages. All use the IANA
timezone `Asia/Kolkata`.

`app.schemas.Selection` defines the analysis input. Years must be JSON
integers (strings, floats, booleans, and null are rejected), within 1990–2025,
with start <= end. Only configured city IDs and `heatwave` are accepted; extra
fields are rejected. Omitted fields use the documented defaults. The analysis
endpoint is now implemented by B07; B01's schema/validation checks remain in place.

Errors use `{"error":{"code":"...","message":"...","details":[...]}}`.
Optional validation details contain field paths, validation codes, and safe
messages. Submitted values and exception text are not returned. Error codes are
`invalid_input` (422), `http_error` (framework HTTP errors), and `internal_error`
(500).

## Source control

Root ignore rules exclude `PROBLEM.md`, environment files, private keys, virtual
environments, and Python caches, while allowing `.env.example`. Ignore rules do
not remove already tracked files; review staged paths before committing. Commit
only placeholder configuration. This initial workspace has no Git repository.
