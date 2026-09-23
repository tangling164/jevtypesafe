import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('reports/jev-atlas-header', { recursive: true });
const browser = await chromium.launch();
const results = [];

for (const width of [375, 1440]) {
  for (const [locale, path] of [['en', '/'], ['zh', '/zh/']]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(`http://127.0.0.1:4322${path}`);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(700);

    const result = await page.evaluate(() => {
      const header = document.querySelector('.site-header').getBoundingClientRect();
      const hero = document.querySelector('.discovery-hero').getBoundingClientRect();
      const eyebrow = document.querySelector('.hero-copy .eyebrow').getBoundingClientRect();
      return {
        brand: document.querySelector('.site-brand').textContent.replace(/\s+/g, ' ').trim(),
        title: document.title,
        headerToHero: Math.round(hero.top - header.bottom),
        headerToFirstCopy: Math.round(eyebrow.top - header.bottom),
        overflow: document.documentElement.scrollWidth > innerWidth,
        devToolbarCount: document.querySelectorAll('astro-dev-toolbar').length,
      };
    });

    assert.equal(result.brand, 'Jev Atlas');
    assert.match(result.title, /· Jev Atlas$/);
    assert.equal(result.headerToHero, 0);
    assert.equal(result.overflow, false);
    assert.equal(result.devToolbarCount, 0);

    await page.screenshot({ path: `reports/jev-atlas-header/${locale}-${width}.png` });
    await page.locator('#language-switch').click();
    assert.equal(page.url().includes('/zh/'), locale === 'en');
    results.push({ width, locale, ...result, languageSwitch: 'passed' });
    await page.close();
  }
}

await browser.close();
await writeFile('reports/jev-atlas-header/results.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
