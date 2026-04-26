import { createWxtConfig } from '@repo/eslint/wxt'
import { defineConfig } from 'eslint/config'

import autoImports from './.wxt/eslint-auto-imports.mjs'

export default defineConfig(autoImports, createWxtConfig({ tsconfigRootDir: import.meta.dirname }))
