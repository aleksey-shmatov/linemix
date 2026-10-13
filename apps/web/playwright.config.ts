import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',

  // One worker: the tests share one local Postgres.
  fullyParallel: false,
  workers: 1,

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',

  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  globalSetup: './tests/e2e/global-setup.ts',

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: {
    // Build, not dev: StrictMode double-invokes effects and churns the
    // Realtime channel subscription in a way production never does.
    command: `pnpm build && PORT=${PORT} pnpm start`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
