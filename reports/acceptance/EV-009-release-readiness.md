# EV-009 · Release candidate and Git history credential scan

- Date/executor: 2026-09-23, Codex.
- Environment: Windows 11, Node.js v24.14.1, npm 11.11.0.
- Branch/version: `codex/m1-foundation`; UI release candidate `1ba9657`; history scanner implementation `b721781`.
- Scope: M4-01 and AC-16 closure evidence; release readiness for M3-06/M4-04. This record is not production deployment evidence.

## Release candidate

The user confirmed that the Jev Atlas UI adjustments were complete. Commit `1ba9657` records the accepted UI, generated technology-style brand assets, bilingual responsive checks, evidence files, and current documentation. Commit `b721781` adds a real Git-history scan and its regression test.

The history regression test creates a temporary repository, commits a token-shaped fixture, deletes it in a later commit, then runs the production scanner. The test verifies that the scanner fails, identifies the historical path and rule, and never prints the token value. The initial test failed because the scanner reported that history was not scanned; it passed after the implementation was added.

## Actual verification

| Check | Actual result |
| --- | --- |
| `npm run build` | Passed; 10 projects, 6 categories, 47 pages. |
| `npm run check` | Passed with 0 errors and 0 warnings; 8 existing Astro hints. |
| `npm test` | Passed; 11 files and 82 tests, including the Git-history regression. |
| `npm run scan:public` after `b721781` | Passed; 233 source files, 59 `dist` files, 6 commits scanned, 0 history matches, empty findings. |
| `git diff --check` before commits | Passed. |

Machine-readable scan output is in `reports/acceptance/public-scan.json`. The scan is heuristic and ignores binary assets in Git history; it covers the private-key, GitHub-token, and model-API-key patterns defined by the release scanner without logging matched values.

## External readiness boundary

- `origin` is configured as `https://github.com/tangling164/jevtypesafe.git`; no remote refs were returned before the first push. The GitHub CLI is not installed. A successful push and the resulting real GitHub Actions run are still required for M3-06.
- Wrangler is installed through the locked project dependency, but the current environment is not authenticated to Cloudflare and has no Cloudflare account/token environment variables. No deployment was attempted and no DNS was changed.
- `jevtypesafe.dev` remains the configured production URL. Cloudflare, Vercel DNS, HTTPS, and `www` redirect evidence remain required for M4-04, AC-13/14/22, and the final P0 release gate.

## Result

The local release candidate is committed and its source, build output, and six-commit Git history have no scanner findings. This closes the previously recorded Git-history portion of AC-16. M3-06, M4-04, M4-05, and M4-06 retain their external or dependency-bound status until their real release evidence exists.
