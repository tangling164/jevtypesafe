# EV-007 · Header and generated icons

- Executor/date: Codex, 2026-09-23; Windows, Node 24.14.1, Chromium, local static preview.
- Version: `codex/m1-foundation`, HEAD `95c6b1c` plus existing uncommitted UI work and this change. No deployment.
- Scope: CH-04; AC-01 visual review, AC-02 responsive/accessibility, AC-03 navigation.

## Delivered

Category summary now shares the 44px vertically centered navigation geometry, with no arrow. Language switch uses a generated 28px image in a 44px keyboard-accessible link, with destination label/title and existing route/query preservation. Removed the top utility bar. Site logo, 32/192px favicons and 180px touch icon use the generated site mark. Mobile navigation no longer clips the category dropdown through overflow scrolling.

Generation: built-in image_gen; tool does not expose a selectable/verifiable backend model. Exact prompts, original assets and output paths: `reports/brand-assets/prompts.md`. Sharp only resizes assets for delivery.

## Verification

- `npm run build`: passed; validated 10 projects/6 categories, built 47 pages.
- `npm run check`: passed, 0 errors / 0 warnings / 8 existing hints.
- `npm run test:e2e`: 39 passed, 1 timed out (mobile no-JavaScript case, 30s; context cleanup error reported). No test or application workaround applied.
- `npx playwright test tests/e2e/directory.spec.ts --project=mobile --grep 'without JavaScript'`: isolated rerun passed in 2.2s. Initial timeout not reproduced; underlying environmental cause unconfirmed.
- `node reports/header-review.mjs`: passed 4 scenarios (en/zh × 375/1440). Initial attempt preceded preview readiness and returned connection refused; rerun after server readiness passed. All navigation centers identical (91px mobile, 36px desktop), no overflow/utility bar/arrow, both images decoded, keyboard opens dropdown, last category is clickable, language switch preserves category, PNG icon endpoints return 200.
- Screenshots visually inspected: `reports/header-review/zh-375.png`, `zh-1440.png`; English screenshots and numeric results in the same folder.

User aesthetic confirmation remains pending. Existing GitHub/Cloudflare/domain deployment blockers are unaffected.
