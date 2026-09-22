import { test, expect } from '@playwright/test';

test('static home is readable and does not overflow', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('unknown path returns a real 404', async ({ page }) => {
  const response = await page.goto('/missing-page-for-acceptance/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('Page not found');
});
