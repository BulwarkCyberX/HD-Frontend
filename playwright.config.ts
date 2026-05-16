import { defineConfig, devices } from '@playwright/test';

const webBase = process.env.PLAYWRIGHT_WEB_URL ?? 'http://localhost:3000';
const apiBase = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:4000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: webBase,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.PLAYWRIGHT_SKIP_WEB_SERVER
    ? undefined
    : [
        {
          command: 'npm run dev',
          url: webBase,
          reuseExistingServer: true,
          timeout: 120_000,
        },
      ],
  metadata: { apiBase },
});
