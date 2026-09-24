# Precision Infrastructure Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current generic dark landing-page aesthetic with a precise, editorial developer-directory interface across every Jev Atlas route without changing content facts, URLs, SEO, or behavior.

**Architecture:** Keep Astro components and existing semantic routes, but rebuild the visual layer around shared graphite/cyan tokens, self-hosted IBM Plex fonts, numbered information structures, and stable row/fact layouts. Component markup supplies real data and durable styling hooks; `global.css` owns shared primitives while `discovery.css` owns route and component layouts.

**Tech Stack:** Astro 7.3.3, TypeScript 6.0.3, Tailwind CSS 4.3.3, native CSS, `@fontsource/ibm-plex-sans` 5.3.0, `@fontsource/ibm-plex-mono` 5.3.0, Vitest 5.0.1, Playwright 1.63.0.

## Global Constraints

- Preserve Astro static output, TypeScript, Tailwind, JSON content, bilingual routes, search logic, SEO, real 404 behavior, and no-JavaScript browsing.
- Use real publication data only; do not add fake telemetry, model metrics, terminal output, testimonials, counts, or dates.
- Continue using the existing Jev Atlas name, technology mark, favicons, and social image.
- Do not add React, SSR, databases, runtime AI, paid services, new business features, URL changes, or content claims.
- Keep standalone controls at least 44px, retain visible focus, WCAG AA contrast, skip navigation, and `prefers-reduced-motion` behavior.
- Validate at 375px, 768px, and 1440px without document-level horizontal overflow.
- Use `apply_patch` for source edits and preserve unrelated work.

---

### Task 1: Lock the Visual Contract and Typography Foundation

**Files:**
- Modify: `tests/e2e/reference-layout.spec.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/styles/global.css`
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Consumes: existing `.site-header`, `.site-brand`, `.site-nav`, `.language-switch`, `.site-footer`, and `.shell` hooks.
- Produces: `--font-sans`, `--font-mono`, graphite/cyan design tokens, `.system-bar`, `.nav-current`, and the shared typography/focus/button primitives used by later tasks.

- [x] **Step 1: Add failing browser assertions for the new foundation**

Extend the shared-layout test with concrete computed-style and structure checks:

```ts
test('precision infrastructure visual foundation is active', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.site-header')).toHaveClass(/system-bar/);
  await expect(page.locator('.site-nav [aria-current="page"]')).toHaveCount(1);
  const styles = await page.locator('body').evaluate((element) => {
    const css = getComputedStyle(element);
    return { font: css.fontFamily, background: css.backgroundColor };
  });
  expect(styles.font).toContain('IBM Plex Sans');
  expect(styles.background).toBe('rgb(8, 12, 14)');
});
```

- [x] **Step 2: Run the focused test and confirm the intended failure**

Run: `npx playwright test tests/e2e/reference-layout.spec.ts --project=desktop --workers=1`

Expected: FAIL because `.system-bar`, `[aria-current="page"]`, and IBM Plex typography do not exist.

- [x] **Step 3: Install exact self-hosted font packages**

Run:

```powershell
npm install @fontsource/ibm-plex-sans@5.3.0 @fontsource/ibm-plex-mono@5.3.0
```

Expected: `package.json` and `package-lock.json` record both exact runtime dependencies.

- [x] **Step 4: Add font imports, tokens, and shared primitives**

At the top of `global.css`, import only used weights:

```css
@import '@fontsource/ibm-plex-sans/400.css';
@import '@fontsource/ibm-plex-sans/500.css';
@import '@fontsource/ibm-plex-sans/600.css';
@import '@fontsource/ibm-plex-mono/400.css';
@import '@fontsource/ibm-plex-mono/500.css';
```

Replace the current palette with this token contract and connect existing Tailwind theme aliases to it:

```css
:root {
  --canvas: #080c0e;
  --surface-0: #0b1114;
  --surface-1: #0f171a;
  --surface-2: #142024;
  --line: #243338;
  --line-strong: #385059;
  --ink: #e7edec;
  --muted: #93a2a5;
  --quiet: #66777b;
  --signal: #54d8d0;
  --signal-soft: #9ce9e3;
  --warning: #d8a35c;
  --font-sans: 'IBM Plex Sans', 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
  --font-mono: 'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace;
}
```

Set `body` to `background: var(--canvas)`, `font-family: var(--font-sans)`, and a subtle solid/linear graphite background without radial glows. Reduce general radii to 2–6px, make buttons rectangular, use the signal color only for focus/links/status, and keep focus outlines at least 2px.

- [x] **Step 5: Mark current navigation semantically and restyle the shell**

In `BaseLayout.astro`, compute active navigation from `path` and add `system-bar` to the header. Each matching link receives `aria-current="page"`; the Categories summary receives an active class for category routes. Keep the globe icon and existing destinations unchanged.

Use this pattern for links:

```astro
<a aria-current={path.startsWith(pagePath(locale, 'projects/')) ? 'page' : undefined} href={pagePath(locale, 'projects/')}>{t.projects}</a>
```

Restyle header/footer in `global.css` as compact ruled infrastructure bars with mono metadata labels, no pill navigation, and no restored affiliation strip.

- [x] **Step 6: Verify the focused contract and commit**

Run:

```powershell
npm run check
npx playwright test tests/e2e/reference-layout.spec.ts --project=desktop --workers=1
```

Expected: type check succeeds and all reference-layout desktop tests pass.

Commit:

```powershell
git add package.json package-lock.json src/styles/global.css src/layouts/BaseLayout.astro tests/e2e/reference-layout.spec.ts
git commit -m "Establish precision infrastructure design system"
```

---

### Task 2: Rebuild the Home Page as an Editorial Technical Index

**Files:**
- Modify: `tests/e2e/reference-layout.spec.ts`
- Modify: `src/components/HomePage.astro`
- Modify: `src/styles/discovery.css`

**Interfaces:**
- Consumes: `content.projects`, localized dictionary text, category data, `pagePath()`, and Task 1 tokens.
- Produces: `.hero-grid`, `.hero-primary`, `.hero-signal-panel`, `.signal-row`, `.category-index`, and the new home-page section layout.

- [x] **Step 1: Add failing structure and authenticity assertions**

Replace the old hierarchy assertions with:

```ts
test('home is an asymmetric technical index backed by real data', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero-grid')).toBeVisible();
  await expect(page.locator('.hero-primary .home-search')).toBeVisible();
  await expect(page.locator('.hero-signal-panel .signal-row')).toHaveCount(4);
  await expect(page.locator('.category-index a')).toHaveCount(6);
  await expect(page.locator('.category-index [data-index]')).toHaveText(['01', '02', '03', '04', '05', '06']);
  await expect(page.locator('.featured-directory .project-row')).toHaveCount(10);
  await expect(page.locator('.hero-signal-panel')).toContainText('10');
});
```

- [x] **Step 2: Run the focused test and confirm failure**

Run: `npx playwright test tests/e2e/reference-layout.spec.ts --project=desktop --workers=1`

Expected: FAIL because the new hero and numbered category hooks do not exist.

- [x] **Step 3: Replace centered Hero markup with a two-column real-data composition**

In `HomePage.astro`, calculate `translatedCount` and create this semantic structure:

```astro
<section class="discovery-hero">
  <div class="hero-grid">
    <div class="hero-primary">
      <p class="eyebrow hero-enter">{t.kicker}</p>
      <h1 class="hero-enter">...</h1>
      <p class="hero-intro hero-enter">{t.intro}</p>
      <form class="home-search hero-enter">...</form>
      <div class="hero-links hero-enter">...</div>
    </div>
    <aside class="hero-signal-panel hero-enter" aria-label={zh ? '目录状态' : 'Directory status'}>
      <header><span>ATLAS / INDEX</span><span class="status-live">{zh ? '已核查' : 'SOURCE CHECKED'}</span></header>
      <dl>
        <div class="signal-row"><dt>{zh ? '项目' : 'Projects'}</dt><dd>{content.projects.length}</dd></div>
        <div class="signal-row"><dt>{zh ? '已确认开源' : 'Open source'}</dt><dd>{openCount}</dd></div>
        <div class="signal-row"><dt>{zh ? '双语条目' : 'Bilingual'}</dt><dd>{translatedCount}</dd></div>
        <div class="signal-row"><dt>{t.checked}</dt><dd>{checkedDate}</dd></div>
      </dl>
    </aside>
  </div>
</section>
```

Remove the separate three-cell `.directory-summary` because the same facts now live in the signal panel.

- [x] **Step 4: Convert categories and lower strips to editorial structures**

Render category links with their one-based padded index:

```astro
{categories.map((category, index) => (
  <a href={pagePath(locale, `categories/${category.id}/`)}>
    <span class="category-index-number" data-index>{String(index + 1).padStart(2, '0')}</span>
    <span class="category-index-name">{category[locale]}</span>
    <strong>{categoryCount(category.id)}</strong>
    <span aria-hidden="true">↗</span>
  </a>
))}
```

Rename the navigation class to `.category-index`. Recast cooperation and submission sections as ruled editorial rows with restrained actions.

- [x] **Step 5: Implement responsive home styles**

In `discovery.css`:

- Use a 12-column `.hero-grid`, with the primary copy spanning 7 columns and the signal panel spanning 4 columns after a one-column gap.
- Cap the main heading at 64px desktop and 40px mobile; keep it left-aligned at every width.
- Use a rectangular command-style search bar with a mono `SEARCH /` prefix and no glow.
- Use a two-column category index on desktop, one column below 700px.
- Remove radial gradients, pill-category styling, large shadows, and project-card grid overrides.
- Collapse the signal panel below the Hero copy under 900px while preserving its four real rows.

- [x] **Step 6: Verify home behavior and commit**

Run:

```powershell
npm run build
npx playwright test tests/e2e/reference-layout.spec.ts tests/e2e/foundation.spec.ts --workers=1
```

Expected: build succeeds; homepage starts directly below navigation, all new structure assertions pass, and both desktop/mobile foundation tests pass.

Commit:

```powershell
git add src/components/HomePage.astro src/styles/discovery.css tests/e2e/reference-layout.spec.ts
git commit -m "Rebuild home as a technical index"
```

---

### Task 3: Turn Project Cards into Stable Index Rows

**Files:**
- Modify: `tests/e2e/reference-layout.spec.ts`
- Modify: `src/components/ProjectList.astro`
- Modify: `src/components/ProjectRow.astro`
- Modify: `src/scripts/search.ts`
- Modify: `src/styles/discovery.css`

**Interfaces:**
- Consumes: `PublicProject`, localized project text, category lookup, existing search-index fields.
- Produces: `ProjectRow` optional `position: number`, `.project-index`, `.project-data`, `.project-status`, and consistent server/client-rendered project rows.

- [ ] **Step 1: Add failing row-layout assertions**

Add to the shared-layout test:

```ts
await page.goto('/projects/');
await expect(page.locator('.project-row')).toHaveCount(10);
await expect(page.locator('.project-row .project-index').first()).toHaveText('01');
await expect(page.locator('.project-row .project-data').first()).toBeVisible();
await expect(page.locator('.project-row .project-status').first()).toBeVisible();
```

Also assert the search results use the same hooks after navigating to `/search/`.

- [ ] **Step 2: Run the test and confirm failure**

Run: `npx playwright test tests/e2e/reference-layout.spec.ts --project=desktop --workers=1`

Expected: FAIL because numbered rows and the new data/status columns are absent.

- [ ] **Step 3: Pass list position into server-rendered rows**

Change the component interface and mapping:

```astro
// ProjectList.astro
{projects.length ? <ol class="project-list">{projects.map((project, index) => <ProjectRow project={project} locale={locale} position={index + 1}/>)}</ol> : ...}

// ProjectRow.astro
interface Props { project: PublicProject; locale: Locale; position?: number }
const { project: p, locale, position = 1 } = Astro.props;
```

Render a two-digit `.project-index`, identity block, `.project-data` for category/Stars, `.project-status` for source/ecosystem/requirements, and a single `.project-actions` group. Keep badges semantically readable but visually rectangular.

- [ ] **Step 4: Match client-rendered search rows**

In `src/scripts/search.ts`, update the result template to emit the same `.project-index`, `.project-main`, `.project-data`, `.project-status`, and `.project-actions` hierarchy. Use the page-local result index padded with `String(index + 1).padStart(2, '0')`; do not add new index fields to public JSON.

- [ ] **Step 5: Replace card/grid CSS with a ruled index layout**

Define desktop columns as:

```css
.project-row {
  display: grid;
  grid-template-columns: 42px minmax(280px, 1fr) minmax(150px, .35fr) minmax(180px, .45fr) 96px;
  gap: 18px;
  align-items: start;
  border-bottom: 1px solid var(--line);
}
```

Use a 2px left signal line on hover/focus-within, a slight surface change, and an arrow color change. Remove horizontal translation and the two-column featured-card grid. Below 767px, use `42px minmax(0, 1fr)`, place data/status/actions beneath the identity column, and preserve 44px actions.

- [ ] **Step 6: Verify server and search rows and commit**

Run:

```powershell
npm run check
npx playwright test tests/e2e/reference-layout.spec.ts tests/e2e/directory.spec.ts --workers=1
```

Expected: all rows render, search behavior/state restoration remains unchanged, no-JavaScript navigation works, and no viewport overflow occurs.

Commit:

```powershell
git add src/components/ProjectList.astro src/components/ProjectRow.astro src/scripts/search.ts src/styles/discovery.css tests/e2e/reference-layout.spec.ts
git commit -m "Convert project cards to technical index rows"
```

---

### Task 4: Apply the System to Detail, Search, Information, and Utility Pages

**Files:**
- Modify: `tests/e2e/reference-layout.spec.ts`
- Modify: `src/components/ProjectDetail.astro`
- Modify: `src/components/Search.astro`
- Modify: `src/components/InfoPage.astro`
- Modify: `src/components/ContactForm.astro`
- Modify: `src/components/Pagination.astro`
- Modify: `src/pages/[...path].astro`
- Modify: `src/pages/404.astro`
- Modify: `src/styles/discovery.css`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: Task 1 tokens and Task 3 project rows.
- Produces: `.page-code`, `.fact-table`, `.section-number`, `.filter-index`, `.info-note`, and consistent utility-page layouts.

- [ ] **Step 1: Add failing cross-page structure assertions**

Extend the shared test:

```ts
await page.goto('/projects/supercov/');
await expect(page.locator('.detail-sidebar.fact-table')).toBeVisible();
await expect(page.locator('.detail-main .section-number')).toHaveText(['01', '02', '03', '04']);

await page.goto('/search/');
await expect(page.locator('.filter-panel.filter-index')).toBeVisible();

await page.goto('/about/');
await expect(page.locator('.info-aside.info-note')).toBeVisible();

await page.goto('/missing-precision-route/');
await expect(page.locator('.page-code')).toContainText('404');
```

- [ ] **Step 2: Run the test and confirm failure**

Run: `npx playwright test tests/e2e/reference-layout.spec.ts --project=desktop --workers=1`

Expected: FAIL on the new fact-table, section-number, filter-index, info-note, and page-code hooks.

- [ ] **Step 3: Add editorial numbering and fact-table semantics**

In `ProjectDetail.astro`, map the four main sections with explicit `01`–`04` `.section-number` labels, add `fact-table` to the sidebar, and keep every existing source/fact/action. Replace decorative monogram dominance with a compact project key.

In `src/pages/[...path].astro`, add a localized `.page-code` to directory/category headings such as `INDEX / ALL` and `INDEX / 03`; do not change H1 count or metadata.

- [ ] **Step 4: Align search, information, forms, pagination, and 404**

- Add `filter-index` to the filter panel and mono group numbers before each fieldset legend.
- Add `info-note` to the information aside and a page code derived from `kind`.
- Restyle existing ContactForm fields as ruled technical inputs while preserving names, validation, copy behavior, and mailto behavior.
- Render pagination as compact numbered/previous/next controls with `aria-current` retained.
- Give 404 a `.page-code` value of `ERR / 404` and retain real response status through existing routing.

- [ ] **Step 5: Implement shared inner-page CSS**

Use a consistent 12-column editorial grid, numbered section labels, ruled fact rows, rectangular inputs, and mono metadata. Keep detail facts sticky only above 900px. Ensure info body line length stays near 70 characters and filters collapse into the existing accessible details element on mobile.

- [ ] **Step 6: Run behavior, accessibility, and SEO regressions, then commit**

Run:

```powershell
npm run check
npx playwright test tests/e2e/reference-layout.spec.ts tests/e2e/contact.spec.ts tests/e2e/accessibility.spec.ts tests/e2e/seo.spec.ts --workers=1
```

Expected: structure tests pass; contact behavior is unchanged; axe reports no violations; SEO metadata and JSON-LD remain correct.

Commit:

```powershell
git add src/components/ProjectDetail.astro src/components/Search.astro src/components/InfoPage.astro src/components/ContactForm.astro src/components/Pagination.astro src/pages/[...path].astro src/pages/404.astro src/styles/discovery.css src/styles/global.css tests/e2e/reference-layout.spec.ts
git commit -m "Unify inner pages with editorial infrastructure layout"
```

---

### Task 5: Tune Motion and Complete Visual QA

**Files:**
- Modify: `tests/e2e/motion.spec.ts`
- Modify: `src/styles/discovery.css`
- Create: `reports/precision-redesign/capture.mjs`
- Create: `reports/precision-redesign/measurements.json`
- Create: `reports/precision-redesign/*.png`

**Interfaces:**
- Consumes: all redesigned routes and the existing motion script.
- Produces: restrained 120–240ms interaction behavior and reproducible 375/768/1440 visual evidence.

- [ ] **Step 1: Add failing motion assertions**

Assert project rows do not translate horizontally and interaction durations stay within the approved range:

```ts
const row = page.locator('.project-row').first();
await row.hover();
expect(await row.evaluate((element) => getComputedStyle(element).transform)).toBe('none');
const durations = await row.evaluate((element) => getComputedStyle(element).transitionDuration.split(',').map((value) => Number.parseFloat(value) * 1000));
expect(durations.every((duration) => duration >= 120 && duration <= 240)).toBe(true);
```

- [ ] **Step 2: Run motion tests and confirm failure**

Run: `npx playwright test tests/e2e/motion.spec.ts --project=desktop --workers=1`

Expected: FAIL because the current row hover translates horizontally.

- [ ] **Step 3: Tune motion CSS**

Use opacity/color/border transitions between 120ms and 240ms. Keep the existing reveal system, reduce Hero entrance displacement to 8px, eliminate row translation, and retain the global reduced-motion override that makes transition duration `0s`.

- [ ] **Step 4: Create and run the visual capture script**

The script must start from the already-built Wrangler preview and capture `/`, `/projects/`, `/search/`, `/projects/supercov/`, `/about/`, and `/zh/` at widths 375, 768, and 1440. It must record for every route/width:

```js
{
  path,
  width,
  documentWidth,
  overflow: documentWidth > width,
  h1Count,
  undersizedControls,
  screenshot
}
```

Write screenshots and `measurements.json` under `reports/precision-redesign/`.

- [ ] **Step 5: Review every screenshot and correct visual defects**

Inspect all 18 images at original detail. Fix inconsistent alignment, excessive empty space, clipped text, low-contrast metadata, broken grid transitions, remaining pill clusters, or generic card styling. Re-run the capture after every CSS correction until `overflow` is false, `h1Count` is 1, and `undersizedControls` is empty for every sample.

- [ ] **Step 6: Run focused and full browser checks, then commit**

Run:

```powershell
npm run build
npx playwright test tests/e2e/motion.spec.ts tests/e2e/reference-layout.spec.ts --workers=1
npx playwright test --workers=1
```

Expected: 47-page preview build succeeds, focused tests pass, and the complete desktop/mobile suite passes.

Commit:

```powershell
git add src/styles/discovery.css tests/e2e/motion.spec.ts reports/precision-redesign
git commit -m "Refine motion and record visual redesign evidence"
```

---

### Task 6: Production Verification, Evidence, and Delivery

**Files:**
- Create: `reports/acceptance/EV-011-precision-infrastructure-redesign.md`
- Modify: `reports/acceptance/public-scan.json`
- Modify: `docs/PROJECT_PLAN.md`

**Interfaces:**
- Consumes: complete redesign, existing production SEO gate, public scanner, and visual evidence.
- Produces: final acceptance record, current project handoff, and a reviewed remote commit.

- [ ] **Step 1: Run final local verification from the final source state**

Run sequentially:

```powershell
npm run validate:data
npm run check
npm test
npm run build
npx playwright test --workers=1
npm run build:production
npm run scan:public
git diff --check
```

Expected: 10 projects and 6 categories validate; type check has zero errors; all unit and browser tests pass; preview and production builds generate 47 pages; production SEO verifies 44 indexable and 3 noindex pages; public scan has no findings; diff check passes.

- [ ] **Step 2: Record acceptance evidence**

Create EV-011 with date, branch/SHA, environment, approved direction, changed visual system, all actual command results, visual-review routes/viewports, screenshots, public-scan counts, and the explicit statement that no deployment or DNS change occurred.

- [ ] **Step 3: Update the sole progress ledger**

Update `docs/PROJECT_PLAN.md` current handoff and evidence table with EV-011. Keep P0 task/AC counts unchanged because this is a visual quality refinement; keep M4-04/M4-06 blocked on Cloudflare/Vercel/DNS access.

- [ ] **Step 4: Commit and push the verified redesign**

```powershell
git add reports/acceptance/EV-011-precision-infrastructure-redesign.md reports/acceptance/public-scan.json docs/PROJECT_PLAN.md
git commit -m "Record precision redesign acceptance"
git push origin HEAD:main
```

- [ ] **Step 5: Verify GitHub Actions**

Read the public GitHub Actions API for the pushed full SHA until `Quality checks` completes. Record the run URL and conclusion in EV-011 and the project ledger. If documentation is updated with the run ID, commit and push that evidence update, then verify the final remote run also succeeds.

Expected: `origin/main` equals local HEAD, working tree is clean, and the final `Quality checks` conclusion is `success`.
