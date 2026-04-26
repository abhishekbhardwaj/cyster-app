import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import sonarjs from 'eslint-plugin-sonarjs'
import turboPlugin from 'eslint-plugin-turbo'
import unusedImports from 'eslint-plugin-unused-imports'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export interface CreateESLintConfigOptions {
  /** Pass `import.meta.dirname` — required so typescript-eslint finds the correct tsconfig. */
  tsconfigRootDir: string
}

/**
 * Creates the shared ESLint configuration for the repository.
 */
export function createESLintConfig({ tsconfigRootDir }: CreateESLintConfigOptions) {
  return defineConfig(
    includeIgnoreFile(path.join(__dirname, '../../.gitignore')),
    { ignores: ['**/*.config.*', 'dist/**'] },
    js.configs.recommended,
    tseslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
      files: ['**/*.js', '**/*.ts', '**/*.tsx'],
      plugins: {
        import: importPlugin,
        'unused-imports': unusedImports,
        turbo: turboPlugin,
      },
      rules: {
        'turbo/no-undeclared-env-vars': 'warn',

        // Unused imports
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
          'warn',
          {
            vars: 'all',
            varsIgnorePattern: '^_',
            args: 'after-used',
            argsIgnorePattern: '^_',
          },
        ],

        // Import style
        '@typescript-eslint/consistent-type-imports': [
          'warn',
          { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
        ],
        'import/consistent-type-specifier-style': ['error', 'prefer-inline'],

        // TypeScript strictness
        '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
        '@typescript-eslint/no-unnecessary-condition': ['error', { allowConstantLoopConditions: true }],
        '@typescript-eslint/no-non-null-assertion': 'error',

        // Style
        quotes: ['error', 'single', { avoidEscape: true }],
      },
    },
    {
      linterOptions: { reportUnusedDisableDirectives: true },
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
    },
    sonarjs.configs.recommended,
    eslintPluginPrettierRecommended,
    eslintConfigPrettier,
  )
}

/**
 * Rule set to restrict direct process.env access.
 * Use in apps that leverage t3-env or similar validated env.
 */
export const restrictEnvAccess = defineConfig({
  files: ['**/*.js', '**/*.ts', '**/*.tsx'],
  rules: {
    'no-restricted-properties': [
      'error',
      {
        object: 'process',
        property: 'env',
        message: "Use `import { env } from '@repo/env/*'` instead to ensure validated types.",
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        name: 'process',
        importNames: ['env'],
        message: "Use `import { env } from '@repo/env/*'` instead to ensure validated types.",
      },
    ],
  },
})
