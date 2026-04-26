import reactConfig from '@repo/vitest/react'
import { defineConfig, mergeConfig } from 'vitest/config'

export default mergeConfig(
  reactConfig,
  defineConfig({
    test: {
      // web app specific overrides
    },
  }),
)
