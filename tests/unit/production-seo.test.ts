import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { verifyProductionSeo } from '../../scripts/verify-production-seo';

const origin = 'https://jevtypesafe.dev';

function fixture(options: { preview?: boolean; omitSocial?: boolean } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'jev-seo-'));
  mkdirSync(join(root, 'search'), { recursive: true });
  mkdirSync(join(root, 'images'), { recursive: true });
  const social = options.omitSocial
    ? ''
    : `<meta property="og:image" content="${origin}/images/jev-atlas-social.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${origin}/images/jev-atlas-social.png">`;
  const page = (path: string, robots: string) =>
    `<!doctype html><html><head><title>Page · Jev Atlas</title><meta name="description" content="A distinct page description for ${path}."><meta name="robots" content="${robots}"><link rel="canonical" href="${origin}${path}"><link rel="alternate" hreflang="en" href="${origin}${path}"><link rel="alternate" hreflang="x-default" href="${origin}${path}"><meta property="og:title" content="Page · Jev Atlas"><meta property="og:description" content="A distinct page description for ${path}."><meta property="og:url" content="${origin}${path}">${social}</head><body><h1>Page</h1></body></html>`;

  writeFileSync(
    join(root, 'index.html'),
    page('/', options.preview ? 'noindex,follow' : 'index,follow'),
  );
  writeFileSync(
    join(root, 'search', 'index.html'),
    page('/search/', 'noindex,follow'),
  );
  writeFileSync(join(root, '404.html'), page('/404.html', 'noindex,follow'));
  writeFileSync(join(root, 'images', 'jev-atlas-social.png'), 'fixture');
  writeFileSync(
    join(root, 'robots.txt'),
    `User-agent: *\n${options.preview ? 'Disallow: /' : 'Allow: /'}\nSitemap: ${origin}/sitemap.xml\n`,
  );
  writeFileSync(
    join(root, 'sitemap.xml'),
    `<?xml version="1.0"?><urlset><url><loc>${origin}/</loc></url></urlset>`,
  );
  return root;
}

describe('production SEO release gate', () => {
  it('accepts a production build and reports indexed/noindex pages', () => {
    expect(verifyProductionSeo(fixture(), origin)).toMatchObject({
      html: 3,
      indexable: 1,
      noindex: 2,
      sitemapUrls: 1,
    });
  });

  it('rejects preview output before deployment', () => {
    expect(() =>
      verifyProductionSeo(fixture({ preview: true }), origin),
    ).toThrow(/production page.*index,follow|robots\.txt.*allow/i);
  });

  it('rejects an indexable page without social preview metadata', () => {
    expect(() =>
      verifyProductionSeo(fixture({ omitSocial: true }), origin),
    ).toThrow(/og:image|twitter:card/i);
  });
});
