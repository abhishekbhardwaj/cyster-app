import eslintReact from '@eslint-react/eslint-plugin'
import pluginNext from '@next/eslint-plugin-next'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import { defineConfig } from 'eslint/config'
import globals from 'globals'

import { createESLintConfig, restrictEnvAccess, type CreateESLintConfigOptions } from './base.ts'

/**
 * Creates ESLint configuration for Next.js apps.
 */
export function createNextJsConfig(options: CreateESLintConfigOptions) {
  return defineConfig(
    createESLintConfig(options),
    {
      ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
    },
    eslintReact.configs.recommended,
    pluginReactHooks.configs.flat.recommended,
    {
      languageOptions: {
        globals: {
          ...globals.serviceworker,
        },
      },
    },
    {
      plugins: {
        '@next/next': pluginNext,
      },
      rules: {
        ...pluginNext.configs.recommended.rules,
        ...pluginNext.configs['core-web-vitals'].rules,
      },
    },
    restrictEnvAccess,
  )
}
