import { createESLintConfig } from '@repo/eslint/base'
import { defineConfig } from 'eslint/config'

export default defineConfig(
  createESLintConfig({ tsconfigRootDir: import.meta.dirname }),
  {
    ignores: ['setup-env.ts'],
  },
  {
    files: ['src/*.ts'],
    rules: {
      // Env schemas intentionally reference env vars — suppress turbo warning
      'turbo/no-undeclared-env-vars': 'off',
    },
  },
  {
    files: ['src/web.ts'],
    rules: {
      // Allow process.env in env config files (needed for runtimeEnv mapping)
      'no-restricted-properties': 'off',
      'no-restricted-imports': 'off',
      // But prevent passing process.env or import.meta.env DIRECTLY to runtimeEnv.
      // Next.js requires explicit per-var mapping for build-time inlining.
      'no-restricted-syntax': [
        'error',
        {
          selector: "Property[key.name='runtimeEnv'] > MemberExpression",
          message:
            'Do not pass process.env or import.meta.env directly to runtimeEnv. ' +
            'Next.js requires explicit per-var mapping (e.g., NEXT_PUBLIC_FOO: process.env.NEXT_PUBLIC_FOO) ' +
            'for build-time inlining to work.',
        },
      ],
    },
  },
  {
    // browser-extension.ts can use import.meta.env directly (Vite handles it)
    files: ['src/browser-extension.ts'],
    rules: {
      'no-restricted-properties': 'off',
      'no-restricted-imports': 'off',
    },
  },
  {
    // backend.ts passes process.env directly — no build-time inlining concern
    files: ['src/backend.ts'],
    rules: {
      'no-restricted-properties': 'off',
      'no-restricted-imports': 'off',
    },
  },
)
