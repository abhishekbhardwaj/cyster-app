import { defineConfig } from '@playwright/test'

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
      name: 'chromium-extension',
      use: {
        browserName: 'chromium',
      },
    },
  ],

  // No webServer — extension tests use launchPersistentContext via fixtures.
  // The extension must be pre-built: bun run --filter=browser-extension build
})
