# Climate Hazard Trend Analyzer

Backend implementation through B09 is accepted. The [frontend dashboard](frontend/README.md)
and local integration are implemented and verified, with remaining task files Ready
for review. Deployment remains pending. Start with [backend setup](backend/README.md),
[API contract](backend/API.md), and [handoff evidence](backend/HANDOFF.md).

The dashboard provides curated city/year filters, explicit loading/retry states,
summary metrics, annual charts and table, backend-derived trends/insights, paginated
events, and methodology/source-quality evidence. Previous successful results remain
labeled while a new selection is loading or fails. Null, zero, partial, and uncertain
values have distinct presentation.

## Run locally

Complete the backend's Python/Atlas setup and frontend's `npm ci` setup first. Keep
the real MONGODB_URI only in the ignored backend/.env. In one PowerShell terminal
from the repository root:

```powershell
$env:ALLOWED_ORIGINS='["http://127.0.0.1:5173"]'
./backend/.venv/Scripts/python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --no-proxy-headers --no-access-log
```

In another terminal, run `npm run dev` from frontend/. Its ignored .env should set
only `VITE_API_BASE_URL=http://127.0.0.1:8000`; .env.example provides that public
setting. Open http://127.0.0.1:5173/ and select Analyze. Initial uncached requests
can take several minutes; existing default data is warm.

## Verification and deployment status

240 backend tests, 21 frontend tests, and 8 production Chromium tests passed.
TypeScript/build, schema drift, browser-client bundle, dependency compatibility,
and production dependency audit checks passed. Real local requests verify Delhi,
cache reuse, Mumbai single-year results, and allowed/denied CORS. Mobile/desktop,
keyboard, axe, chart tooltips, and zoom-equivalent reflow checks pass.

See [verification evidence](frontend/VERIFICATION.md) and
[deployment prerequisites](frontend/DEPLOYMENT.md). Browser tests use controlled
edge cases separately from real data. Manual screen-reader speech, other browser
engines, chosen-host limits/public integration, and Docker image runtime are not
claimed; the Docker Desktop daemon is unavailable. No deployment is authorized.

The next-stage [GitHub and Vercel plan](GITHUB_VERCEL_PLAN.md) defines six phase
commits, publication checks, backend hosting compatibility, and deployment steps.
No GitHub publication or Vercel deployment has been performed.

FastAPI validates curated city/year selections, reads normalized Open-Meteo ERA5
year blocks from Atlas, computes heatwave statistics, persists the analysis, and
returns the stored result. Fresh weather is reused for 30 days; source revisions
and method versions invalidate dependent analyses.

The fixed 1990–2020 annual 95th percentile defines hot days; three consecutive
days strictly above it form an event. This is a simplified research definition,
not an official warning. ERA5 represents a grid point near each city, not a city
average or station observation. See [methodology](backend/CLIMATE.md),
[weather quality](backend/WEATHER.md), and [operational limits](backend/OPERATIONS.md).

AI assistance generated implementation, tests, and documentation and helped run
verification. Automated and live checks are recorded in task files; they do not
replace the user's pending code review or independent scientific validation.
Credentials and the confidential assignment material remain local and excluded
from source control. Nothing has been deployed or submitted.
