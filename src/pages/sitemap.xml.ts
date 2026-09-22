import {manifest,config} from '../lib/site';
const xml=(value:string)=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
export function GET(){
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${manifest.filter(r=>r.indexable).map(r=>`<url><loc>${xml(new URL(r.path,config.SITE_URL).href)}</loc>${r.lastmod?`<lastmod>${r.lastmod}</lastmod>`:''}</url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml'}});
}
