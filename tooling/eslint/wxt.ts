import eslintReact from '@eslint-react/eslint-plugin'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import { defineConfig } from 'eslint/config'
import globals from 'globals'

import { createESLintConfig, restrictEnvAccess, type CreateESLintConfigOptions } from './base.ts'

/**
 * Creates ESLint configuration for WXT browser extensions using React.
 */
export function createWxtConfig(options: CreateESLintConfigOptions) {
  return defineConfig(
    createESLintConfig(options),
    eslintReact.configs.recommended,
    pluginReactHooks.configs.flat.recommended,
    {
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.webextensions,
          ...globals.serviceworker,
        },
      },
    },
    {
      ignores: ['.wxt/**', '.output/**'],
    },
    restrictEnvAccess,
  )
}
