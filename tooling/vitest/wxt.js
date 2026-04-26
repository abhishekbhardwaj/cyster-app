import { defineConfig, mergeConfig } from 'vitest/config'
import { WxtVitest } from 'wxt/testing/vitest-plugin'

import baseConfig from './base.js'

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [WxtVitest()],
  }),
)
