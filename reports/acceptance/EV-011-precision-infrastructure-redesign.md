# EV-011 · Precision infrastructure redesign

- Date: 2026-09-24
- Executor: Codex
- Implementation version: `e30d80abaa22f5953a6dbc82926f9d0cc0d1086a` on `codex/precision-infrastructure-redesign`
- Environment: Windows 11, Node 24.14.1, npm 11.11.0, Astro 7.3.3, Playwright 1.63.0
- Scope: visual-quality refinement of the existing Jev Atlas static directory. P0 task and acceptance-criteria counts are unchanged.
- Approved direction: “精密基础设施 / 技术出版物.” The user approved the design sections and requested implementation before this work began.

## Resulting system

1. Replaced the generic dark landing-page treatment with a graphite/cyan technical publication system using self-hosted IBM Plex Sans and IBM Plex Mono, compact ruled navigation, rectangular controls, visible focus, and restrained radii.
2. Rebuilt the home page as an asymmetric, real-data index. Its status panel reads the current 10 projects, source state, bilingual coverage, and source-check date; categories and sections use numbered editorial structures.
3. Replaced project cards with stable numbered rows shared by server-rendered directories and client-rendered search results. The rows expose category, Stars, source/ecosystem state, requirements, and actions without changing public JSON or URLs.
4. Applied the same system to detail, search, information, contact, pagination, and 404 pages through fact tables, numbered sections, query/filter indices, page codes, and ruled forms.
5. Reduced entrance displacement to 8px and duration to 220ms, removed project-row translation, and kept reduced-motion behavior. Interactive home links no longer sit inside a moving entrance container, so no-JavaScript navigation is immediately actionable.
6. Kept Astro static output, bilingual routes, search behavior, SEO metadata, real 404 handling, Jev Atlas branding, content facts, and no-JavaScript browsing intact. No fabricated metrics or telemetry were added.

## Verification

| Check | Actual result |
| --- | --- |
| `npm run validate:data` | Passed: 10 published projects and 6 categories. |
| `npm run check` | Passed: 0 errors, 0 warnings, 8 existing hints. |
| `npm test` | Passed: 13 files and 88/88 tests. The Git-history scanner integration test was given an explicit 15s timeout after evidence showed its isolated run completed in 2.93s while full-suite worker contention exceeded Vitest's 5s default; scan logic was unchanged. |
| `npm run build` | Passed: 47 static pages. |
| `npx playwright test --workers=1` | Passed: 46/46 across desktop and 375px mobile, including WCAG AA, 44px controls, no-JavaScript browsing, search restoration, metadata, real 404, motion, and layout checks. |
| `npm run build:production` | Passed: 47 pages, 44 indexable and 3 noindex utility pages. Canonical, hreflang, sitemap, robots, and share metadata gates passed. |
| `npm run scan:public` | Passed: 264 source files, 116 dist files, 20 Git commits, 0 history matches, 0 findings. |
| `git diff --check` | Passed. |

## Visual review

`reports/precision-redesign/capture.mjs` captured `/`, `/projects/`, `/search/`, `/projects/supercov/`, `/about/`, and `/zh/` at 375px, 768px, and 1440px. All 18 final screenshots were inspected. `measurements.json` records for every sample:

- `overflow: false`
- `h1Count: 1`
- `undersizedControls: []`

The screenshots and reproducible measurements are stored in `reports/precision-redesign/`. Representative files include `home-375.png`, `home-1440.png`, `projects-768.png`, `search-1440.png`, `projects-supercov-375.png`, `about-768.png`, and `zh-1440.png`.

## Production boundary

No Cloudflare deployment, Vercel setting, DNS record, HTTPS configuration, or search-engine submission changed. M4-04 and M4-06 remain blocked on Cloudflare and Vercel/DNS access. This evidence covers the verified local redesign and production-build gate only; it does not claim that the redesign is live.
