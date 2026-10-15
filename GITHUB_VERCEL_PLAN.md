# GitHub history and Vercel deployment plan

Status: local repository initialized and six reconstructed phase commits prepared; GitHub push remains pending. User reports existing FastAPI and React Vercel apps; their configuration was not changed or independently verified during commit preparation.
Date: 15 October 2026.

## Goal and order

Publish the project to GitHub with **one commit for each existing implementation
phase: three backend commits and three frontend commits, six total**. Push that
reviewed history first, then connect GitHub to Vercel and verify the deployment.
Do not create a single commit containing the whole application. Do not backdate
commits or imply that the reconstructed phase history existed during development.

The workspace was not a Git repository when this plan was prepared. The application already exists as
a final working tree, so phase commits must be composed deliberately, including
earlier versions of shared files where needed. Simply staging folders will not
produce meaningful, buildable phases.

## 1. Prepare a clean repository

- Preserve the working project and ignored local configuration. Prefer preparing
  the publishable checkout outside OneDrive to avoid sync locks, without deleting
  or moving the current project. Verify the intended destination before copying.
- Initialize the repository on `main`; use the user's configured Git identity.
  Do not invent an author name/email.
- Create a reviewed manifest of publishable files. Keep real environment files,
  confidential `PROBLEM.md`, keys, virtual environments, node_modules, build/cache
  output, browser reports/traces/screenshots, and local service state excluded.
  Only placeholder `.env.example` files belong in history.
- Review application/planning documentation for confidential assignment excerpts;
  redact private brief-specific information if present. Do not publish PROBLEM.md
  or reveal credentials while auditing.
- Review `.gitignore`; explicitly exclude `.vercel/` local project-link metadata
  before linking Vercel. Keep lockfiles, source, tests, sanitized real-data fixture,
  public OpenAPI contract, and accurate setup/AI-use documentation.

## 2. Compose six phase commits

| Order | Phase / tasks | Commit message | Contents and checks |
| --- | --- | --- | --- |
| 1 | Backend phase 1: B01–B03 | `feat(backend): establish API, MongoDB persistence and weather cache` | Root ignore/plans (including this plan), phase-appropriate docs, Python package/config, regions, foundation routes, repositories, provider normalization/cache, relevant tests and task evidence. Foundation/persistence/weather checks pass. |
| 2 | Backend phase 2: B04–B06 | `feat(backend): calculate heatwaves, metrics and trends` | Pure climate modules, boundary-context coordination, threshold/events/metrics/trend tests, climate documentation and phase evidence. Climate edge cases pass. |
| 3 | Backend phase 3: B07–B09 | `feat(backend): integrate analysis API and operational safeguards` | Integrated analysis API, public schemas, cache/versioning, operational controls, verification CLIs, sanitized handoff fixtures, deployment preparation and required backend hosting adaptation. Full backend tests and real verification pass. |
| 4 | Frontend phase 1: F01–F03 | `feat(frontend): scaffold dashboard and analysis request flow` | React/TypeScript/Vite shell, lockfile/scripts, generated contract/validators, client, filters, request store/status, related tests and phase evidence. Build/client/state checks pass. |
| 5 | Frontend phase 2: F04–F06 | `feat(frontend): present metrics, events and methodology` | Summary cards, charts, annual/event tables, insights, methodology/source-quality panels and focused tests/docs. Real-value/null/partial/boundary presentation checks pass. |
| 6 | Frontend phase 3: F07–F09 | `feat(frontend): verify accessibility and deployment readiness` | Responsive/accessibility refinements, Playwright/axe integration, final test configuration, verification/deployment docs, final README/statuses, and reviewed frontend Vercel configuration. Full local and production-browser checks pass. |

Shared files such as Dashboard.tsx, main.py, package files, CSS, README, and task
indexes need phase-appropriate snapshots. Stage those snapshots in the clean
checkout; keep the original final working tree intact. Update dependency manifests
and lockfiles together. Commit tests with the phase they verify. Reserve final
integration/browser-only checks for phase 3 so earlier phases do not reference
files introduced later. Every final intended source file must appear by commit 6.

For each commit: inspect staged file list/diff, run applicable checks, verify ignored
files are not tracked, then commit. Before push, check out/test each phase snapshot
where applicable, verify `git log --reverse --oneline` shows the six intended commits,
and compare the final tree against the reviewed publishable manifest. Do not use
force-push or rewrite unrelated remote history.

## 3. Resolve backend hosting before freezing phase-3 configuration

The frontend can use Vercel's Vite hosting. A working dashboard also needs a public
backend; localhost URLs cannot be used by the deployed browser.

Vercel supports FastAPI, but our backend currently assumes a single persistent
process for rate limits, provider pacing, and request coalescing. Function scaling
does not preserve that global coordination. Function lifetime/startup/shutdown,
MongoClient reuse, trusted client IPs, Atlas outbound access, package size, response
limits, and time budgets must be verified before claiming backend compatibility.
See [Vercel FastAPI](https://vercel.com/docs/frameworks/backend/fastapi) and
[function limits](https://vercel.com/docs/functions/limitations).

Evaluate these deployment arrangements and record the selected one:

1. **Vercel frontend + a backend host with a verified single-instance model.**
   Keep the current synchronous contract if cold latency/network limits fit.
2. **Frontend and backend on Vercel as separate projects from this repository.**
   Adapt shared quotas/coalescing to distributed storage or another verified
   platform-wide control, validate Python entrypoint/lifecycle, and retest.
   Do not silently weaken the B08 safeguards to make deployment start.

Verify the actual account/plan's current duration limits and costs before choosing.
The application budget is 240 seconds, browser timeout 270 seconds, and prior true
cold Mumbai took 144.61 seconds. A warm cache alone does not prove cold reliability.
If the hosting budget cannot reliably accommodate cold requests, introduce a
persisted job/status workflow and update the frontend contract before deployment.
Record required adaptations in backend phase 3 rather than hiding them as config.
Do not provision paid resources without an explicit budget.

## 4. Push to GitHub

- Establish the intended GitHub owner, repository name, and visibility from the
  user's account/context before creating or connecting a remote. Never guess a
  destination. An empty remote avoids an unrelated initial README commit.
- Before first push, audit the **entire six-commit history**, not just the final
  working tree, for secrets/private material and accidentally tracked artifacts.
- Push the six local phase commits to `main`. Verify the remote commit order and
  final files. Record the repository URL in delivery docs after it actually exists.
- Do not submit the assignment or send a repository link to others automatically.

## 5. Configure Vercel from the GitHub repository

For the frontend project:

| Setting | Planned value |
| --- | --- |
| Root directory | `frontend` |
| Framework | Vite |
| Install | `npm ci` |
| Build | `npm run build` |
| Output | `dist` |
| Node | Verified Node 24, subject to current Vercel availability |
| Public build variable | `VITE_API_BASE_URL=https://<verified-backend-host>` |

See [Vercel Vite documentation](https://vercel.com/docs/frameworks/frontend/vite).
Keep MONGODB_URI and backend configuration only in the backend host's secret
environment. Configure exact frontend origins in ALLOWED_ORIGINS. Preview URLs
need an explicit supported policy; do not broadly allow every vercel.app origin.
Inspect deployment protection before calling a preview/public demo reachable.

Prepare/test configuration before committing it into the corresponding phase.
After GitHub is ready, import the repository into Vercel, deploy the backend using
the verified arrangement, configure the frontend HTTPS API URL, and deploy the
frontend. These steps are planned, not already performed. Git-connected production
deployments must use the reviewed branch/commit. Additional changes discovered
after publication require honest follow-up commits; never conceal fixes or
force-rewrite public history merely to keep a cosmetic commit count.

## 6. Verify the actual deployed application

- Public HTTPS health/regions, supported cities/defaults, and allowed/denied CORS.
- Real Delhi/default, repeat cache hit, alternate city/single-year results, and a
  genuine cold request within the chosen host's limits. Preserve existing caches.
- Database persistence/readback, source attribution, stale/partial/boundary states,
  safe errors, Retry-After, proxy identity, and coordinated operational limits.
- Production frontend/API URLs, chart/table values, mobile/keyboard/accessibility,
  request races, and recovery from failures. Use controlled tests for rare states;
  do not turn fixtures into a deployed fallback.
- Record GitHub URL, frontend/backend URLs, deployed commit SHA, exact checks,
  measured timings, limitations, and rollback target only after observing them.

Current local evidence: 240 backend tests, 21 frontend tests, and 8 production
Chromium tests pass. Docker Desktop daemon is unavailable; container checks remain
pending if the chosen backend deployment uses the Dockerfile. No deployed outcome
can be inferred from those local checks.

## Completion checklist

- [ ] Publishable manifest and complete-history private-data audit pass.
- [x] Six coherent local phase commits exist and applicable snapshot checks pass.
- [ ] Reviewed history is pushed to the intended GitHub repository.
- [ ] Backend hosting compatibility and any required adaptations are verified.
- [ ] Vercel project uses the intended repository, branch, root, and public API URL.
- [ ] Real deployed checks pass and actual URLs/commit/evidence are documented.

Local commit preparation is complete. Phase snapshots were checked without changing application working files. GitHub remote/push and verification of the user-reported Vercel apps remain separate next steps.

## Local phase snapshot verification

The history is reconstructed from the existing completed application, using the configured Git author and current timestamps. Backend phase snapshots passed 92, 186, and 240 tests. Frontend phase snapshots passed 16, 20, and 21 Node/SSR tests respectively, plus their TypeScript/build, OpenAPI drift, and client-bundle checks. Earlier snapshots were validated in isolated temporary checkouts; the final application working files were preserved. The previously completed eight-browser-test evidence applies to the unchanged final application. Only local commits were created; no GitHub push or Vercel change was performed.
