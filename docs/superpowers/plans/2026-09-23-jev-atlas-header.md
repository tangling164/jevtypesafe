# Jev Atlas Header Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the public product to Jev Atlas, remove the homepage header-to-hero gap, and disable Astro's development toolbar.

**Architecture:** Keep `content/site.json` as the public name source and pass the route kind to `BaseLayout` so only home routes receive compact main spacing. Disable the toolbar through Astro's existing configuration. Update static copy and SEO fallbacks to the same public name.

**Tech Stack:** Astro 7, TypeScript, Tailwind CSS, Playwright.

## Global Constraints

- The public product name is exactly `Jev Atlas` in both languages.
- Keep `https://jevtypesafe.dev`, the existing generated technology mark, and the independent-site positioning.
- Historical evidence keeps the old name when describing past work.
- Non-home routes retain their existing main padding.

---

### Task 1: Lock the public name and homepage spacing behavior

**Files:**
- Modify: `tests/e2e/reference-layout.spec.ts`

**Interfaces:**
- Consumes: rendered `.site-brand`, document `<title>`, `.site-header`, `.discovery-hero`.
- Produces: a regression test for the public name and header-to-hero distance.

- [x] **Step 1: Add the failing browser test**

Add a test that loads `/` and `/zh/`, expects `.site-brand` to contain `Jev Atlas`, expects the document title to end in `· Jev Atlas`, and asserts the vertical distance from the header bottom to `.discovery-hero` top is at most 1px.

- [x] **Step 2: Run the focused test and confirm failure**

Run: `npx playwright test tests/e2e/reference-layout.spec.ts --project=desktop --grep "Jev Atlas"`

Expected: FAIL because the current brand is `Jev / builds` and the homepage main container adds top padding.

### Task 2: Apply Jev Atlas throughout public code and documentation

**Files:**
- Modify: `content/site.json`
- Modify: `.env.example`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/[...path].astro`
- Modify: `src/lib/config.ts`
- Modify: `src/lib/seo.ts`
- Modify: `src/components/InfoPage.astro`
- Modify: `README.md`
- Modify: `docs/AGENTS.md`
- Modify: `docs/jev-directory-prd-v1.0.md`

**Interfaces:**
- Consumes: `config.SITE_NAME`, `route.kind`.
- Produces: `isHome?: boolean` layout prop and one consistent public product name.

- [x] **Step 1: Update the configuration source and fallbacks**

Set `content/site.json` name, `.env.example` `SITE_NAME`, and the Zod default in `src/lib/config.ts` to `Jev Atlas`.

- [x] **Step 2: Update rendered brand and SEO copy**

Render `<span>Jev <span>Atlas</span></span>` in the header, use `config.SITE_NAME` for SEO breadcrumb names, and change the About copy to name Jev Atlas.

- [x] **Step 3: Pass homepage state into the layout**

Add `isHome?: boolean` to `BaseLayout` props, default it to false, pass `isHome={route.kind === 'home'}`, and apply `home-main` to the main element when true.

- [x] **Step 4: Synchronize current product documentation**

Change the current name in README, repository instructions, and PRD configuration examples. Do not rewrite historical evidence files.

### Task 3: Remove the gap and development toolbar

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/styles/discovery.css`
- Modify: `astro.config.ts`

**Interfaces:**
- Consumes: `.home-main`, `.discovery-hero`.
- Produces: a flush homepage section and toolbar-free local development UI.

- [x] **Step 1: Disable the Astro toolbar**

Add `devToolbar: { enabled: false }` to `defineConfig`.

- [x] **Step 2: Remove homepage wrapper padding**

Set `.home-main { padding-top: 0; }` and ensure the mobile `main.shell` rule does not override it.

- [x] **Step 3: Tighten hero top spacing**

Reduce desktop hero top padding from 72px to 36px and mobile top padding from 44px to 28px while preserving bottom spacing.

- [x] **Step 4: Run the focused browser test**

Run: `npx playwright test tests/e2e/reference-layout.spec.ts --project=desktop --grep "Jev Atlas"`

Expected: PASS for English and Chinese homepage checks.

### Task 4: Verify and record the change

**Files:**
- Modify: `docs/PROJECT_PLAN.md`
- Create: `reports/acceptance/EV-008-jev-atlas-header.md`

**Interfaces:**
- Consumes: build, check, and Playwright results.
- Produces: the sole progress-ledger update and acceptance evidence.

- [x] **Step 1: Run static validation**

Run: `npm run check && npm run build`

Expected: 0 errors and a successful 47-page build.

- [x] **Step 2: Run focused responsive browser validation**

Check `/` and `/zh/` at 375px and 1440px. Assert name/title, a header-to-hero distance no larger than 1px, no horizontal overflow, working language switch, and no `astro-dev-toolbar` element.

- [x] **Step 3: Update evidence and project ledger**

Record commands, actual outcomes, screenshot paths, the new current name, and any failures without changing P0 denominators or claiming deployment.
