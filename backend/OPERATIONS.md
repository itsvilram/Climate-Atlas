# Operational controls (B08)

Run one backend process/instance. In-memory limits, provider budgets, locks, and
coalescing are not shared across workers, restarts, hosts, or other API users.
Scaling requires shared admission/quota coordination. MongoDB unique indexes and
caches do not replace a distributed limiter. No deployment is performed here.

## Settings and admission

| Setting | Default | Purpose |
| --- | --- | --- |
| `RATE_REQUESTS` / `RATE_WINDOW_SECONDS` | 60 / 60 | Per-IP sliding window for `/api/v1/` request starts, including invalid requests |
| `COLD_REQUESTS` / `COLD_WINDOW_SECONDS` | 2 / 600 | Per-IP new calculation or provider fetch/refresh admissions |
| `RATE_MAX_CLIENTS` | 2048 | Tracked identities; idle buckets expire and full capacity fails closed |
| `REQUEST_MAX_CONCURRENT` | 16 | API requests admitted before body reading/thread-pool work; allowed 1–32 |
| `REQUEST_MAX_BODY_BYTES` | 4096 | Actual body-byte cap including unknown/chunked lengths; allowed 256–16384 |
| `TRUSTED_PROXY_NETWORKS` | `[]` | JSON array of explicit trusted direct-peer IPs/CIDRs |
| `PROVIDER_CALLS_PER_MINUTE` / hour / day | 480 / 4500 / 9000 | Process-wide conservative weighted provider budgets |

General limits return common-envelope 429 `rate_limited`; cold admission returns
429 `cold_rate_limited`; a full identity tracker returns 429 `rate_limiter_capacity`.
All include integer `Retry-After` seconds. Cold admission occurs once per leader,
before its first provider attempt or new computation. Warm analysis hits consume
no cold token. Coalesced followers share admitted work but each consumes general
quota. Failed admitted work is not refunded. Preflights consume no API quota.

Concurrency excess returns 503 `request_capacity` with short retry guidance. Keep
the worker-thread capacity above the configured HTTP cap (default 16, below
Starlette's default capacity). B07 also bounds distinct pending analyses, events,
response bytes, and cache entries; weather operations remain serialized.

Oversized bodies return 413 `request_too_large`. Actual lengths are bounded before
JSON parsing; body reads stop after ten seconds or the smaller operation allowance
with 408 `request_timeout`. The original request deadline includes body and queue
time and is not reset at the worker. Synchronous calculations/I/O use cooperative
deadline checks and bounded socket waits, not forced thread cancellation. Allow
an in-flight I/O/serialization margin at hosting.

## CORS and trusted proxies

`ALLOWED_ORIGINS` uses exact HTTP(S) origins without paths, credentials, wildcards,
or trailing slash. Allowed CORS preflights support GET/POST and Content-Type without
cookies. Denied preflights return CORS 400 with no allow-origin header; actual API
requests from denied origins return safe 403 `origin_not_allowed` before work.
Allowed-origin error responses preserve CORS and expose `Retry-After`. Requests
without Origin are permitted for CLI use. CORS is not authentication.

Forwarding headers are ignored unless the direct socket peer is explicitly trusted.
A single <=1024-byte, <=16-hop `X-Forwarded-For` chain is walked right to left,
stripping trusted proxies and stopping at the first untrusted address. Spoofed
prefixes cannot select a different bucket. Malformed/duplicate chains fall back
to the peer. `Forwarded` and `X-Real-IP` are ignored. IPv4-mapped IPv6 normalizes
to IPv4. Invalid peers share one fail-closed bucket. Wildcard/default-route proxy
trust is rejected. Trust only genuine proxies that sanitize/append forwarding data.

Disable Uvicorn's separate proxy parsing and raw access logs:

```powershell
./backend/.venv/Scripts/python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --no-proxy-headers --no-access-log
```

Otherwise the server may rewrite the peer before the app sees it or log raw query
strings. See [Uvicorn settings](https://uvicorn.dev/settings/) and
[Starlette middleware ordering](https://www.starlette.io/middleware/). Production
server/proxy configuration still requires verification before deployment.

## Provider budgets, credentials, and logs

Only the fixed HTTPS archive host and ERA5 model are used. Each yearly HTTP attempt,
including retries, atomically reserves 40 weighted units against minute/hour/day
budgets. This is a conservative single-variable/model/year estimate, not access to
Open-Meteo's authoritative accounting. See [WEATHER.md](WEATHER.md) for official
limits and long-request accounting. Other processes/users can still consume quota.
Quota waits occur only when they fit the remaining operation budget; otherwise
return provider throttling with retry guidance or use adequate validated stale
weather with explicit warnings under the existing policy. Three-second pacing,
finite retries/timeouts, year/output bounds, and cache cleanup remain enforced.

`climate.requests` logs JSON containing only closed route/method labels, status,
duration, and cache outcome. It omits raw paths/queries, IPs, headers/bodies, provider
payloads, exception text/tracebacks, settings, and connection URIs. Unexpected API
exceptions return a safe 500 before raw server traceback logging. Use the documented
`--no-access-log` and do not enable raw HTTP/database debug logging in deployment.
Secret-canary tests cover query, header, body, and exception paths.

TLS validation stays enabled. Credentials remain server-only in ignored environment
configuration. Atlas least-privilege roles and narrow network access are documented
but not administratively audited by these code checks. Secrets/PROBLEM.md do not
belong in source control.

## Execution decision and evidence

Retain the synchronous POST contract for the selected local/single-instance
**240-second** execution budget. B07's real cold Delhi took 90.86 seconds. B08's
real cold Mumbai, with production quota pacing, returned HTTP 200 in **144.61
seconds**, with **33 provider attempts**. The warm repeat took **0.94 seconds**
with zero provider attempts. No job/status API or frontend changes are adopted.

No production host is selected/verified. B09 must choose a host/proxy supporting
this duration plus I/O margin; otherwise adopt a persisted job/status API and
update the frontend contract before deployment/integration. Local timing does not
prove free-tier or public-host compatibility. No deployment/submission occurred.

```powershell
./backend/.venv/Scripts/python.exe -m pytest backend/tests -q
./backend/.venv/Scripts/python.exe -m app.verify_operations
```

The opt-in verifier selects an alternate city missing required context, retains
real weather/results in Atlas, checks the chosen budget, and verifies warm reuse.
It never deletes cache records to fabricate a cold request.
