import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const outputDirectory = dirname(fileURLToPath(import.meta.url));
const baseUrl = process.env.PREVIEW_URL ?? 'http://127.0.0.1:8787';
const paths = ['/', '/projects/', '/search/', '/projects/supercov/', '/about/', '/zh/'];
const widths = [375, 768, 1440];
const measurements = [];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch();

try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    for (const path of paths) {
      await page.goto(new URL(path, baseUrl).href, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      if (path === '/search/') await page.locator('#search-results li').first().waitFor();

      const name = `${path === '/' ? 'home' : path.replace(/^\//, '').replace(/\/$/, '').replaceAll('/', '-')}-${width}.png`;
      const screenshot = join(outputDirectory, name);
      const metrics = await page.evaluate(() => {
        const documentWidth = document.documentElement.scrollWidth;
        const controls = [...document.querySelectorAll('.button, nav a, summary, article header a.badge')]
          .filter((element) => element.getClientRects().length > 0)
          .map((element) => {
            const bounds = element.getBoundingClientRect();
            return { text: element.textContent?.trim() ?? '', width: Math.round(bounds.width), height: Math.round(bounds.height) };
          })
          .filter((control) => control.width < 44 || control.height < 44);
        return { documentWidth, h1Count: document.querySelectorAll('h1').length, undersizedControls: controls };
      });
      await page.screenshot({ path: screenshot, fullPage: true });
      measurements.push({ path, width, ...metrics, overflow: metrics.documentWidth > width, screenshot: name });
    }
    await page.close();
  }
} finally {
  await browser.close();
}

await writeFile(join(outputDirectory, 'measurements.json'), `${JSON.stringify(measurements, null, 2)}\n`);
console.log(`Captured ${measurements.length} route/viewports with ${measurements.filter((item) => item.overflow).length} overflow findings.`);
