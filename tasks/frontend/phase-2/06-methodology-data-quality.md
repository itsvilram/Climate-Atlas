# F06: Methodology and data quality

Phase: 2

Status: Ready for review — mobile and automated accessibility checks pass

## Problem

Climate results can be misleading without nearby explanation of the threshold, source, coverage, and spatial limitations.

## Proposed solution (no code)

Present backend methodology and data-quality/source metadata in concise, accessible sections. Explain the fixed baseline, annual 95th percentile, strict threshold comparison, three-day event rule, missing-day handling, event/day counting conventions, incomplete years, reanalysis model, and representative city grid point. Link Open-Meteo attribution.

## Dependencies

F02 and F04; final metadata contract from B09.

## Deliverables

Methodology, data-quality, and source attribution panels.

## Completion checks

- [x] Threshold and event definition match response metadata.
- [x] Coverage, stale-data warnings, incomplete years, and boundary exclusions are visible.
- [x] Provider, model, units, retrieval/cache metadata, and attribution link are available.
- [x] City coordinates are described as representative grid-point results, not city-wide averages.
- [x] Mobile rendering, native disclosure keyboard use, accessible structure, and axe checks pass; manual screen-reader speech is not claimed.

## Implementation evidence

Changed: frontend/src/components/MethodologyPanel.tsx, DataQualityPanel.tsx;
pages/Dashboard.tsx; styles.css; tests/methodology-ui.test.mjs; task/index and
frontend README. F05 accepted by the user's authorization to continue. Prior
F01/F04 browser checks remain pending; no completion evidence is invented.

Panels use displayed-response metadata for threshold, reference period, percentile,
comparison, minimum run, coverage requirement, limitations, and counting rules.
They explain missing days, lack of seasonal adjustment, reanalysis, representative
versus returned grid coordinates, incomplete-year exclusions, and unknown boundary
handling. Baseline annual coverage and source-year retrieval/cache/grid/revision
records are accessible through native details/summary and scrollable tables.
Generation and retrieval timestamps are distinct. Weather attribution and licence
links use fixed official HTTP(S) URLs, not arbitrary response URLs.

15 October 2026: 20 tests pass; TypeScript/production build and contract drift check
pass. New SSR check validates real threshold/run/baseline metadata, generation and
retrieval timestamps, revisions, grid-point limitation, attribution URLs, native
disclosures, and controlled stale/incomplete/excluded-boundary states. Error-like
warning text is escaped by React. No fixtures are imported by the production UI.

## Review findings and fixes

Reviewed explanations against backend/CLIMATE.md, WEATHER.md, and the response.
Generation time is not labeled as weather retrieval time; no-warning state explicitly
retains limitations. Source-year stale fallback remains labeled even in cache hits.
Boundary count uses excluded records metadata rather than summary event starts.
No station-observation, city-average, significance, or causal attribution claims.

Resolved during final verification: Chromium screenshots/overflow checks and axe
pass at 1440×900, 375×812, and 320×812, including opened source/baseline disclosures.
Keyboard tests exercise native disclosure semantics. Automated accessibility does
not establish manual speech behavior or full compliance. No deployment/submission.

## Review focus

Check statements against `backend/CLIMATE.md`, `backend/WEATHER.md`, and the actual response; avoid implying station observations or causal climate attribution.

## User review gate

Record implementation evidence and stop for explicit user acceptance before Phase 3.
