import { loadContent } from './content';
import { parseConfig } from './config';
import { buildManifest } from './routes';

export const content = loadContent();
export const config = parseConfig({ SITE_URL: content.site.site_url, SITE_NAME: content.site.name, CONTACT_EMAIL: content.site.contact_email ?? '', ...import.meta.env, ...process.env });
export const manifest = buildManifest(content.projects,content.categories);
