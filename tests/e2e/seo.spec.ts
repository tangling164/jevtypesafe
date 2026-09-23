import {test,expect} from '@playwright/test';

test('manifest metadata covers every published route and list JSON-LD matches HTML',async({page,request})=>{
  test.setTimeout(90_000);
  const xml=await (await request.get('/sitemap.xml')).text();
  const urls=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>match[1]!);
  expect(urls).not.toContain('https://jevtypesafe.dev/search/');
  expect(urls).not.toContain('https://jevtypesafe.dev/zh/search/');
  for(const url of urls){
    await page.goto(new URL(url).pathname);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',url);
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex,follow');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content','https://jevtypesafe.dev/images/jev-atlas-social.png');
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content','summary_large_image');
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content','https://jevtypesafe.dev/images/jev-atlas-social.png');
    const en=await page.locator('link[hreflang=en]').getAttribute('href');
    await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute('href',en!);
    const json=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent()??'{}');
    expect(json['@graph'][0].url).toBe(url);
    if(json['@graph'][0].mainEntity){
      const names=await page.locator('main li article h3').allTextContents();
      expect(json['@graph'][0].mainEntity.itemListElement.map((item:{name:string})=>item.name)).toEqual(names);
    }
  }
  const socialImage=await request.get('/images/jev-atlas-social.png');
  expect(socialImage.ok()).toBe(true);
  expect(socialImage.headers()['content-type']).toBe('image/png');
});

test('capture local acceptance screenshots',async({page},info)=>{
  for(const [name,path] of [['home','/'],['zh-home','/zh/'],['detail','/projects/supercov/'],['search','/search/?ecosystem=jev_like']] as const){
    await page.goto(path);
    if(name==='search')await expect(page.locator('#search-results li')).toHaveCount(1);
    await page.screenshot({path:`reports/acceptance/screenshots/EV-002-${name}-${info.project.name}.png`,fullPage:true});
  }
});
