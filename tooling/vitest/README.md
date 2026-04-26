# @repo/vitest

Shared Vitest configuration presets for the monorepo.

## Presets

| Export               | Environment                 | Plugins                | Use for                                |
| -------------------- | --------------------------- | ---------------------- | -------------------------------------- |
| `@repo/vitest/base`  | `node` (default)            | None                   | Plain TS packages with no DOM          |
| `@repo/vitest/react` | `jsdom`                     | `@vitejs/plugin-react` | Next.js apps, React component packages |
| `@repo/vitest/wxt`   | `happy-dom` (via WxtVitest) | `WxtVitest()`          | WXT browser extension                  |

## Why different environments?

- **`jsdom`** is used for Next.js / React because it is the most widely supported and documented DOM implementation for testing React components. The Next.js testing docs recommend it.
- **`happy-dom`** is used for WXT because the `WxtVitest()` plugin from `wxt/testing/vitest-plugin` internally configures `happy-dom`. Using `jsdom` with `WxtVitest()` causes compatibility issues. Do not change this.

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

```ts
// apps/browser-extension/vitest.config.ts
import wxtConfig from '@repo/vitest/wxt'
import { defineConfig, mergeConfig } from 'vitest/config'

export default mergeConfig(
  wxtConfig,
  defineConfig({
    test: {
      // extension-specific overrides
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

### `wxt.js` (extends base)

- `WxtVitest()` plugin which:
  - Polyfills the `browser.*` extension API with an in-memory fake (`@webext-core/fake-browser`)
  - Applies Vite config and plugins from `wxt.config.ts`
  - Sets up WXT auto-imports
  - Configures `happy-dom` as the test environment

## Adding a new preset

1. Create a new `.js` file (Node ESM can't load `.ts` from workspace packages)
2. Import and extend `base.js` via `mergeConfig`
3. Add the export to `package.json` under `"exports"`
