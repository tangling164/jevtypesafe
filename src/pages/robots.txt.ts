import {config} from '../lib/site';
export function GET(){return new Response(`User-agent: *\n${config.DEPLOY_ENV==='production'?'Allow: /':'Disallow: /'}\nSitemap: ${config.SITE_URL}/sitemap.xml\n`,{headers:{'Content-Type':'text/plain'}});}
