# Turbo Full-Stack Monorepo

A production-ready boilerplate template for full-stack monorepo projects. Built with Turborepo, Bun, TypeScript, and Next.js — with shared tooling for linting, formatting, testing, and type-safe environment variables pre-configured.

## Project Structure

```
turbo-full-stack-monorepo/
├── apps/
│   └── web/                     # Next.js 16 web app (React 19)
├── packages/
│   ├── ui/                      # Shared React components (@repo/ui)
│   ├── env/                     # Type-safe env validation (@repo/env)
│   └── test-utils/              # Shared test utilities (@repo/test-utils)
├── tooling/
│   ├── eslint/                  # Shared ESLint config (@repo/eslint)
│   ├── prettier/                # Shared Prettier config (@repo/prettier)
│   ├── typescript/              # Shared TypeScript config (@repo/typescript)
│   └── vitest/                  # Shared Vitest config (@repo/vitest)
└── testing/
    └── e2e/                     # Playwright E2E tests (@repo/e2e)
        ├── web/                 # Web app E2E tests
        └── shared/              # Shared fixtures & page objects
```

## Getting Started

```bash
bun install
bun run dev
```

## Testing

### Architecture

- **Unit tests** — [Vitest](https://vitest.dev/), colocated with source code in each app/package
- **E2E tests** — [Playwright](https://playwright.dev/), centralized in `testing/e2e/`
- **Shared config** — `tooling/vitest/` provides reusable presets (`@repo/vitest/base`, `@repo/vitest/react`)
- **Shared utilities** — `packages/test-utils/` for factories, fixtures, custom matchers (`@repo/test-utils`)

### Running Tests

| Command                       | What it does                                    |
| ----------------------------- | ----------------------------------------------- |
| `bun run test`                | Run all unit tests via Turbo (cached, parallel) |
| `bun run test:e2e`            | Run all E2E tests via Turbo                     |
| `bun run test:e2e:report`     | Open combined E2E report                        |
| `bun run test:e2e:report:web` | Open web E2E report                             |

### Running Tests Per-App

```bash
# Unit tests (watch mode)
cd apps/web && vitest
cd packages/ui && vitest

# Unit tests (single run)
cd apps/web && vitest run
cd packages/ui && vitest run
```

## Verification Loop

Run these checks after every change. All must pass before a change is considered done.

```bash
bun run typecheck       # Type-check all workspaces
bun run lint            # Lint all workspaces
bun run format          # Check formatting (Prettier)
bun run format:fix      # Auto-fix formatting if check fails
bun run test            # Run unit tests (if tests exist for changed code)
bun run test:e2e        # Run E2E tests (if user-facing flows changed)
```

## Helpful Commands

| Command                           | What it does                      |
| --------------------------------- | --------------------------------- |
| `bun run dev`                     | Start all dev servers             |
| `bun run build`                   | Build all workspaces              |
| `bun run typecheck`               | Type-check all workspaces         |
| `bun run lint`                    | Lint all workspaces               |
| `bun run format`                  | Check formatting                  |
| `bun run format:fix`              | Auto-fix formatting               |
| `bun run test`                    | Run all unit tests                |
| `bun run test:e2e`                | Run all E2E tests                 |
| `bun run test:e2e:report`         | Open combined E2E report          |
| `bun run test:e2e:report:web`     | Open web E2E report               |
| `bun run commit`                  | Commitizen interactive commit     |
| `bun run update-all-dependencies` | Update all deps across workspaces |

See `AGENTS.md` for coding conventions, testing patterns, and detailed guides on writing tests.
