# F07: Responsive and accessible experience

Phase: 3

Status: Ready for review — Chromium keyboard, viewport, reflow, and axe checks pass

## Problem

The complete dashboard must remain readable and operable across viewport sizes, input methods, and assistive technologies.

## Proposed solution (no code)

Review and refine the dashboard's responsive layout, semantic structure, keyboard focus, contrast, status announcements, chart alternatives, and touch targets. Keep explanatory text close to the metric or visualization it qualifies.

## Dependencies

User authorized F07 while F01/F04/F06 browser verification remains pending.
Those checks are not marked passed or accepted by this authorization.

## Deliverables

Responsive and accessible dashboard with chart data available in table/text form.

## Completion checks

- [x] Keyboard users can operate filters and actions with visible focus.
- [x] Loading and error changes are announced without disruptive focus movement (markup/state review; screen-reader behavior unverified).
- [x] Narrow and desktop layouts have no incoherent overlap or page-wide overflow.
- [x] Charts have readable text/table equivalents and color is not the only completeness cue (SSR checks and code review).
- [x] Contrast and touch-target styles are checked at 375 × 812 and 1440 × 900; 320px width, 200%-equivalent reflow, and 200% text resize pass.

## Review focus

Check empty/loading/error states and long labels as well as the successful dashboard.

## Implementation evidence

Changed: frontend/src/styles.css; pages/Dashboard.tsx; tests/contrast.test.ts;
frontend README and task/index documentation. Review covers labels, native controls,
skip link, focus styles, status live region, inline validation alerts, chart table
alternatives, disclosures, pagination, and focusable table-scroll regions.

Control borders now use a higher-contrast token. Buttons and disclosures have
minimum 44px height, header method link has a 44px target, long text wraps, narrow
headers wrap, and filters stack in one column below 380px. Skip-link destination
is programmatically focusable. Reduced-motion rules prevent CSS animation and
smooth scrolling; chart animation was already disabled. No automatic focus moves
were introduced for request status changes.

15 October 2026: all 21 tests pass, including actual CSS-palette contrast checks
(tested normal text >=4.5:1; tested focus/control boundaries >=3:1). Existing SSR
tests verify labels, invalid-field descriptions, live status, native controls,
table alternatives, and text completeness cues. TypeScript/production build pass.

## Findings and fixes

Found low-contrast control borders, small disclosure/header link targets, and a
skip-link target without explicit programmatic focus support; corrected above.
Review caught the later 900px breakpoint overriding the new <=380px filter rule;
used a more specific narrow rule and rebuilt successfully.

Resolved: standalone Playwright Chromium bypasses the need for a connected browser.
Production-build keyboard tests activate skip link/focus, validate/submit filters,
paginate events, and open disclosures. No-overflow checks and axe pass at 1440×900,
375×812, and 320×812. A 720px layout viewport plus 200% root font size verifies
zoom-equivalent reflow/text resize; native browser zoom UI was not operated.
Screen-reader speech and other browser engines remain additional manual coverage,
not completion claims. See frontend/VERIFICATION.md for exact limits.

## User review gate

Record viewport/accessibility evidence and stop for explicit user acceptance before F08.
