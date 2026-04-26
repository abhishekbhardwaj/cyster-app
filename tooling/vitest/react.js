import react from '@vitejs/plugin-react'
import { defineConfig, mergeConfig } from 'vitest/config'

import baseConfig from './base.js'

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [react()],
    resolve: {
      tsconfigPaths: true,
    },
    test: {
      environment: 'jsdom',
    },
  }),
)
