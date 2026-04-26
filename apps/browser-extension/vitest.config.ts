import wxtConfig from '@repo/vitest/wxt'
import { defineConfig, mergeConfig } from 'vitest/config'

export default mergeConfig(
  wxtConfig,
  defineConfig({
    test: {
      // browser-extension specific overrides
    },
  }),
)
