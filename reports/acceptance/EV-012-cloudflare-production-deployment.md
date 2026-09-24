# EV-012 · Cloudflare production deployment

- Date: 2026-09-24
- Executor: Codex with the site owner's Cloudflare authorization
- Release candidate: `97612e96cb86ebbc05ade21cd0366e0263c024e3`
- Environment: Windows 11, Node 24.14.1, npm 11.11.0, Wrangler 4.135.0, Cloudflare Workers Builds
- Worker: `jev-builds-directory`

## Deployment setup

1. Authenticated Wrangler through Cloudflare OAuth and uploaded the verified static output to the existing `jev-builds-directory` Worker.
2. Connected `tangling164/jevtypesafe` to Cloudflare Workers Builds with production branch `main`, root directory `/`, production command `npx wrangler deploy`, and preview builds enabled.
3. Configured the build gate as `npm run check && npm test && npm run build:production && npm run scan:public`.
4. Authorized the Cloudflare GitHub App for the repository after the first connection screen reported the Git account as disconnected; the warning cleared after authorization.
5. Added `jevtypesafe.dev` as the declarative Wrangler custom domain so subsequent `main` builds retain the production binding.

## Verification in progress

| Check | Current result |
| --- | --- |
| Local `npm run check` | Passed: 0 errors, 8 informational hints. |
| Local `npm test` | Passed: 13 files, 88/88 tests. |
| Local `npm run build:production` | Passed: 47 pages, 44 indexable and 3 noindex utility pages. |
| Local `npm run scan:public` | Passed: 265 source files, 116 dist files, 23 Git commits, 0 history matches, 0 findings. |
| `npx wrangler deploy --dry-run` | Passed: 166 static assets read, no bindings or Worker bundle. |
| Initial manual Worker deployment | Passed: version `1a8c3c58-5ee9-4afc-bc04-399344538650` at `https://jev-builds-directory.tl18774902382.workers.dev`. |
| Workers Builds from `main` | Pending the first post-authorization push. |
| Production domain, HTTPS, and `www` redirect | Pending online verification. |

This record remains provisional until the automatic build, formal domain, HTTPS, real 404, static response, SEO metadata, and `www` path/query-preserving redirect checks complete.
