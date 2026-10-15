# Frontend Tasks: Three Phases

Status: local implementation and automated review complete. F02/F03/F05 Accepted; F01/F04/F06/F07/F08/F09 Ready for review. 21 frontend tests, 8 production Chromium tests, and 240 backend tests pass. Deployment remains pending.

## Working agreement

1. Read one task's problem and proposed solution.
2. Implement only that task once frontend phase planning is accepted.
3. Run its completion checks and record evidence in its file.
4. Review the task for missing requirements, correctness, and integration impact.
5. Fix findings and repeat affected checks.
6. Original per-task stop gates were superseded by the user's explicit instruction to finish all remaining tasks and review them without asking. Final user acceptance remains distinct from agent verification.

Statuses: Not started -> In progress -> Ready for review -> Changes requested (if needed) -> Accepted. Record unresolved issues rather than implying completion.

## Phase 1: Foundation and request flow

- [F01: Frontend scaffold and dashboard shell](phase-1/01-scaffold-dashboard-shell.md) — Ready for review
- [F02: API contract and client](phase-1/02-api-contract-client.md) — Accepted
- [F03: Filters and request states](phase-1/03-filters-request-states.md) — Accepted

Phase gate: production frontend scaffold, typed API boundary, and filter/request lifecycle pass focused checks. Mock data is development-only.

## Phase 2: Analysis presentation

- [F04: Summary metrics and charts](phase-2/04-summary-metrics-charts.md) — Ready for review
- [F05: Insights and events](phase-2/05-insights-events.md) — Accepted
- [F06: Methodology and data quality](phase-2/06-methodology-data-quality.md) — Ready for review

Phase gate: every displayed value is sourced from the backend response and partial, missing, and uncertain data are represented honestly.

## Phase 3: Usability and integration

- [F07: Responsive and accessible experience](phase-3/07-responsive-accessibility.md) — Ready for review
- [F08: Backend integration and resilience](phase-3/08-backend-integration-resilience.md) — Ready for review
- [F09: Verification and delivery](phase-3/09-verification-delivery.md) — Ready for review

Phase gate: accepted B08/B09 handoff, successful real API integration, responsive/accessibility checks, production build, and documented deployment status. Deployment itself requires authorization.

## Backend dependencies

- B01–B09 are Accepted; the user authorized frontend implementation after the handoff review.
- B08 retained synchronous POST analysis with a default 240-second operation budget. Plan 270 seconds for browser analysis requests and 15 seconds for regions, revisiting these if backend settings change. Do not automatically retry analyses.
- B09 provides [handoff documentation](../../backend/HANDOFF.md), a real response fixture, and generated OpenAPI in `backend/fixtures/`. Use these with runtime schemas; fixtures never substitute for live production results.
- F08 verifies real local HTTP integration. Host compatibility, public HTTPS/CORS, and deployed requests remain separate pending checks requiring deployment authorization. Cold Mumbai took 144.61 seconds locally; this does not establish host compatibility.

## Planning review

Review corrections are incorporated: F01 visual conventions, explicit request
budgets, current backend dependencies, local versus deployed verification, and
representative viewport/failure/race checks. Earlier browser gaps are now resolved
using standalone Playwright Chromium against the production build. See
[verification results](../../frontend/VERIFICATION.md) for exact evidence and
[deployment prerequisites](../../frontend/DEPLOYMENT.md) for remaining external checks.

## Scope source

See [FRONTEND_PLAN.md](../../FRONTEND_PLAN.md), [APP_PLAN.md](../../APP_PLAN.md), and [backend/API.md](../../backend/API.md). The app remains a single heatwave dashboard for the curated city regions. Maps, custom regions, other hazards, PDF export, and authentication are deferred.
