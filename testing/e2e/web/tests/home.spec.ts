import { expect, test } from '@playwright/test'

test('homepage loads successfully', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.ok()).toBe(true)
})
