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
