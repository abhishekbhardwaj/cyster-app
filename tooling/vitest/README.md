# @repo/vitest

Shared Vitest configuration presets for the monorepo.

## Presets

| Export               | Environment      | Plugins                | Use for                                |
| -------------------- | ---------------- | ---------------------- | -------------------------------------- |
| `@repo/vitest/base`  | `node` (default) | None                   | Plain TS packages with no DOM          |
| `@repo/vitest/react` | `jsdom`          | `@vitejs/plugin-react` | Next.js apps, React component packages |

## Why `jsdom` for React?

`jsdom` is the most widely supported and documented DOM implementation for testing React components. The Next.js testing docs recommend it.

## Usage

Each app or package creates its own `vitest.config.ts` that extends one of these presets:

```ts
// apps/web/vitest.config.ts
import reactConfig from '@repo/vitest/react'
import { defineConfig, mergeConfig } from 'vitest/config'

export default mergeConfig(
  reactConfig,
  defineConfig({
    test: {
      // app-specific overrides
    },
  }),
)
```

## What each preset provides

### `base.js`

- `globals: true` — `describe`, `test`, `expect`, etc. available without importing
- `passWithNoTests: true` — CI won't fail on packages with no tests yet
- `include: **/*.{test,spec}.{ts,tsx}`
- Coverage via `@vitest/coverage-v8`

### `react.js` (extends base)

- `@vitejs/plugin-react` for JSX transform and fast refresh
- `resolve.tsconfigPaths: true` for native Vite 8 monorepo path alias resolution
- `jsdom` test environment
- `@testing-library/react` auto-cleanup works via globals
- `@testing-library/react` and `@testing-library/dom` available for component tests

## Adding a new preset

1. Create a new `.js` file (Node ESM can't load `.ts` from workspace packages)
2. Import and extend `base.js` via `mergeConfig`
3. Add the export to `package.json` under `"exports"`
