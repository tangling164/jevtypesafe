# EV-012 · Cloudflare production deployment

- Date: 2026-09-24
- Executor: Codex with the site owner's Cloudflare authorization
- Production source: `fda0c3d244d1adb07db964dd21d83bf4c5927788` on `origin/main`; release tag `v0.1.0`
- Environment: Windows 11, Node 24.14.1, npm 11.11.0, Wrangler 4.135.0, Cloudflare Workers Builds
- Worker: `jev-builds-directory`

## Deployment setup

1. Authenticated Wrangler through Cloudflare OAuth and uploaded the verified static output to the existing `jev-builds-directory` Worker.
2. Connected `tangling164/jevtypesafe` to Cloudflare Workers Builds with production branch `main`, root directory `/`, production command `npx wrangler deploy`, and preview builds enabled.
3. Configured the build gate as `npm run check && npm test && npm run build:production && npm run scan:public`.
4. Authorized the Cloudflare GitHub App for the repository after the first connection screen reported the Git account as disconnected; the warning cleared after authorization.
5. Added `jevtypesafe.dev` as the declarative Wrangler custom domain so subsequent `main` builds retain the production binding.
6. The first Git-triggered build (`f433305a-7e5a-485e-8881-025a21da0a94`) completed the quality gate and asset upload, then exposed two obsolete Vercel apex A records through Cloudflare error `100117`. With the owner's explicit confirmation, removed only `jevtypesafe.dev → 216.198.79.1` and `jevtypesafe.dev → 216.198.79.65`; wildcard, `www`, CAA, MX, DKIM, and SPF records were preserved.
7. Retried the same source as build `32f5d303-f7da-4bc9-bd21-931b674645c4`. It completed in 1m 8s and deployed version `173587e1-93ae-4ddc-8f41-801a09c3f4ad`.
8. Deployed the active Cloudflare Redirect Rule `Redirect www to root`: HTTPS `www` requests receive 301, the original path is retained by wildcard replacement, and query-string preservation is enabled.

## Verification

| Check | Current result |
| --- | --- |
| Local `npm run check` | Passed: 0 errors, 8 informational hints. |
| Local `npm test` | Passed: 13 files, 88/88 tests. |
| Local `npm run build:production` | Passed: 47 pages, 44 indexable and 3 noindex utility pages. |
| Local `npm run scan:public` | Passed: 266 source files, 116 dist files, 25 Git commits, 0 history matches, 0 findings. |
| `npx wrangler deploy --dry-run` | Passed: 166 static assets read, no bindings or Worker bundle. |
| Initial manual Worker deployment | Passed: version `1a8c3c58-5ee9-4afc-bc04-399344538650` at `https://jev-builds-directory.tl18774902382.workers.dev`. |
| GitHub `Quality checks` | Passed: run `35966893387` for the domain commit and run `35967436989` for production source `fda0c3d244d1adb07db964dd21d83bf4c5927788`. |
| Workers Builds from `main` | Git push triggered build `f433305a-7e5a-485e-8881-025a21da0a94`; its post-DNS retry `32f5d303-f7da-4bc9-bd21-931b674645c4` passed and promoted version `173587e1-93ae-4ddc-8f41-801a09c3f4ad`. |
| `https://jevtypesafe.dev/` | `200 OK`, `text/html`, Cloudflare edge response, HTTPS valid, `CF-Cache-Status: HIT`. |
| `https://jevtypesafe.dev/zh/` | `200 OK`. |
| `https://jevtypesafe.dev/projects/supercov/` | `200 OK`. |
| `https://jevtypesafe.dev/missing-deploy-check/` | `404 Not Found` with the static Jev Atlas 404 page. |
| `https://www.jevtypesafe.dev/test-path?probe=1` | `301 Moved Permanently` to `https://jevtypesafe.dev/test-path?probe=1`; path and query retained. |
| `https://jevtypesafe.dev/robots.txt` | `200 OK`, production crawl policy and sitemap reference served. |
| `https://jevtypesafe.dev/sitemap.xml` | `200 OK`, `application/xml`. |
| Response boundary | Root, locale, detail, 404, robots, and sitemap are served by Cloudflare Static Assets with no bindings or Worker bundle. |

## Result

M4-04 and M4-06 are accepted. AC-13, AC-14, and the P0 portion of AC-22 pass against the real production service. The P0 directory is publicly reachable at `https://jevtypesafe.dev/`; `www` canonicalizes to the apex and email-routing records remain present. Cloudflare Web Analytics remains deliberately unconfigured and does not block the directory release.
