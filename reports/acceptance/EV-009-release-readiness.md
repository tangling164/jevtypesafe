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
| `npm run scan:public` after fetching all remote branches | Passed; 234 source files, 59 `dist` files, 10 reachable commits scanned, 0 history matches, empty findings. |
| `git diff --check` before commits | Passed. |

Machine-readable scan output is in `reports/acceptance/public-scan.json`. The scan is heuristic and ignores binary assets in Git history; it covers the private-key, GitHub-token, and model-API-key patterns defined by the release scanner without logging matched values.

## GitHub release-chain verification

- The first push created public remote `main` at `fdb986a`. [Quality checks run 35869769200](https://github.com/tangling164/jevtypesafe/actions/runs/35869769200) passed checkout, locked npm install, `npm ci`, data validation, type/config checks, 82 unit tests, 47-page build, Chromium installation, and the complete end-to-end suite.
- Manual [content review run 35870241834](https://github.com/tangling164/jevtypesafe/actions/runs/35870241834) passed bounded collection, validate/check/test/build/scan, artifact upload, commit, and branch push. Its last command failed because the repository setting prohibited Actions from creating pull requests.
- The repository kept its default workflow permission at `read`; only the existing workflow's explicit `contents: write` and `pull-requests: write` permissions apply. The repository-level `can_approve_pull_request_reviews` switch was changed from `false` to `true`, enabling the planned bot PR step.
- A new manual [content review run 35870617975](https://github.com/tangling164/jevtypesafe/actions/runs/35870617975) then passed every step and created [PR #1, Review candidate content updates](https://github.com/tangling164/jevtypesafe/pull/1). The PR changes only `reports/content-diff.json`; it does not directly publish content. The workflow validates its own proposal because a `GITHUB_TOKEN`-created PR may not automatically run another workflow.
- Annotated tag `v0.1.0-rc.1` points to `fdb986a` and was pushed to origin. Its [tag-triggered quality run 35870919523](https://github.com/tangling164/jevtypesafe/actions/runs/35870919523) also passed the complete quality workflow.
- GitHub initially held the PR-triggered quality run for approval because the actor was `github-actions[bot]`. After confirming that PR #1 changes only the generated review report, the run was approved; [PR quality run 35870723324](https://github.com/tangling164/jevtypesafe/actions/runs/35870723324) then passed every step.
- Log inspection showed that Actions' default shallow checkout let the history scanner see only one commit. Both workflows now use `fetch-depth: 0`, and the general quality workflow runs `scan:public` on every push and pull request. [Full-history main run 35872076269](https://github.com/tangling164/jevtypesafe/actions/runs/35872076269) passed the new scanner step with 234 source files, 59 `dist` files, 10 reachable commits, 0 history matches, and empty findings, then passed the complete end-to-end suite.

## Remaining external boundary

- Wrangler is installed through the locked project dependency, but the current environment is not authenticated to Cloudflare and has no Cloudflare account/token environment variables. No deployment was attempted and no DNS was changed.
- `jevtypesafe.dev` remains the configured production URL. Cloudflare, Vercel DNS, HTTPS, and `www` redirect evidence remain required for M4-04, AC-13/14/22, and the final P0 release gate.

## Result

The release candidate is committed to remote `main`; its source, build output, and complete reachable Git history have no scanner findings. Main, tag, and PR quality runs plus the content review workflow passed on GitHub, PR #1 was created by the workflow, and `v0.1.0-rc.1` records the known-good candidate. This closes M3-06, M4-05, and the previously recorded Git-history portion of AC-16. M4-04 and M4-06 remain blocked on deployment and domain access.
