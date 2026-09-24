import { test, expect } from '@playwright/test';

test('precision infrastructure visual foundation is active', async ({ page }) => {
  await page.goto('/projects/');
  await expect(page.locator('.site-header')).toHaveClass(/system-bar/);
  await expect(page.locator('.site-nav [aria-current="page"]')).toHaveCount(1);
  const styles = await page.locator('body').evaluate((element) => {
    const css = getComputedStyle(element);
    return { font: css.fontFamily, background: css.backgroundColor };
  });
  expect(styles.font).toContain('IBM Plex Sans');
  expect(styles.background).toBe('rgb(8, 12, 14)');
});

test('Jev Atlas home begins directly below the navigation', async ({ page }) => {
  for (const path of ['/', '/zh/']) {
    await page.goto(path);
    await expect(page.locator('.site-brand')).toContainText('Jev Atlas');
    await expect(page).toHaveTitle(/· Jev Atlas$/);
    const gap = await page.evaluate(() => {
      const header = document.querySelector('.site-header')!.getBoundingClientRect();
      const hero = document.querySelector('.discovery-hero')!.getBoundingClientRect();
      return Math.round(hero.top - header.bottom);
    });
    expect(gap).toBeLessThanOrEqual(1);
  }
});

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

test('directory, search, detail and info pages use the shared layout system', async ({ page }) => {
  await page.goto('/projects/');
  await expect(page.locator('.page-heading')).toContainText('Projects');
  await expect(page.locator('.directory-toolbar')).toBeVisible();
  await expect(page.locator('.project-list .project-row')).toHaveCount(10);
  await expect(page.locator('.project-row .project-index').first()).toHaveText('01');
  await expect(page.locator('.project-row .project-data').first()).toBeVisible();
  await expect(page.locator('.project-row .project-status').first()).toBeVisible();

  await page.goto('/search/');
  await expect(page.locator('.search-layout')).toBeVisible();
  await expect(page.locator('.filter-panel.filter-index')).toBeVisible();
  await expect(page.locator('#search-results .project-row')).toHaveCount(10);
  await expect(page.locator('#search-results .project-index').first()).toHaveText('01');
  await expect(page.locator('#search-results .project-data').first()).toBeVisible();
  await expect(page.locator('#search-results .project-status').first()).toBeVisible();

  await page.goto('/projects/supercov/');
  await expect(page.locator('.detail-layout')).toBeVisible();
  await expect(page.locator('.detail-sidebar.fact-table')).toContainText('License');
  await expect(page.locator('.detail-main .section-number')).toHaveText(['01', '02', '03', '04']);

  await page.goto('/about/');
  await expect(page.locator('.info-page')).toBeVisible();
  await expect(page.locator('.info-aside.info-note')).toBeVisible();

  await page.goto('/missing-precision-route/');
  await expect(page.locator('.page-code')).toContainText('404');
});

test('motion never hides content and reduced motion removes transforms', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/zh/');
  for (const selector of ['.discovery-hero', '.category-index', '.featured-directory', '.submission-strip']) {
    await expect(page.locator(selector)).toHaveCSS('opacity', '1');
    await expect(page.locator(selector)).toHaveCSS('transform', 'none');
  }
});
