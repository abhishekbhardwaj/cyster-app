import type { Page } from '@playwright/test'

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded')
  }

  async getTitle(): Promise<string> {
    return this.page.title()
  }
}
