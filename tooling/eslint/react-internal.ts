import eslintReact from '@eslint-react/eslint-plugin'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import { defineConfig } from 'eslint/config'
import globals from 'globals'

import { createESLintConfig, type CreateESLintConfigOptions } from './base.ts'

/**
 * Creates ESLint configuration for internal React libraries.
 */
export function createReactInternalConfig(options: CreateESLintConfigOptions) {
  return defineConfig(
    createESLintConfig(options),
    eslintReact.configs.recommended,
    pluginReactHooks.configs.flat.recommended,
    {
      languageOptions: {
        globals: {
          ...globals.serviceworker,
          ...globals.browser,
        },
      },
    },
  )
}
