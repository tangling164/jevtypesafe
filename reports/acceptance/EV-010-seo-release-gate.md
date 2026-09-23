# EV-010 · SEO release gate and share metadata

- Date: 2026-09-23
- Executor: Codex
- Branch: `codex/m1-foundation` tracking `origin/main`; implementation verified as a working-tree change after `a20cdea`
- Environment: Windows 11, Node 24.14.1, npm 11.11.0, Astro 7.3.3, Playwright 1.63.0
- Scope: M4-03 and AC-11 regression; M4-04 release preparation. This is local production-build evidence, not a live deployment claim.

## Implemented controls

1. `npm run build:production` forces `DEPLOY_ENV=production` and then checks every generated HTML page, `robots.txt`, canonical URL, hreflang alternates, sitemap membership, Open Graph metadata, Twitter Card metadata, and the social image asset.
2. `npm run deploy` now rebuilds through that gate and scans public output before Wrangler can upload it. CI runs the production gate after preview-mode browser tests. The content-review workflow also validates a production build.
3. Directory, about, privacy, search, and all six category routes have locale-specific descriptions. Category descriptions are content data validated by Zod and rendered as visible copy as well as metadata.
4. A 1200×630 Jev Atlas share image is generated reproducibly from the existing technology mark and is referenced by Open Graph and Twitter metadata on every page.

## Verification

| Check | Actual result |
| --- | --- |
| TDD red phase | New tests initially failed because `verify-production-seo.ts` and `page-metadata.ts` did not exist. |
| `npm test` | 13 files, 88/88 unit tests passed. The release-gate tests prove a preview/noindex build and missing social metadata are rejected. |
| `npm run check` | 0 errors, 0 warnings, 8 existing hints. |
| `npm run build` | Preview-safe static build passed with 47 pages; preview browser assertions continued to require `noindex,follow`. |
| `npx playwright test --workers=1` | 42/42 passed across desktop and 375px mobile, including canonical/hreflang/JSON-LD, social metadata, image delivery, accessibility, no-JS browsing, search, 404, and layout checks. |
| `npm run build:production` | 47 HTML pages; 44 `index,follow`; 3 `noindex,follow` (`404` and both search pages); 44 unique sitemap URLs; production robots allowed crawling; canonical/sitemap/hreflang sets matched; no duplicate indexable descriptions; all pages included the social metadata. |
| Social image inspection | `public/images/jev-atlas-social.png` inspected at its original 1200×630 size; text, logo, contrast, and safe margins were intact. |
| `npm run scan:public` | Passed with no findings; final counts are recorded in `reports/acceptance/public-scan.json`. |
| `git diff --check` | Passed. |

## Remaining production work

Cloudflare is still unauthenticated and Vercel/DNS access is unavailable in this environment. No deployment or DNS change was made. M4-04, AC-13, AC-14, AC-22, and the online portion of G0-05/G0-06 still require the real production URL, HTTPS, `www` redirect, response-header, and search-engine verification after deployment.
