import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export type ProductionSeoSummary = {
  html: number;
  indexable: number;
  noindex: number;
  sitemapUrls: number;
};

function filesUnder(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

function attribute(
  html: string,
  selector: 'name' | 'property' | 'rel',
  key: string,
  value = 'content',
) {
  const tags = html.match(/<(?:meta|link)\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const attrs = Object.fromEntries(
      [...tag.matchAll(/([:\w-]+)\s*=\s*["']([^"']*)["']/g)].map((match) => [
        match[1]!.toLowerCase(),
        match[2]!,
      ]),
    );
    if (attrs[selector] === key) return attrs[value];
  }
  return undefined;
}

function alternates(html: string) {
  const result = new Map<string, string>();
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const attrs = Object.fromEntries(
      [...tag.matchAll(/([:\w-]+)\s*=\s*["']([^"']*)["']/g)].map((match) => [
        match[1]!.toLowerCase(),
        match[2]!,
      ]),
    );
    if (attrs.rel === 'alternate' && attrs.hreflang && attrs.href)
      result.set(attrs.hreflang, attrs.href);
  }
  return result;
}

function routeFor(root: string, file: string) {
  const path = relative(root, file).split(sep).join('/');
  if (path === 'index.html') return '/';
  if (path.endsWith('/index.html'))
    return `/${path.slice(0, -'index.html'.length)}`;
  return `/${path}`;
}

export function verifyProductionSeo(
  root = 'dist',
  expectedOrigin = 'https://jevtypesafe.dev',
): ProductionSeoSummary {
  if (!existsSync(root))
    throw new Error(`Production SEO check: missing build directory ${root}`);
  const origin = new URL(expectedOrigin).origin;
  if (origin !== expectedOrigin.replace(/\/$/, ''))
    throw new Error(
      `Production SEO check: expected an origin, received ${expectedOrigin}`,
    );
  const errors: string[] = [];
  const pages = filesUnder(root).filter((file) => file.endsWith('.html'));
  const indexedCanonicals = new Set<string>();
  const descriptions = new Map<string, string[]>();
  let noindex = 0;

  for (const file of pages) {
    const path = routeFor(root, file);
    const html = readFileSync(file, 'utf8');
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
    const h1 = html.match(/<h1\b[^>]*>/i);
    const description = attribute(html, 'name', 'description');
    const robots = attribute(html, 'name', 'robots');
    const canonical = attribute(html, 'rel', 'canonical', 'href');
    const expectedNoindex = path === '/404.html' || path.endsWith('/search/');

    if (!title) errors.push(`${path}: missing title`);
    if (!description) errors.push(`${path}: missing meta description`);
    if (!h1) errors.push(`${path}: missing h1`);
    if (!canonical?.startsWith(`${origin}/`))
      errors.push(`${path}: canonical must use ${origin}`);
    if (expectedNoindex) {
      noindex += 1;
      if (robots !== 'noindex,follow')
        errors.push(`${path}: expected noindex,follow`);
    } else {
      if (robots !== 'index,follow')
        errors.push(`${path}: production page must use index,follow`);
      if (canonical) indexedCanonicals.add(canonical);
      if (description)
        descriptions.set(description, [
          ...(descriptions.get(description) ?? []),
          path,
        ]);
      const hreflang = alternates(html);
      if (!hreflang.has('en') || !hreflang.has('x-default'))
        errors.push(`${path}: missing en or x-default hreflang alternate`);
      if (hreflang.get('x-default') !== hreflang.get('en'))
        errors.push(`${path}: x-default must point to the English alternate`);
      if (path.startsWith('/zh/') && !hreflang.has('zh-Hans'))
        errors.push(`${path}: missing zh-Hans hreflang alternate`);
    }

    for (const [selector, key] of [
      ['property', 'og:title'],
      ['property', 'og:description'],
      ['property', 'og:url'],
      ['property', 'og:image'],
      ['name', 'twitter:card'],
      ['name', 'twitter:image'],
    ] as const) {
      if (!attribute(html, selector, key))
        errors.push(`${path}: missing ${key}`);
    }
    if (attribute(html, 'name', 'twitter:card') !== 'summary_large_image')
      errors.push(`${path}: twitter:card must be summary_large_image`);
    if (canonical && attribute(html, 'property', 'og:url') !== canonical)
      errors.push(`${path}: og:url must match canonical`);
    if (
      attribute(html, 'property', 'og:image') !==
      `${origin}/images/jev-atlas-social.png`
    )
      errors.push(`${path}: og:image must use the production social image`);
  }

  for (const [description, paths] of descriptions)
    if (paths.length > 1)
      errors.push(
        `duplicate meta description on ${paths.join(', ')}: ${description}`,
      );
  if (!existsSync(join(root, 'images', 'jev-atlas-social.png')))
    errors.push('missing images/jev-atlas-social.png');

  const robotsPath = join(root, 'robots.txt');
  const robotsText = existsSync(robotsPath)
    ? readFileSync(robotsPath, 'utf8')
    : '';
  if (!/^Allow: \/$/m.test(robotsText) || /^Disallow: \/$/m.test(robotsText))
    errors.push('robots.txt must allow production crawling');
  if (!robotsText.includes(`Sitemap: ${origin}/sitemap.xml`))
    errors.push('robots.txt must reference the production sitemap');

  const sitemapPath = join(root, 'sitemap.xml');
  const sitemap = existsSync(sitemapPath)
    ? readFileSync(sitemapPath, 'utf8')
    : '';
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1]!,
  );
  if (new Set(sitemapUrls).size !== sitemapUrls.length)
    errors.push('sitemap.xml contains duplicate URLs');
  for (const url of sitemapUrls)
    if (!url.startsWith(`${origin}/`))
      errors.push(`sitemap.xml URL must use ${origin}: ${url}`);
  const sitemapSet = new Set(sitemapUrls);
  for (const canonical of indexedCanonicals)
    if (!sitemapSet.has(canonical))
      errors.push(`sitemap.xml is missing ${canonical}`);
  for (const url of sitemapSet)
    if (!indexedCanonicals.has(url))
      errors.push(`sitemap.xml includes a noindex or missing page: ${url}`);

  if (errors.length)
    throw new Error(`Production SEO check failed:\n- ${errors.join('\n- ')}`);
  return {
    html: pages.length,
    indexable: indexedCanonicals.size,
    noindex,
    sitemapUrls: sitemapUrls.length,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const summary = verifyProductionSeo(
    process.argv[2] ?? 'dist',
    process.env.SITE_URL ?? 'https://jevtypesafe.dev',
  );
  console.log(
    `Production SEO check passed: ${summary.html} HTML, ${summary.indexable} indexable, ${summary.noindex} noindex, ${summary.sitemapUrls} sitemap URLs.`,
  );
}
