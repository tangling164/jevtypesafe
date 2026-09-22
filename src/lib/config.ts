import { z } from 'zod';

const configSchema = z.object({
  SITE_URL: z.string().url().default('https://jevtypesafe.dev').refine((value) => {
    const url = new URL(value);
    return url.protocol === 'https:' && url.pathname === '/' && !url.search && !url.hash && !url.username && !url.password;
  }, 'SITE_URL must be an HTTPS origin'),
  SITE_NAME: z.string().trim().min(1).default('Jev Builds Directory'),
  CONTACT_EMAIL: z.union([z.literal(''), z.string().email()]).default(''),
  DEPLOY_ENV: z.enum(['preview', 'production']).default('preview'),
  COMMERCIAL_MODE: z.literal('off').default('off'),
  PUBLIC_WEB_ANALYTICS_TOKEN: z.union([z.literal(''), z.string().regex(/^[a-f0-9]{32}$/)]).default(''),
});

export function parseConfig(input: Record<string, unknown>) {
  return configSchema.parse(input);
}
