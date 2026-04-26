# AGENTS.md

## Project Overview

Stack: urborepo monorepo, Bun 1.3.10, TypeScript 5.9.3.

| Workspace                | Stack                           | Purpose                                                          |
| ------------------------ | ------------------------------- | ---------------------------------------------------------------- |
| `apps/web`               | Next.js 16, React 19, port 3000 | Web application                                                  |
| `apps/browser-extension` | WXT 0.20.18, React, Chrome MV3  | Browser extension                                                |
| `packages/ui`            | React 19 (`@repo/ui`)           | Shared components                                                |
| `packages/env`           | (`@repo/env`)                   | Type-safe env validation (`./web`, `./browser-extension`)        |
| `packages/test-utils`    | (`@repo/test-utils`)            | Shared test utilities                                            |
| `tooling/eslint`         | ESLint 10 (`@repo/eslint`)      | Lint configs: `./base`, `./next-js`, `./react-internal`, `./wxt` |
| `tooling/prettier`       | Prettier 3.8 (`@repo/prettier`) | Format config                                                    |
| `tooling/typescript`     | TS 5.9 (`@repo/typescript`)     | TS configs                                                       |
| `tooling/vitest`         | Vitest 4 (`@repo/vitest`)       | Test configs: `./base`, `./react`, `./wxt`                       |
| `testing/e2e`            | Playwright 1.58 (`@repo/e2e`)   | E2E tests for web + extension                                    |

**Package manager: Bun.** Use `bun` for all install/run/add commands. Never use npm/yarn/pnpm.

### Workspace-Specific References

- **Backend** (`apps/backend/`): [docs/backend/agents.md](docs/backend/agents.md) — import aliases, file locations, code patterns, env vars, common operations
- **Database** (`packages/database/`): [docs/database.md](docs/database.md) — Prisma schema, migrations, client initialization
- **Communications** (`packages/communications/`): [docs/communications.md](docs/communications.md) — email templates, sending, SMTP configuration

---

## General Philosophy

### Compounding Engineering

Each unit of engineering work should make subsequent units of work easier — not harder.

Traditional development accumulates technical debt. Every feature adds complexity. Every change increases maintenance burden. The codebase becomes harder to work with over time.

Compounding engineering inverts this. Think of every piece of work as a **seed**:

- A well-designed component is a seed that grows into a library.
- A clear naming convention is a seed that grows into self-documenting code.
- A shared config is a seed that grows into zero-config onboarding.
- A good test is a seed that grows into fearless refactoring.
- A reusable pattern is a seed that grows into exponential velocity.

**The compounding question:** Before writing anything, ask: _"Will this make the next person's job easier or harder?"_ If harder — rethink the approach.

### The Seeds Principle

Start small. Build foundations that multiply.

**Seed → Sapling → Tree:**

1. **Seed** — Write a utility function with a clear interface and good types. Colocate it properly.
2. **Sapling** — The second consumer appears. The function already lives in the right place. Zero refactoring needed.
3. **Tree** — The pattern is established. New engineers discover it naturally. The codebase teaches itself.

**Anti-pattern: Scattered seeds.** Inline helpers, copy-pasted logic, ad-hoc patterns — these are seeds thrown on concrete. They don't grow. They rot.

**The goal:** Every file you touch should be slightly better than you found it. Not through heroic refactors, but through small, intentional choices that compound.

### Research First, Code Second

Before writing anything non-trivial, **research first**. Use context7 or exa to pull up-to-date documentation, best practices, and examples. Don't rely on stale training data — verify against current docs.

Before offering a hand-rolled solution, **find an existing library**. Prefer well-built, well-maintained, widely-used packages over custom implementations. Check download counts, maintenance activity, and community adoption. A battle-tested library with 10M weekly downloads is almost always better than a bespoke utility — even if it does slightly more than you need.

- Research the problem space before proposing a solution.
- Check if a library already solves it. If it does and it's well-maintained — use it.
- Only hand-roll when no suitable library exists, or when the library would add disproportionate complexity.
- When using a library, read its current docs (via context7) — don't guess at APIs.

### Maximum Output, Minimum Code

Write the least code that delivers the most value. Fewer files, fewer lines, fewer abstractions — unless more are justified.

- Don't scaffold what you won't use. Don't abstract what has one consumer.
- Prefer a single well-designed file over five thin ones.
- Every file, function, and line should earn its existence.
- If you can do it in 10 lines, don't write 50.
- Leverage existing tooling, conventions, and frameworks to their fullest before writing custom code.

### Slow is Fast

Prioritize reasoning quality, architecture, and long-term maintainability over short-term speed. Get it right the first time. A 30-minute solution that compounds is worth more than a 5-minute hack that costs 3 hours next month.

### Brutal Honesty

Be brutally honest. Don't be a yes-man.

- If the user is wrong, say so directly and explain why.
- If a proposed solution is bad, say so and offer a better one.
- Don't agree with something just because the user said it. Challenge flawed assumptions.

### No Gaslighting

If you're uncertain, admit it. Never bullshit.

- If you don't know something, say "I don't know."
- If unsure about an API or library behavior, research it first.
- When you make a mistake, own it immediately.

---

## Task Approach

### Classify Before Starting

- **Trivial** (<10 lines, single-file): Execute directly.
- **Moderate** (single-file logic, local refactoring): Brief plan, then execute.
- **Complex** (cross-module, architectural): Full plan with trade-offs before any code.

### For Complex Tasks: Plan Before Code

1. Analyze top-down, identify root cause.
2. Propose 1-3 solutions with trade-offs.
3. Implement only after alignment.
4. Provide minimal, reviewable changes with clear verification steps.

### Critical Rules

- **Read before suggesting.** Always read and understand relevant code before proposing changes.
- **When told to proceed, proceed.** Don't re-explain or re-confirm.
- **Assume a senior engineer.** No basic explanations. Cut to the chase.
- **Default to action over inquiry.** Make reasonable assumptions. Only ask when missing info would fundamentally change the approach.

---

## Verification Feedback Loop

**Every change must pass through this feedback loop before it's considered done.** This is non-negotiable. Don't skip steps. Don't assume it works — prove it.

### Required (every change)

Run these in order after every code change:

```bash
bun run typecheck        # Type-check all workspaces (turbo run typecheck)
bun run lint             # Lint all workspaces (turbo run lint)
bun run format           # Check formatting (prettier --check) — always use this to verify
bun run format:fix       # Auto-fix formatting (prettier --write) — run if format fails
```

### If tests exist for the changed code

```bash
bun run test             # Run unit tests across all workspaces (turbo run test, Vitest)
```

### If E2E-relevant changes were made

```bash
bun run test:e2e                    # Run all E2E tests (turbo run e2e, Playwright)
bun run test:e2e:report             # View all E2E reports
bun run test:e2e:report:web         # View web E2E report only
bun run test:e2e:report:extension   # View extension E2E report only
```

### The loop

1. Make the change.
2. Run `bun run typecheck`. Fix any type errors.
3. Run `bun run lint`. Fix any lint errors.
4. Run `bun run format`. If it fails, run `bun run format:fix`, then re-run `bun run format` to confirm.
5. Run `bun run test` if tests exist for the changed code. Fix any failures.
6. Run `bun run test:e2e` if the change affects user-facing flows. Fix any failures.
7. **Only when all steps pass is the change done.**

If a step fails, fix the issue and restart the loop from step 2. Don't skip ahead.

---

## Risk Classification

### High-Risk (Require Confirmation)

- Database schema changes or migrations
- Deleting files or directories
- Changes to auth logic
- Public API contract changes
- Destructive git operations (`reset --hard`, `push --force`)
- CI/CD pipeline modifications

### Low-Risk (Proceed Directly)

- Code refactoring within existing patterns
- Adding new features following established patterns
- Fixing syntax/type errors
- Adding tests
- Updating dependencies (minor/patch)

---

## Monorepo Conventions

### Package Structure

Shared configs live in `tooling/` and are consumed as `@repo/*` workspace dependencies. Shared runtime code lives in `packages/`. Apps live in `apps/`.

**When to create a new package:**

- The code is consumed by 2+ apps or packages.
- The code has a clear boundary and independent concern.
- Don't pre-create packages speculatively. Wait for the second consumer.

### Root `package.json` is Sacred

The root `package.json` should only contain workspace-level concerns: turbo, prettier, commitlint, husky, vitest (binary hoisting), and workspace scripts. **Never add library-specific dependencies to root.** All shared dev dependencies (testing-library, plugins, etc.) belong in the appropriate `tooling/*` package and are consumed via `@repo/*` workspace dependencies. If a consuming package needs to import a library, that library should be a `dependency` (not `devDependency`) of the tooling package so it's transitively available.

### Tooling Files

- **`tooling/eslint`** uses `.ts` files — ESLint 10 natively supports TypeScript config files.
- **`tooling/vitest`** uses `.js` files — Node ESM can't load `.ts` from workspace packages without additional tooling. This is intentional — don't change it.

### Vitest Configuration

- `vitest` is in root `devDependencies` so the binary is hoisted to `node_modules/.bin/`.
- Per-app configs extend from `@repo/vitest/*` (base, react, wxt).
- WXT uses `happy-dom` (not jsdom) — jsdom is incompatible with the WxtVitest plugin.
- Tests are colocated with source code or in a `__tests__/` directory.
- `globals: true` is enabled so Vitest cleanup hooks (e.g. `@testing-library/react` auto-cleanup via `afterEach`) work without explicit imports. Test functions like `describe`, `test`, `expect`, `it` can be used either way — explicit imports from `vitest` are preferred for clarity and editor support, but globals work too.

### Environment Variables

Each app gets its own `.env.<app-name>` file at the monorepo root (e.g., `.env.web`, `.env.browser-extension`). These are gitignored. Committed `.env.<app-name>.example` files document required vars.

**How it works:**

1. **Turbo `setup:env`** automatically symlinks root `.env.<app-name>` into each app directory before `dev`/`build`. No manual setup needed.
2. **`@repo/env/*`** provides type-safe, validated env via `@t3-oss/env-core`. Always import from here:
   ```ts
   import { env } from '@repo/env/browser-extension' // in apps/browser-extension
   import { env } from '@repo/env/web' // in apps/web
   ```
3. **`restrictEnvAccess`** ESLint rule (included in `nextJsConfig` and `wxtConfig`) blocks raw `process.env` usage in app code.

**Next.js `NEXT_PUBLIC_` gotcha:** Each `NEXT_PUBLIC_*` var must be explicitly mapped in `runtimeEnv` as `NEXT_PUBLIC_FOO: process.env.NEXT_PUBLIC_FOO`. Next.js inlines these at build time via literal replacement — dynamic access like `process.env[key]` won't work. TypeScript catches missing keys at compile time. A `no-restricted-syntax` ESLint rule in `packages/env` prevents passing `process.env` directly to `runtimeEnv`.

**Adding a new app's env:**

1. Create `.env.<app-name>` and `.env.<app-name>.example` at root
2. Add `"setup:env": "bun ../../packages/env/setup-env.ts .env.<app-name>:.env"` to app's `package.json` scripts
3. Create `packages/env/src/<app-name>.ts` with its schema
4. Add `"./<app-name>": "./src/<app-name>.ts"` to `packages/env/package.json` exports
5. Add `"@repo/env": "*"` to app's dependencies

### Turbo Tasks

```
bun turbo run build      # Build all
bun turbo run dev        # Dev servers
bun turbo run test       # Unit tests (Vitest)
bun turbo run e2e        # E2E tests (Playwright)
bun turbo run lint       # Lint
bun turbo run typecheck  # Type check
bun run clean            # Remove all derived artifacts (node_modules, .next, .turbo, etc.) — preserves .env files
```

---

## Code Quality

### The Compounding Checklist

Before submitting any code, verify:

1. **Does this pattern already exist?** Search the codebase before writing new utilities, components, or helpers. Reuse > reinvent.
2. **Is this in the right place?** Could another consumer need this? Place it where it'll be discovered naturally (`packages/`, `tooling/`, shared utils).
3. **Does this teach the codebase?** Good code documents patterns for the next feature. Clear naming, consistent structure, and obvious conventions reduce decision fatigue.
4. **Does this compound or accumulate debt?** Will this make the next change easier or harder?

### Reusability

- Check existing packages (`@repo/ui`, `@repo/test-utils`) before creating new abstractions.
- Generic utilities belong in shared packages. Domain-specific code stays in the consuming app.
- Extract to shared locations by default when a function could reasonably have a second consumer.

### Consistency Over Cleverness

Follow established patterns in the codebase. Look at similar existing code before implementing new features. A consistent codebase is a fast codebase — everyone knows where to find things and how things work.

### Code Smells to Flag

Proactively identify and call out:

- **Duplicate logic / copy-paste code** — Extract to shared utility.
- **Tight coupling or circular dependencies** — Restructure the dependency graph.
- **Fragile designs** — Where changing one thing breaks unrelated parts.
- **Unclear intent** — Vague naming, confused abstractions.
- **Over-engineering** — Complexity with no actual benefit.
- **Scattered seeds** — Inline helpers that should be shared, ad-hoc patterns that should be conventions.

When you spot these: explain briefly, suggest 1-2 refactoring directions with trade-offs.

### Type Safety

1. **First preference:** Use existing types from the codebase or libraries.
2. **Second preference:** Create explicit types when no suitable type exists.
3. **Last resort:** Inline types only when trivial and immediately consumed.

Use `satisfies` over `as` for object literals. `as` silently bypasses type checking.

### Pure Functions Over Side Effects

Default to pure functions. Push impure logic (I/O, mutations, throws) to the edges. Keep the core logic pure, testable, and composable.

### No Logic in JSX

JSX should be declarative. Compute everything before `return`. No IIFEs, no complex ternaries, no multi-step logic inside JSX blocks.

### No Bug-Masking Wrappers

Never write helper functions that silently hide failures behind "smart" fallbacks. If a library function signals a problem, that's a bug to fix at the source — not something to paper over.

### No Reimplementing Library Functions

Before writing any utility, check if lodash, the framework, or an already-imported library provides it. Check the codebase for similar imports.

### No Shortcuts to Unblock Yourself

When you hit an error or missing piece, fix it properly — don't create workarounds just to make the error go away. The quick fix often introduces a worse problem than the original.

Examples of shortcuts to avoid:

- **Hand-rolled `.d.ts` stubs** — If types are missing (e.g., `import.meta.env`), add the real type package (`vite/client`, `@types/node`) as a dependency. Don't write manual type declarations that drift from reality.
- **Silencing lint/type errors** — If a rule or type check fails, understand why. The fix is usually in the code, not in disabling the check.
- **Placeholder values or dummy implementations** — If a function needs real data or a real integration, say so. Don't fake it with hardcoded values or no-op stubs.

If the proper fix is unclear, ask — don't guess with a workaround.

---

## React Patterns

### `useRef` vs `useState`

Use `useState` (not `useRef`) for values that:

- Trigger side effects when changed
- Are set asynchronously
- Determine whether to run logic in `useEffect`

Refs don't trigger re-renders. Effects depending on `ref.current` create race conditions.

**Use `useRef` only for:**

- DOM element references
- Mutable values that don't affect rendering (timers, previous values)
- Values read only in event handlers (not effects)

### Component Design

- Keep components focused. One component, one responsibility.
- Extract shared components to `packages/ui` when used across apps.
- Colocate component-specific logic with the component. Share cross-cutting logic.

---

## Testing

### Philosophy

Tests are seeds too. A good test suite compounds into fearless refactoring and confident deployments.

- Non-trivial changes should include tests.
- Prefer integration tests for features, unit tests for utilities.
- If you modify existing behavior, check if existing tests need updating.

### Given-When-Then

All tests follow this structure:

```ts
test('should create user successfully', async () => {
  // Given: preconditions and test data
  const input = { name: 'Test User', email: 'test@example.com' }

  // When: execute the action
  const result = await createUser(input)

  // Then: verify expected outcomes
  expect(result.id).toBeDefined()
  expect(result.name).toBe('Test User')
})
```

### Behavior Over Implementation

Test what the code should achieve, not how it achieves it. Assert on outputs, side effects, and state changes. Avoid testing private methods or internal implementation details.

### Test Infrastructure

- **Unit tests:** Vitest 4, colocated with source or in `__tests__/`.
- **E2E tests:** Playwright in `testing/e2e/`, separate suites for web and browser-extension.
- **Shared test utils:** `@repo/test-utils` for factories, fixtures, custom matchers.
- **DOM simulation:** `jsdom` for React/Next.js (per Next.js docs), `happy-dom` for WXT (required by WxtVitest plugin).

### Writing Unit Tests

Unit tests live next to the code they test. Name files `*.test.ts` or `*.spec.ts`.

```
apps/web/src/utils/
├── auth.ts
└── auth.test.ts        # test lives next to source
```

Each app's `vitest.config.ts` extends a shared preset:

- **Web & UI packages** — extend `@repo/vitest/react` (includes React plugin + jsdom)
- **Browser extension** — extends `@repo/vitest/wxt` (includes WXT plugin + fake browser APIs)

**Browser extension tests** get `fakeBrowser` automatically — no need to mock `browser.storage`, `browser.tabs`, etc. Reset state between tests:

```ts
import { beforeEach } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'

beforeEach(() => {
  fakeBrowser.reset()
})
```

### Writing E2E Tests

E2E tests live in `testing/e2e/<app>/tests/`. They test the built product, not source code.

**Web tests** use standard Playwright:

```ts
import { expect, test } from '@playwright/test'

test('homepage loads', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.ok()).toBe(true)
})
```

**Browser extension tests** use the custom fixtures that load the extension into Chromium:

```ts
import { expect, test } from '../fixtures'

test('popup renders', async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/popup.html`)
  await expect(page.locator('body')).toBeVisible()
})
```

### Adding Tests to a New App/Package

1. Add `@repo/vitest` and `@repo/test-utils` as devDependencies
2. Create a `vitest.config.ts` that extends the appropriate preset
3. Add `"test": "vitest run"` and `"test:watch": "vitest"` scripts to `package.json`

```ts
// vitest.config.ts
import reactConfig from '@repo/vitest/react' // or @repo/vitest/base, @repo/vitest/wxt
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

For a new E2E suite, add a directory under `testing/e2e/<app-name>/` with its own `playwright.config.ts` extending the base config.

---

## Git & Commits

### Commit Messages

- Use [Conventional Commits](https://www.conventionalcommits.org/) (enforced by commitlint + husky).
- Do NOT add "Co-Authored-By: Claude" or any AI attribution.
- Write commit messages as if a human wrote them.
- Focus on the "why" not the "what."

### Branch Strategy

- `main` is the primary branch.
- Feature branches for new work.
- Never force push to `main`.

---

## Debugging

1. Don't patch surface symptoms — identify root cause.
2. Generate 1-3 hypotheses ranked by likelihood.
3. Verify the most likely hypothesis first.
4. Update hypotheses as new information emerges.

---

## Conflict Resolution Priority

When constraints conflict, resolve in this order:

1. **Correctness and safety** — data consistency, type safety
2. **Business requirements** — explicit requirements and boundary conditions
3. **Maintainability** — long-term evolution, readability
4. **Performance** — resource usage, speed
5. **Brevity** — code length, local elegance

---

## Scope Discipline

- Don't introduce tasks beyond what was asked.
- Fixing your own errors is not scope expansion — handle it directly.
- If you discover related issues, mention them briefly but stay focused.

---

## Persistence

- Don't give up easily. Try different approaches before concluding something is impossible.
- For transient errors, retry with adjusted parameters before reporting failure.
- If one path is blocked, consider alternatives.
- When stuck, explain what you've tried and propose next steps.

---

## Self-Correction

- Fix your own syntax errors, missing imports, and formatting issues without asking.
- If you introduce a bug, fix it immediately. Don't pretend it didn't happen.
- Only ask for confirmation on high-risk fixes.

---

## Self-Improvement

If you encounter a new pattern, convention, or hard-won lesson that would benefit future work on this codebase, add it to this file. Clearly describe the what/why/when/how. Learn from mistakes. Don't lose context.

### Session Retrospective

At the end of every session — or after completing a non-trivial task — ask yourself:

1. **Did I make a mistake that was caught by the user or by a check?** If yes, document the root cause and the fix as a rule so it never happens again.
2. **Did I learn something about this codebase's conventions that isn't already documented here?** If yes, add it to the relevant section.
3. **Did I discover a footgun, a surprising behavior, or a non-obvious constraint?** If yes, document it where the next person (or future you) would look.

Don't wait to be told. If the lesson is repeatable, write it down before the session ends.
