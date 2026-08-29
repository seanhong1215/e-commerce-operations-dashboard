import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5180',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm.cmd run dev -- --host 127.0.0.1 --port 5180 --strictPort',
    url: 'http://127.0.0.1:5180',
    reuseExistingServer: true,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 834, height: 1194 } } },
    {
      name: 'demo',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        video: { mode: 'on', size: { width: 1440, height: 900 } },
        trace: 'off',
        screenshot: 'off',
      },
    },
  ],
})
