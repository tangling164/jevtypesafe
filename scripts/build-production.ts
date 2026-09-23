import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { verifyProductionSeo } from './verify-production-seo';

const npmCli = process.env.npm_execpath;
if (!npmCli)
  throw new Error('Run the production build through npm run build:production.');

const result = spawnSync(process.execPath, [npmCli, 'run', 'build'], {
  cwd: process.cwd(),
  env: { ...process.env, DEPLOY_ENV: 'production' },
  stdio: 'inherit',
});
if (result.status !== 0) process.exit(result.status ?? 1);

const site = JSON.parse(readFileSync('content/site.json', 'utf8')) as {
  site_url: string;
};
const summary = verifyProductionSeo(
  'dist',
  process.env.SITE_URL ?? site.site_url,
);
console.log(
  `Production build verified: ${summary.indexable} indexable pages and ${summary.noindex} noindex utility pages.`,
);
