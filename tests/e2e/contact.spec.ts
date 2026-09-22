import { test, expect } from '@playwright/test';

test('submission form validates HTTPS and never claims it was sent', async ({ page }) => {
  await page.goto('/submit/?project=demo-project');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByLabel(/Project URL/i)).toHaveValue('');
  await expect(page.locator('[data-contact-output]')).toHaveValue(/demo-project/);
  const urlField = page.getByLabel(/Project URL/i);
  await urlField.fill('http://example.com');
  expect(await urlField.evaluate((el) => (el as HTMLInputElement).checkValidity())).toBe(false);
  await expect(page.locator('body')).not.toContainText(/submission (sent|successful)/i);
});

test('Chinese sponsorship page states the real commercial offer', async ({ page }) => {
  await page.goto('/zh/sponsor/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main')).toContainText('最多 3');
  await expect(page.locator('main')).toContainText('30 天');
  await expect(page.locator('main')).toContainText('英文和中文');
  await expect(page.locator('main')).not.toContainText(/立即购买|Buy now|付款成功/);
});

test('privacy copy reflects analytics configuration without claiming form storage', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main')).toContainText(/do not store contact form submissions/i);
  await expect(page.locator('main')).toContainText(/email service/i);
});
