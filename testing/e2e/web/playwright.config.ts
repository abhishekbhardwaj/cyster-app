import { defineConfig, devices } from '@playwright/test'

import { baseConfig } from '../playwright.config'

export default defineConfig({
  ...baseConfig,
  testDir: './tests',
  outputDir: './test-results',
  reporter: process.env.CI
    ? [['html', { open: 'never', outputFolder: './playwright-report' }], ['github']]
    : [['html', { open: 'on-failure', outputFolder: './playwright-report' }]],

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  use: {
    ...baseConfig.use,
    baseURL: 'http://localhost:3000',
  },

  webServer: {
    command: 'bun run --filter=web dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
