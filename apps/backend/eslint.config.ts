import { createESLintConfig, restrictEnvAccess } from '@repo/eslint/base'
import { defineConfig } from 'eslint/config'

export default defineConfig(createESLintConfig({ tsconfigRootDir: import.meta.dirname }), restrictEnvAccess, {
  files: ['tests/**/*.ts'],
  rules: {
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
})
