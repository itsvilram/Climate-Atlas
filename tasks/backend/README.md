# Backend Tasks: Three Phases

Status: B01-B09 are Accepted (240 tests, real Atlas repeat/cache checks and independent event audit pass). Deployment remains pending.

## Working agreement

1. Read one task's problem and proposed solution.
2. Implement only that task once we start coding.
3. Run its completion checks and record evidence in its file.
4. Review the task for missing requirements, correctness, and integration impact.
5. Fix findings and repeat affected checks.
6. Stop for the user's review before moving to the next task. Acceptance must be explicit; do not infer it from silence.

Statuses: Not started -> In progress -> Ready for review -> Changes requested (if needed) -> Accepted. A task is complete only after checks pass and the user accepts its review. Keep unresolved issues visible. Tests and safe configuration belong to each task; the final phase consolidates them.

## Phase 1: Foundation and real data

- [B01: Service foundation](phase-1/01-service-foundation.md) — Accepted
- [B02: MongoDB persistence](phase-1/02-mongodb-persistence.md) — Accepted
- [B03: Weather ingestion and cache](phase-1/03-weather-ingestion-cache.md) — Accepted

Phase gate: service, database access, and real weather cache have evidence and accepted task reviews.

## Phase 2: Climate calculations

- [B04: Baseline and threshold](phase-2/04-baseline-threshold.md) — Accepted
- [B05: Heatwave event detection](phase-2/05-heatwave-events.md) — Accepted
- [B06: Metrics, trends, and insights](phase-2/06-metrics-trends-insights.md) — Accepted

Phase gate: threshold, events, metrics, and trend conventions are tested and accepted.

## Phase 3: Integration and frontend readiness

- [B07: Analysis API integration](phase-3/07-analysis-api-integration.md) — Accepted
- [B08: Security and operational limits](phase-3/08-security-operational-limits.md) — Accepted
- [B09: Verification and frontend handoff](phase-3/09-verification-handoff.md) — Accepted

Phase gate: integrated API and operational checks pass; real-data contract is ready for frontend. Deployment verification remains pending until performed.

## Source of scope

See [BACKEND_PLAN.md](../../BACKEND_PLAN.md) and [APP_PLAN.md](../../APP_PLAN.md). These task files reorganize the existing scope; changes discovered during review must be reflected in those plans and dependent tasks.

B09 starts only after B08 is explicitly accepted. Frontend work starts after the backend handoff is accepted.
