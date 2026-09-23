import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
await mkdir('reports/header-review',{recursive:true});
const browser=await chromium.launch();
const results=[];
for(const width of [375,1440]) for(const locale of ['en','zh']){
 const page=await browser.newPage({viewport:{width,height:900}});
 await page.goto('http://127.0.0.1:4321/'+(locale==='zh'?'zh/':''));
 await page.evaluate(()=>document.fonts.ready);
 const facts=await page.evaluate(()=>{
 const nav=document.querySelector('.site-nav');
 const boxes=[...nav.querySelectorAll(':scope > a, summary')].map(el=>{const r=el.getBoundingClientRect();return r.y+r.height/2;});
 return {centers:boxes,overflow:document.documentElement.scrollWidth>innerWidth,bar:!!document.querySelector('.utility-bar'),arrow:getComputedStyle(nav.querySelector('summary'),'::after').content,images:[...document.querySelectorAll('header img')].every(i=>i.complete&&i.naturalWidth>0)};
 });
 assert(Math.max(...facts.centers)-Math.min(...facts.centers)<1);assert(!facts.overflow&&!facts.bar&&facts.images);assert(['none','normal'].includes(facts.arrow));
 await page.screenshot({path:`reports/header-review/${locale}-${width}.png`});
 const summary=page.locator('.site-nav summary');await summary.focus();await page.keyboard.press('Enter');
 const last=page.locator('.site-nav details a').last();await last.click();assert(page.url().includes('/categories/'));
 await page.locator('#language-switch').click();assert(page.url().includes('/zh/')===(locale==='en'));
 for(const asset of ['/favicon-32.png','/favicon-192.png','/apple-touch-icon.png']){const response=await page.request.get('http://127.0.0.1:4321'+asset);assert(response.status()===200);assert(response.headers()['content-type'].includes('image/png'));}
 results.push({width,locale,...facts,menuAndLanguage:'passed',favicons:'passed'});await page.close();
}
await browser.close();await writeFile('reports/header-review/results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
