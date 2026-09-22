import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:8787', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone SE'], viewport: {width:375,height:812}, deviceScaleFactor:1, defaultBrowserType: 'chromium' } },
  ],
  webServer: { command: 'npm run preview:cloudflare', url: 'http://127.0.0.1:8787', reuseExistingServer: !process.env.CI, timeout: 120_000 },
});
