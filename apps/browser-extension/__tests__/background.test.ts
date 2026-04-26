import { beforeEach, describe, expect, it } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

describe('background', () => {
  beforeEach(() => {
    fakeBrowser.reset()
  })

  it('should have a runtime id', () => {
    expect(fakeBrowser.runtime.id).toBeDefined()
  })

  it('should support storage operations', async () => {
    await fakeBrowser.storage.local.set({ key: 'value' })
    const result = await fakeBrowser.storage.local.get('key')
    expect(result).toEqual({ key: 'value' })
  })
})
