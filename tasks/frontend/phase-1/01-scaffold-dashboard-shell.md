# F01: Frontend scaffold and dashboard shell

Phase: 1

Status: Ready for review — browser verification completed during final integration

## Problem

The workspace has no frontend project, so there is no runnable surface for building the dashboard.

## Proposed solution (no code)

Create the React, TypeScript, and Vite application with the planned dependencies, production build, public API base-URL example, and one dashboard page. Establish the page structure and visual conventions without connecting secrets or inventing climate calculations. Development-only sample data must be visibly identified as mock data.

## Dependencies

Frontend phase plan accepted. Existing scope and design requirements in `FRONTEND_PLAN.md`.

## Deliverables

Runnable frontend scaffold, dashboard shell, package scripts, and safe environment example.

Apply the visual direction in FRONTEND_PLAN.md: light analytical layout, shared
CSS tokens, system typography, tabular metric numerals, consistent spacing and
visible focus. Establish header, filter area, and result-section placeholders
without building later tasks' charts or request lifecycle.

## Completion checks

- [x] Development server starts and production build succeeds.
- [x] No backend credentials or private configuration are present in frontend files.
- [x] Dashboard shell renders at 375 × 812 and 1440 × 900, with no page-wide overflow at 320px width.
- [x] Shared typography, color, spacing, and focus conventions are recorded and applied.
- [x] Any mock-data mode is explicit and cannot be mistaken for live results.

## Implementation evidence

Changed: frontend/package.json and package-lock.json, tsconfig.json, vite.config.ts,
index.html, .env.example, src/main.tsx, src/pages/Dashboard.tsx, src/styles.css,
and README.md; root .gitignore and project/task status documentation.

React/TypeScript/Vite scaffold includes Recharts as the planned dependency for
later charts. The page has a header, disabled selection controls, empty summary
and chart sections, insights/events placeholder, and methodology placeholder.
No API client, request lifecycle, climate calculations, or populated charts were
implemented. No fixture/mock climate values appear. A visible preview notice
explains the disconnected state.

Verification: npm install succeeded (63 packages, zero reported vulnerabilities);
npm run build passed TypeScript and production bundling. Vite development server
started on loopback port 5173; HTTP GET returned 200 with the app entry.
Source/config scan found no database URI, backend secret configuration, private
brief reference, or fetch/client calls. No confidential files were read or copied.

## Review findings and unresolved checks

Removed an unnecessary empty CSS import before build. Reviewed shell scope,
disabled-control semantics, skip link, heading hierarchy, responsive grid rules,
and unavailable-value labels. No runtime charting or API behavior belongs to F01.

Resolved during final verification: installed isolated Chromium through Playwright.
Production-browser checks pass at 375×812, 1440×900, and 320×812 in empty and result
states, with no page overflow. Screenshot and axe checks passed. See
[final verification](../../../frontend/VERIFICATION.md) via the frontend README.
The user authorized completing remaining tasks without individual stop gates.

## Review focus

Check that the scaffold stays within the single-dashboard scope and uses the planned React/TypeScript/Vite/Recharts stack without unnecessary framework additions.

## User review gate

Record implementation evidence and stop for explicit user acceptance before F02.
