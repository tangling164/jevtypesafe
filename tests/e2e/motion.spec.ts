import { test, expect } from '@playwright/test';

test('entrance motion runs, reveals new cards on scroll, and stops when preference changes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const original = Element.prototype.animate;
    Object.assign(window, { revealCalls: 0 });
    Element.prototype.animate = function (...args) {
      if (this.hasAttribute('data-reveal')) {
        const state = window as unknown as { revealCalls: number };
        state.revealCalls++;
      }
      return original.apply(this, args);
    };
  });
  await page.goto('/');
  expect(await page.locator('h1').evaluate(el => getComputedStyle(el).animationName)).not.toBe('none');
  const calls = () => page.evaluate(() => (window as unknown as { revealCalls: number }).revealCalls);
  const initial = await calls();
  const last = page.locator('.project-collection .project-list > li').last();
  await last.scrollIntoViewIfNeeded();
  await expect.poll(calls).toBeGreaterThan(initial);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length)).toBe(0);
  await expect(last).toHaveCSS('opacity', '1');
  await expect(last).toHaveCSS('transform', 'none');
});

test('reduced motion keeps content visible and disables hover movement', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/zh/');
  await expect(page.locator('h1')).toHaveCSS('animation-name', 'none');
  const card = page.locator('.project-collection .project-row').last();
  await card.scrollIntoViewIfNeeded();
  await card.hover();
  await expect(card).toHaveCSS('transform', 'none');
  await expect(card).toHaveCSS('opacity', '1');
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test('precision interactions stay restrained and project rows do not shift', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/projects/');
  const row = page.locator('.project-row').first();
  await row.hover();
  expect(await row.evaluate((element) => getComputedStyle(element).transform)).toBe('none');
  const durations = await row.evaluate((element) => getComputedStyle(element).transitionDuration.split(',').map((value) => Number.parseFloat(value) * 1000));
  expect(durations.every((duration) => duration >= 120 && duration <= 240)).toBe(true);
  await page.goto('/');
  const heroDuration = await page.locator('.hero-primary h1').evaluate((element) => Number.parseFloat(getComputedStyle(element).animationDuration) * 1000);
  expect(heroDuration).toBeGreaterThanOrEqual(120);
  expect(heroDuration).toBeLessThanOrEqual(240);
});
