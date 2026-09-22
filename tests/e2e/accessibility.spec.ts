import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync, readdirSync } from 'node:fs';

const publishedCount = readdirSync('content/projects')
  .filter((name) => name.endsWith('.json'))
  .map((name) => JSON.parse(readFileSync(`content/projects/${name}`, 'utf8')) as { status: string })
  .filter((project) => project.status === 'published').length;

test('representative pages meet automated WCAG AA checks',async({page})=>{
  test.setTimeout(90_000);
  for(const path of ['/','/zh/','/projects/','/projects/supercov/','/search/','/submit/','/zh/sponsor/','/privacy/','/missing-acceptance/']){
    await page.goto(path);
    if(path==='/search/')await expect(page.locator('#search-results li')).toHaveCount(publishedCount);
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    expect(result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),path).toEqual([]);
  }
});

test('standalone touch controls are at least 44px',async({page})=>{
  for(const path of ['/','/projects/supercov/','/search/','/submit/']){
    await page.goto(path);
    const undersized=await page.locator('.button, nav a, summary, article header a.badge').evaluateAll(elements=>elements.filter(e=>e.getClientRects().length).map(e=>({text:e.textContent?.trim(),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})).filter(size=>size.height<44||size.width<44));
    expect(undersized,path).toEqual([]);
  }
});
