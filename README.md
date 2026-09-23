# Jev Atlas

Independent, source-reviewed English / 简体中文 directory. Astro produces static HTML; Cloudflare Workers Static Assets serves it. Ordinary listings are free. No runtime AI, accounts, payment collection or active sponsorship tracking is included.

## Run on Windows or CI

Use Node **24.14.1** and npm **11.11.0** (also fixed in `.node-version`, `package.json` and CI).

```powershell
npm ci
npm run validate:data
npm run check
npm test
npm run build
npm run build:production
npm run dev
```

`npm run build` deliberately creates preview-safe `noindex` output. `npm run build:production` forces the production environment and rejects the result unless indexable pages, robots.txt, canonical URLs, hreflang, sitemap entries, and social metadata agree. `npm run preview` previews Astro output; `npm run preview:cloudflare` serves built assets at `http://127.0.0.1:8787` with Cloudflare's actual local routing and 404 behavior. `npx playwright install chromium` installs the test browser; `npm run test:e2e` checks desktop and **375px** mobile behavior. `npm run verify:capacity` builds 1,500 isolated synthetic projects; it never changes production content. `npm run scan:public` scans the public build and non-ignored Git working files, printing locations rather than matching secret text.

Astro 7.3.3, Tailwind 4.3.3, TypeScript 6.0.3 and Zod 4.6.5 are pinned with exact direct versions and `package-lock.json`. TypeScript 6 is used because the current Astro checker declares support through 6. Tailwind uses the official Vite integration. Vitest covers data rules; Playwright and axe cover browser behavior and accessibility; Lighthouse provides laboratory performance evidence. Test tools are development dependencies, not browser runtime dependencies.

## Configuration

Copy `.env.example` to `.env` locally. Never commit secrets. Astro loads build settings from the environment; Node content commands explicitly load `.env` if present. Default `DEPLOY_ENV=preview` emits noindex. The default `SITE_URL=https://jevtypesafe.dev` was confirmed by the site owner on 2026-09-22.

`CONTACT_EMAIL` remains empty until a real receiving address is supplied. The form can still copy drafts but does not pretend to send mail. `PUBLIC_WEB_ANALYTICS_TOKEN` loads a beacon only in production. `COMMERCIAL_MODE=off` is enforced; M5 must precede paid campaigns.

## Content work

```powershell
npm run ingest
npm run enrich
npm run translate -- --dry-run
npm run content:diff
```

These commands write an ignored `var/ingest/` review workspace plus `reports/content-diff.json`. They do **not** overwrite `content/projects/`. For a saved upstream file use `ingest -- --input path/to/source.json`; for saved GitHub metadata/README/license snapshots use `enrich -- --snapshots path/to/repositories.json`. `enrich -- --offset 10` selects another bounded repository batch. Raw upstream text is data, never a command or instruction.

The actual summary provider, model and prices are not selected. The provider interface supports conservative USD budgeting and fixture verification; the CLI queues work without paid calls until a real adapter is selected. Do not treat this as a configured live translation service.

See [operations](docs/OPERATIONS.md) for review, correction and recovery. [PROJECT_PLAN.md](docs/PROJECT_PLAN.md) is the only progress ledger; acceptance reports record actual evidence.

## Deployment

Cloudflare Workers Builds should install with `npm ci` and run `npm run check`, `npm test`, and `npm run build:production`. Deploy only from the intended `main` branch with reviewed production settings. `npm run deploy` always rebuilds and verifies production SEO before scanning and uploading, so a preview `noindex` artifact cannot be deployed accidentally. The command needs account access. This repository has no SSR adapter, Worker `main`, D1 binding or all-route Worker execution.

Confirm the purchased domain in Vercel, preserve existing DNS records, connect Cloudflare nameservers/custom domain, and verify HTTPS plus a www 301 retaining path/query. A local preview is not a deployed site. GitHub's content workflow proposes a review report; it neither merges nor deploys changes.

## Boundaries

Only `content/projects/*.json` records that pass Schema, publication status, overrides and tombstones become explicit public view models. Fixtures, research, raw downloads, generated queues, private provenance and reports are not public assets. Three seed entries have fixed repository/README/LICENSE references; source review does not mean the projects have been run.

All authored application code stays separate from third-party source material. The upstream MIT directory supplies discovery clues; its license does not license linked videos, screenshots or community posts. Preserve source attribution and license notices when reusing upstream code or prose.
