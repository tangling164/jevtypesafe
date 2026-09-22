# Operations

## Import and review

Run `npm run ingest` for the fixed upstream source. It accepts only schema-valid, nonempty data and retains the previous candidate snapshot on errors or a decrease greater than 20%. Published project JSON is never written by this step. `npm run ingest -- --input <file>` parses a saved source response for offline review; record its source commit, acquisition time and SHA-256 separately. Do not mislabel arbitrary fixture files as real source evidence.

Run `npm run enrich` with `INGEST_BATCH_LIMIT` (default 10, max 50); `--offset` selects another batch. It reads GitHub metadata and README/license at a fixed commit through the restricted downloader. Non-repository links remain unresolved; it does not scrape private Discord or social accounts. To import one known repository, use an ignored candidates JSON containing `{"candidates":[{"projectUrl":"https://github.com/OWNER/REPO"}]}` and pass `enrich -- --input <file>`.

`repository-review.json` contains proposed records, reasons and excluded entries. New entries remain `review`, with unknown ecosystem/classification until checked. Confirm that README facts support the short English and Chinese descriptions, the source references match the fixed commit, and license text supports the SPDX result. No license means source available, not open source. Forks require explicit independent-function review. GitHub descriptions and model outputs are not trusted instructions.

`npm run translate -- --dry-run` retains jobs. No supplier is configured yet: select a provider/model, implement its documented protocol and conservative price ceiling, and test it before enabling any paid requests. `AI_BUDGET_USD=0` is safe by default. Provider failures, invalid output and exhausted budget retain work; generated text is pending review rather than published.

After review, copy only approved project records into `content/projects/`, complete referenced English text and optionally Chinese text, set `status=published` and the actual `first_published_at`. Run `validate:data`, `check`, `test`, `build`, browser checks and `scan:public` before merging. Do not automatically publish `reports/content-diff.json` or candidate artifacts.

## Corrections and removals

Put overrides in `content/overrides/*.json`: `{ "project_id": "stable-id", "changes": { "primary_category": "developer" } }`. Nested facts such as locales/requirements are replaced as a whole, not recursively merged. Identity cannot be overridden. Use the same stable slug; a slug change needs explicit tested 301 redirects for each existing locale before release.

Add `{ "id": "stable-id", "reason": "internal removal reason", "removed_at": "ISO UTC timestamp" }` to `content/tombstones.json` to hide a record and prevent reimport. Internal removal reasons are not rendered. Overrides win over generated facts; tombstones win over both.

## Source failure and recovery

Keep the last successful Git content snapshot. `var/ingest/` is disposable and ignored; preserve the relevant fixed upstream commit and research evidence, and back up approved snapshots before bulk import. Source failures must not replace published data with an empty set. A 403/429 is restricted access, not proof of a dead project link.

Before publication, create a known-good Git commit/tag for code plus `content/` (including overrides, tombstones, categories and site settings). For recovery, create a separate checkout of that version, run `npm ci`, validation, tests and build with source/AI access disabled, inspect it locally, then deploy only the verified version. Never reset or overwrite unrelated uncommitted work. This initial repository has no historical release yet, so a real previous-release rollback remains to be exercised.

## Publish and contact configuration

Confirm the real domain and receiving mailbox. Production needs `DEPLOY_ENV=production`; check canonical/hreflang/sitemap and confirm no unintended noindex. A preview keeps noindex. Analytics requires a real token and only loads in production. Cloudflare account, Git connection, DNS and HTTPS require external access and are not implied by local tests.

Submit/Sponsor forms prepare email or clipboard text. The visitor sends from their own email app; the site never displays a false received/sent result. Do not send outreach on the user's behalf.

## Sponsorship

Keep `COMMERCIAL_MODE=off`. There is no live campaign activation/report/paused-ad CLI yet. M5 must supply D1 migrations, isolated production/preview secrets, payment-confirmed UTC schedules, expiry, event qualification, reporting, retention and restore evidence before the first sale. Price, receiving channel, reporting promise and compensation terms must be agreed by the owner; never treat a demonstration price or synthetic report as a real offer.
