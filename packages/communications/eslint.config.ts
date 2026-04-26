import { createESLintConfig } from '@repo/eslint/base'
import { defineConfig } from 'eslint/config'

export default defineConfig(createESLintConfig({ tsconfigRootDir: import.meta.dirname }))
