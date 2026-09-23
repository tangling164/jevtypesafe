import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const mark = readFileSync(resolve('public/images/jev-mark-tech.png')).toString(
  'base64',
);
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});

await page.setContent(`<!doctype html>
<html><head><style>
*{box-sizing:border-box}html,body{margin:0;width:1200px;height:630px;overflow:hidden}body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:#f4f7f5;background:#07100f}
.card{position:relative;width:100%;height:100%;padding:72px 78px;display:flex;flex-direction:column;justify-content:space-between;background:radial-gradient(circle at 82% 18%,rgba(49,217,202,.2),transparent 30%),radial-gradient(circle at 18% 86%,rgba(235,120,176,.14),transparent 32%),linear-gradient(135deg,#07100f 0%,#0c1816 58%,#07110f 100%)}
.grid{position:absolute;inset:0;opacity:.18;background-image:linear-gradient(rgba(166,220,207,.14) 1px,transparent 1px),linear-gradient(90deg,rgba(166,220,207,.14) 1px,transparent 1px);background-size:48px 48px;mask-image:linear-gradient(to right,black,transparent 78%)}
.line{position:absolute;height:1px;background:linear-gradient(90deg,transparent,#51dec9,transparent);transform-origin:left center;opacity:.65}.l1{width:510px;right:-45px;top:255px;transform:rotate(-22deg)}.l2{width:360px;right:30px;top:390px;transform:rotate(17deg)}
.node{position:absolute;width:10px;height:10px;border-radius:50%;background:#7df1de;box-shadow:0 0 24px #55dcc9}.n1{right:150px;top:190px}.n2{right:285px;top:350px}.n3{right:72px;top:430px;background:#ef92bd;box-shadow:0 0 24px #ef92bd}
.brand{position:relative;display:flex;align-items:center;gap:22px;font-weight:700;font-size:34px;letter-spacing:-.03em}.brand img{width:64px;height:64px;border-radius:15px;box-shadow:0 0 36px rgba(73,224,204,.2)}.brand span span{color:#87e9d9}
.copy{position:relative;max-width:840px}.eyebrow{margin:0 0 18px;color:#8ce8d8;font-size:18px;font-weight:700;letter-spacing:.13em;text-transform:uppercase}.copy h1{margin:0;font-size:72px;line-height:1.02;letter-spacing:-.055em}.copy p{margin:22px 0 0;max-width:720px;color:#b8c7c3;font-size:26px;line-height:1.42}
.footer{position:relative;display:flex;gap:12px}.chip{border:1px solid rgba(148,208,193,.25);border-radius:999px;background:rgba(10,27,24,.74);padding:10px 17px;color:#cad7d3;font-size:16px}
</style></head><body><main class="card"><div class="grid"></div><div class="line l1"></div><div class="line l2"></div><i class="node n1"></i><i class="node n2"></i><i class="node n3"></i><div class="brand"><img src="data:image/png;base64,${mark}" alt=""><span>Jev <span>Atlas</span></span></div><section class="copy"><p class="eyebrow">Independent project directory</p><h1>Discover what people build with Jev.</h1><p>Source-reviewed projects, real use cases, and practical requirements in English and 简体中文.</p></section><div class="footer"><span class="chip">Source checked</span><span class="chip">Open-source status</span><span class="chip">Bilingual directory</span></div></main></body></html>`);

await page.screenshot({
  path: resolve('public/images/jev-atlas-social.png'),
  type: 'png',
});
await browser.close();
console.log('Generated public/images/jev-atlas-social.png (1200×630).');
