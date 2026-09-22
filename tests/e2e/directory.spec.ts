import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';

// Expectations derive from the real published content so the suite tracks data changes.
const published = readdirSync('content/projects')
  .filter((name) => name.endsWith('.json'))
  .map((name) => JSON.parse(readFileSync(`content/projects/${name}`, 'utf8')) as { status: string; ecosystem: string; primary_category: string })
  .filter((project) => project.status === 'published');
const publishedCount = published.length;
const likeCount = published.filter((project) => project.ecosystem === 'jev_like').length;
const likeOrIntegrationCount = published.filter((project) => project.ecosystem === 'jev_like' || project.ecosystem === 'jev_integration').length;
const developerIntegrationCount = published.filter((project) => project.ecosystem === 'jev_integration' && project.primary_category === 'developer').length;

test('all published pages fit the viewport and have one H1', async ({ page, request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  const paths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => new URL(match[1]!).pathname);
  for (const path of [...paths, '/search/', '/zh/search/']) {
    await page.goto(path);
    await expect(page.locator('h1'), path).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), path).toBe(true);
  }
});

test('without JavaScript, directory, category and details stay reachable', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  try {
    await page.goto('/');
    await page.getByRole('link', { name: 'Browse projects', exact: true }).click();
    await expect(page.locator('main li')).toHaveCount(publishedCount);
    await page.locator('main h3 a').filter({ hasText: 'supercov' }).click();
    await expect(page.locator('h1')).toHaveText(/supercov/i);
    await expect(page.getByRole('heading', { name: 'Sources & verification' })).toBeVisible();
    await page.locator('#language-switch').click();
    await expect(page).toHaveURL(/\/zh\/projects\/supercov\//);
    await page.locator('article header a.badge').first().click();
    await expect(page.locator('main li')).not.toHaveCount(0);
    await page.goto('/search/');
    await expect(page.locator('noscript p')).toBeVisible();
    await expect(page.locator('noscript p')).toContainText('Search needs JavaScript');
  } finally { await context.close(); }
});

test('search filters, language switch and browser back restore the same state', async ({ page }) => {
  await page.goto('/search/?q=compaction');
  await expect(page.locator('#search-results li')).toHaveCount(1);
  await page.locator('#q').fill('');
  await expect(page.locator('#search-results li')).toHaveCount(publishedCount);
  await page.locator('#filters-panel summary').click();
  await page.locator('input[value="jev_like"]').check();
  await expect(page.locator('#search-results li')).toHaveCount(likeCount);
  await page.locator('input[value="jev_integration"]').check();
  await expect(page.locator('#search-results li')).toHaveCount(likeOrIntegrationCount);
  await page.locator('input[value="developer"]').check();
  await expect(page.locator('#search-results li')).toHaveCount(developerIntegrationCount);
  await page.locator('#close-filters').click();
  await expect(page.locator('#filters-panel summary')).toBeFocused();
  await page.locator('#language-switch').click();
  await expect(page).toHaveURL(/\/zh\/search\/\?.*category=developer/);
  await expect(page.locator('#search-results li')).toHaveCount(developerIntegrationCount);
  await page.locator('#search-results a').first().click();
  await page.goBack();
  await expect(page.locator('#search-results li')).toHaveCount(developerIntegrationCount);
  await expect(page.locator('input[value="developer"]')).toBeChecked();
  await page.locator('#clear-filters').click();
  await expect(page.locator('#search-results li')).toHaveCount(publishedCount);
  await page.goBack();
  await expect(page.locator('#search-results li')).toHaveCount(developerIntegrationCount);
});

test('failed index can retry and malformed rows show the failure state', async ({ page }) => {
  let broken = true;
  await page.route('**/search-index/*.json', async route => {
    if(broken) await route.fulfill({ json: { schema_version:1, locale:'en', projects:[{name:'Broken',summary:'Invalid tags',tags:[null],href:'/projects/broken/'}] } });
    else await route.continue();
  });
  await page.goto('/search/?q=missing');
  await expect(page.locator('#retry-search')).toBeVisible();
  broken = false;
  await page.locator('#retry-search').click();
  await expect(page.locator('#search-status')).toContainText('No matching projects');
  await page.locator('#clear-filters').click();
  await expect(page.locator('#search-results li')).toHaveCount(publishedCount);
});

test('copy succeeds or exposes selectable text on clipboard failure', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto('/submit/?project=github-1343957927');
  await page.locator('input[name="url"]').fill('https://github.com/supercorp-ai/supercov');
  await page.locator('[data-copy]').click();
  await expect(page.locator('[data-contact-status]')).toContainText('Copied.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('github-1343957927');
  await page.evaluate(() => Object.defineProperty(navigator.clipboard, 'writeText', { value: async () => { throw new Error('Denied'); } }));
  await page.locator('[data-copy]').click();
  await expect(page.locator('[data-contact-status]')).toContainText('Could not copy');
  await expect(page.locator('[data-contact-output]')).toBeFocused();
  expect(await page.locator('[data-contact-output]').evaluate((element: HTMLTextAreaElement) => element.selectionEnd-element.selectionStart)).toBeGreaterThan(0);
});

test('keyboard skip and reduced-motion remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion:'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  expect(await page.locator('.skip-link').evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
  const transitions = await page.locator('main article').evaluateAll(elements => elements.map(element => getComputedStyle(element).transitionDuration));
  expect(transitions.every(duration => duration==='0s')).toBe(true);
});
