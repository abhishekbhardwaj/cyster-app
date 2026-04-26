import { expect, test } from '../fixtures'

test('popup page renders with heading', async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/popup.html`)

  await expect(page.locator('h1')).toHaveText('WXT + React')
})

test('popup counter increments on click', async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/popup.html`)

  const button = page.getByRole('button', { name: /count is/ })

  await expect(button).toHaveText('count is 0')

  await button.click()
  await expect(button).toHaveText('count is 1')

  await button.click()
  await expect(button).toHaveText('count is 2')
})
