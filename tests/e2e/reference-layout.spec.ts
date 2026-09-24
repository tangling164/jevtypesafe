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

test('home follows a search-first directory hierarchy', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.discovery-hero .home-search')).toBeVisible();
  await expect(page.locator('.discovery-hero .hero-showcase')).toHaveCount(0);
  await expect(page.locator('.category-directory a')).toHaveCount(6);
  await expect(page.locator('.featured-directory .project-row')).toHaveCount(10);
  await expect(page.locator('.directory-summary')).toContainText('10');
});

test('directory, search, detail and info pages use the shared layout system', async ({ page }) => {
  await page.goto('/projects/');
  await expect(page.locator('.page-heading')).toContainText('Projects');
  await expect(page.locator('.directory-toolbar')).toBeVisible();
  await expect(page.locator('.project-list .project-row')).toHaveCount(10);

  await page.goto('/search/');
  await expect(page.locator('.search-layout')).toBeVisible();
  await expect(page.locator('.filter-panel')).toBeVisible();
  await expect(page.locator('#search-results .project-row')).toHaveCount(10);

  await page.goto('/projects/supercov/');
  await expect(page.locator('.detail-layout')).toBeVisible();
  await expect(page.locator('.detail-sidebar')).toContainText('License');

  await page.goto('/about/');
  await expect(page.locator('.info-page')).toBeVisible();
  await expect(page.locator('.info-aside')).toBeVisible();
});

test('motion never hides content and reduced motion removes transforms', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/zh/');
  for (const selector of ['.discovery-hero', '.category-directory', '.featured-directory', '.submission-strip']) {
    await expect(page.locator(selector)).toHaveCSS('opacity', '1');
    await expect(page.locator(selector)).toHaveCSS('transform', 'none');
  }
});
