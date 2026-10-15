# F09: Verification and delivery

Phase: 3

Status: Ready for review — local implementation and automated verification complete

## Problem

The dashboard is not ready to hand off until its key states, production build, and deployment configuration are checked against real backend behavior.

## Proposed solution (no code)

Run the defined frontend build and focused behavior checks, exercise the default and alternate selections plus partial/no-data/failure states, and verify desktop/mobile/keyboard use. Document setup, API configuration, data/methodology limitations, and AI use. Verify deployment only when deployment is authorized and an actual deployed request can be made.

## Dependencies

F08 accepted; backend handoff accepted. Deployment requires explicit authorization.

## Deliverables

Verification evidence, frontend README/setup notes, and deployment status with outstanding checks.

## Completion checks

- [x] TypeScript checks and production build pass.
- [x] Default and alternate city/range requests display matching backend values.
- [x] Short range, zero events, partial data, uncertain boundaries, errors, retry, and rapid request changes behave correctly.
- [x] Keyboard and mobile checks pass in Chromium.
- [x] Browser evidence covers 375 × 812, 1440 × 900, 320px width, 200%-equivalent reflow and text resize; controlled fixtures cover malformed responses, Retry-After, and request races without being presented as live data.
- [x] README documents configuration, source/methodology limits, and AI use.
- [x] Deployment is described as verified only after an actual deployed request; otherwise pending checks are explicit.
- [x] Chosen-host timeout compatibility, public HTTPS/CORS, and deployed analysis/cache repeat remain explicitly pending authorization.

## Implementation evidence and review

User authorized finishing all remaining tasks and their reviews without stopping
at each gate. Earlier browser gaps in F01/F04/F06/F07 are now resolved through
standalone Playwright Chromium, independently of unavailable connected browsers.

Changed: Playwright configuration/browser tests, dependency lock/scripts, ignore rules,
frontend/VERIFICATION.md, DEPLOYMENT.md, README/setup/status documents, and task files.
Browser suite serves a real production build and a separate Atlas-backed backend;
controlled routes exist only in test code. Reports/traces/screenshots are written
under the OS temporary directory to avoid OneDrive locks.

Evidence: 240 backend tests, 21 frontend Node/SSR tests, TypeScript/production build,
OpenAPI drift/client bundle checks, and dependency checks pass. Chromium verifies
desktop/mobile/320px, keyboard/focus/disclosures/pagination, chart tooltips, axe,
200%-equivalent reflow/text resize, controlled failure states, and live default/
repeat/Mumbai single-year requests. See frontend/VERIFICATION.md for precise scope,
timings, artifact locations, and the final browser report.

Review fixed test fixture CORS exposure, brittle label lookup, and OneDrive trace
locking. Existing earlier reviews fixed actual contrast, focus, narrow CSS cascade,
generated-validator ESM, lazy chart loading, and shared Vite cache problems.
No optional feature displaced core requirements. No credentials or confidential
brief were copied or read; source-control ignore rules remain in place.

Remaining external checks: Docker Desktop daemon is unavailable, so image build/
runtime remains unverified. No host selected; request/proxy limits, public HTTPS,
Atlas host network/role restrictions, and deployed integration require authorization.
Manual screen-reader speech, other browser engines, and scientific validation are
not claimed by automated accessibility/real-data checks. Nothing deployed/submitted.

## Review focus

Ensure no fixture is presented as production data, no optional feature displaced core requirements, and no deployment claim exceeds available evidence.

## User review gate

Record final evidence and stop for explicit user acceptance. Do not deploy without authorization.
