# B09 frontend handoff

## Contract and captured evidence

[API.md](API.md) describes request fields, errors, nullable metrics, quality flags,
and counting conventions. [fixtures/openapi.json](fixtures/openapi.json) is the
generated machine-readable contract. Runtime Pydantic schemas remain authoritative.

[Delhi response](fixtures/delhi-1990-2020.json) is a real successful local ASGI API
response backed by Atlas and Open-Meteo ERA5, captured on 15 October 2026. It is a
development snapshot, never a production fallback. It contains 31 annual rows and
71 event starts. Its source timestamps/revisions describe the capture, not current
freshness. Attribution: [Open-Meteo](https://open-meteo.com/), ERA5 reanalysis,
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

[Event audit](fixtures/event-audit.json) records actual stored daily maxima for
three events, including their preceding/following days. A separate sorted linear
interpolation over 11,323 baseline observations reproduced the 41.5 °C threshold;
direct calendar checks reproduced duration, strict exceedance, peak, and mean
exceedance for 1990-05-24, 2005-05-19, and 2020-05-22 event starts. This samples
real events; synthetic tests separately cover leap days and cross-year boundaries.

Reproduce from the repository root after local setup:

```powershell
./backend/.venv/Scripts/python.exe -m pytest backend/tests -q
./backend/.venv/Scripts/python.exe -m pip check
./backend/.venv/Scripts/python.exe -m app.verify_analysis
./backend/.venv/Scripts/python.exe -m app.verify_handoff
```

The last command writes the three public artifacts only after a real repeat cache
hit and independent audit succeed. It reads local credentials without exporting
them. Default Delhi is warm; repeat requests made zero extra provider calls.

## Frontend integration decisions

Use the synchronous POST API, explicit units and nulls, and backend-derived metrics.
Show stale/partial/truncated warnings, source attribution, and annual-threshold
limitations. Handle documented 422/429/502/503/504 errors and Retry-After. Preserve
last successful selection while loading; prevent late responses replacing newer
requests. Fetch live data in production; fixtures are for development checks.

The local operation budget is 240 seconds. Prior genuine cold Mumbai took 144.61
seconds; warm calls took about one second. A hosting request/proxy timeout has not
been selected or verified. Before production integration, verify the chosen host
supports the budget with margin; otherwise adopt a persisted job/status API and
revise the frontend contract. Local timings do not prove host compatibility.

## Deployment preparation and outstanding checks

No deployment is authorized or performed. `Dockerfile` uses a non-root single
process; its allowlist build context excludes credentials, fixtures, and private
material. Build from `backend/`. Container build/runtime verification is pending.
`python -m app.run` reads PORT (default 8000), disables Uvicorn proxy rewriting and
access logs, and binds to all interfaces. Existing environment settings apply.
Dependencies use bounded ranges; resolve/pin a tested image before deployment.

- Select a host and verify cold-start/request limits and outbound Atlas/provider access.
- Build/run the container and repeat health, regions, and analysis checks in it.
- Supply MONGODB_URI as a host secret; verify restricted database role and Atlas network access.
- Set exact ALLOWED_ORIGINS and trusted proxy CIDRs; retain one process/instance
  while quotas and coalescing are in memory. Verify actual proxy/client-IP behavior.
- Configure HTTPS, health probes, safe logs, and host/proxy timeouts above the operation budget.
- Warm default Delhi, measure a truly cold alternate query on the chosen host,
  verify public persistence/cache reuse, and exercise allowed/denied CORS origins.
- Record the public URL and actual deployed response only after explicit authorization.

Backend criteria are covered by climate edge-case tests, API/error/limit tests,
cache/revision/stale/overlap tests, and opt-in Atlas checks. Administrative role
restrictions, host behavior, public CORS, and public deployment remain external
checks. The user accepted B09 by authorizing frontend implementation after review.
