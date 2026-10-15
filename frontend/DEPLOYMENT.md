# Deployment preparation (not deployed)

The frontend produces static files. Configure a public HTTPS backend URL at build
time; VITE_ variables are visible in browser bundles and must never contain secrets.

```powershell
npm ci
$env:VITE_API_BASE_URL='https://your-authorized-backend.example'
npm run build
```

Build directory: `frontend/dist` (or `dist` when the host root is `frontend/`).
Node >=22.18 is required; Node 24 was verified. This app has a single page and
anchor navigation, so no client router rewrite is needed. Serve index.html with
revalidation and content-hashed assets with long immutable caching. Do not publish
source environments, backend files, fixtures, node_modules, tests, or reports.

Before an authorized deployment:

- Choose/verify the backend host and proxy support the 240-second operation budget
  with margin. Browser analysis timeout is 270 seconds. If reliable cold requests
  cannot fit, revise to persisted jobs before production integration.
- Build and verify the backend container; the local Docker daemon was unavailable.
- Set exact backend ALLOWED_ORIGINS to the frontend HTTPS origin. Configure trusted
  proxies explicitly, and keep one process/instance for current in-memory quotas.
- Provide Atlas credentials as backend host secrets only; verify restricted DB
  roles and network rules and outbound Open-Meteo access. Never disable TLS checks.
- Verify public HTTPS, health/regions, allowed and denied CORS, safe errors, a real
  default and alternate analysis, persistence/cache reuse, and real cold latency.
- Recheck mobile/keyboard behavior on the deployed origin and record the URL and
  actual response only after deployment is performed.

No host account, paid resource, public endpoint, deployment, or submission has been
created. These are explicit external prerequisites, not verified delivery claims.
