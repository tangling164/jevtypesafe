// Local visual evidence; run after npm run build with the Cloudflare preview on 8787.
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';

const browser = await chromium.launch();
const measurements = [];
const routes = [['home', '/'], ['zh-home', '/zh/'], ['directory', '/projects/'], ['detail', '/projects/supercov/'], ['search', '/search/?ecosystem=jev_like'], ['submit', '/submit/'], ['sponsor', '/zh/sponsor/']];
try {
  for (const width of [375, 768, 1024, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: 1 });
    for (const [name, path] of routes) {
      await page.goto(`http://127.0.0.1:8787${path}`);
      if (name === 'search') await page.locator('#search-results li').first().waitFor();
      measurements.push({ width, path, ...await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        firstProjectY: document.querySelector('.project-row')?.getBoundingClientRect().top ?? null,
        font: getComputedStyle(document.body).fontFamily,
      })) });
      if (width === 375 || width === 1440) {
        await page.screenshot({ path: `reports/ui-review/after-${name}-${width}.png`, fullPage: true });
        if (name === 'home' || name === 'zh-home') await page.screenshot({ path: `reports/ui-review/viewport-${name}-${width}.png` });
      }
    }
    await page.close();
  }
  writeFileSync('reports/ui-review/measurements.json', JSON.stringify(measurements, null, 2) + '\n');
  if (measurements.some(row => row.overflow)) throw new Error('Horizontal overflow detected');
  console.log(`${measurements.length} page/viewport checks passed without horizontal overflow.`);
} finally {
  await browser.close();
}
