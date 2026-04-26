import path from 'path'
import { fileURLToPath } from 'url'

import { test as base, chromium, type BrowserContext } from '@playwright/test'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// WXT builds the extension to .output/chrome-mv3
const pathToExtension = path.resolve(__dirname, '../../../../apps/browser-extension/.output/chrome-mv3')

export const test = base.extend<{
  context: BrowserContext
  extensionId: string
}>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [`--disable-extensions-except=${pathToExtension}`, `--load-extension=${pathToExtension}`],
    })
    await use(context)
    await context.close()
  },

  extensionId: async ({ context }, use) => {
    let background = context.serviceWorkers()[0]
    if (!background) background = await context.waitForEvent('serviceworker')
    const extensionId = background.url().split('/')[2]!
    await use(extensionId)
  },
})

export const expect = test.expect
