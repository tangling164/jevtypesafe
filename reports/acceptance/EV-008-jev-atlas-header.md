# EV-008 · Jev Atlas naming, compact hero, and development toolbar

- Executor/date: Codex, 2026-09-23.
- Environment: Windows, Node 24.14.1, Astro 7.3.3, Chromium via Playwright 1.63.0.
- Version: branch `codex/m1-foundation`, HEAD `a8dd5ce` plus uncommitted implementation and pre-existing UI work. No deployment, DNS, or external write.
- Scope: CH-05; technical evidence for AC-01, AC-02, and AC-03. Final aesthetic acceptance remains with the user.

## Delivered

- Renamed the public product to `Jev Atlas` in the central content configuration, header, footer, browser titles, JSON-LD breadcrumbs, About copy, configuration fallback, environment example, README, repository instructions, PRD, and current project ledger.
- Preserved historical evidence that refers to the former name.
- Passed `route.kind === 'home'` to the shared layout and removed only the homepage main container's top padding. Other routes retain their existing page padding.
- Reduced hero top padding to 36px desktop and 28px mobile.
- Removed the hero section's redundant outer reveal translation; its child content retains the existing entrance motion.
- Set `devToolbar.enabled` to `false` in `astro.config.ts`, removing local Settings, Audit, and related framework controls.

## Verification

- TDD red check: focused Playwright test failed against the prior build with `Expected "Jev Atlas", received "Jev / builds"`.
- `npm run build`: passed; validated 10 published projects and 6 categories, built 47 pages.
- Focused Playwright regression after rebuild: passed for `/` and `/zh/`.
- `npm run check`: 0 errors, 0 warnings, 8 existing hints.
- `npm test`: 10 files and 81 tests passed.
- `npx playwright test --grep-invert "capture local acceptance screenshots"`: 38/40 passed in the parallel run. The same no-JavaScript navigation test timed out at 30 seconds on desktop and mobile; the failure was reported during context cleanup, without a failed functional assertion.
- `npx playwright test tests/e2e/directory.spec.ts --grep "without JavaScript" --workers=1`: isolated rerun passed on desktop in 1.5s and mobile in 1.7s (2/2).
- `npx playwright test --grep-invert "capture local acceptance screenshots" --workers=1`: complete serial rerun passed 40/40 in 1.8 minutes, including the same no-JavaScript scenarios in 1.6s desktop and 1.5s mobile.
- `node reports/jev-atlas-header-check.mjs`: passed English/Chinese at 375px/1440px. In all four scenarios, brand and title used Jev Atlas, header-to-hero distance was 0px, no horizontal overflow occurred, language switching passed, and `astro-dev-toolbar` count was 0. First hero copy started 28px below the header on mobile and 36px below it on desktop.
- Current-copy scan outside historical specs/plans/reports found no remaining `Jev Builds Directory`, `Jev / builds`, `Jev Builds`, or `builds directory` strings.

## Evidence

- Numeric results: `reports/jev-atlas-header/results.json`.
- Screenshots: `reports/jev-atlas-header/en-375.png`, `en-1440.png`, `zh-375.png`, `zh-1440.png`.
- Repeatable browser script: `reports/jev-atlas-header-check.mjs`.
- Design and implementation plan: `docs/superpowers/specs/2026-09-23-jev-atlas-header-design.md`, `docs/superpowers/plans/2026-09-23-jev-atlas-header.md`.

The local implementation is technically verified. On 2026-09-23, after reviewing the completed UI, the user explicitly stated that the UI adjustment was complete. This closes the user-judgment portion of AC-01. Production deployment was not performed in this change.
