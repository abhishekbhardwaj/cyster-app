# AGENTS.md

> Edit this file. `CLAUDE.md` symlinks to it.

## Project Overview

Turborepo monorepo. Package manager: **Bun** — use `bun` for all install/run/add commands. Never npm/yarn/pnpm.

| Workspace                 | Stack                       | Purpose                                                 |
| ------------------------- | --------------------------- | ------------------------------------------------------- |
| `apps/web`                | Next.js, React (port 3000)  | Web application                                         |
| `apps/backend`            | Hono                        | Backend API service                                     |
| `packages/ui`             | React (`@repo/ui`)          | Shared components                                       |
| `packages/database`       | Prisma (`@repo/database`)   | Schema, migrations, generated client                    |
| `packages/communications` | (`@repo/communications`)    | Email templates, sending, SMTP                          |
| `packages/env`            | (`@repo/env`)               | Type-safe env validation (`./web`, `./backend`)         |
| `packages/test-utils`     | (`@repo/test-utils`)        | Shared test factories, fixtures, matchers               |
| `tooling/eslint`          | ESLint 10 (`@repo/eslint`)  | Lint configs: `./base`, `./next-js`, `./react-internal` |
| `tooling/prettier`        | Prettier (`@repo/prettier`) | Format config                                           |
| `tooling/typescript`      | (`@repo/typescript`)        | TS configs                                              |
| `tooling/vitest`          | Vitest (`@repo/vitest`)     | Test configs: `./base`, `./react`                       |
| `testing/e2e`             | Playwright (`@repo/e2e`)    | E2E tests for web                                       |

Versions live in `package.json` — check there if you need them.

### Workspace-specific references

Source of truth for their areas. Read before working in the area.

- **Monorepo / Turbo** — [docs/monorepo.md](docs/monorepo.md): commands, filtering, `turbo.json` patterns, caching, ghost-task gotchas
- **Database** — [docs/database.md](docs/database.md): Prisma schema, migrations, client init
- **Communications** — [docs/communications.md](docs/communications.md): email templates, sending, SMTP
- **Backend** (`apps/backend/`) — [docs/backend/agents.md](docs/backend/agents.md) (import aliases, file locations, code patterns, env vars, common ops). Plus:
  - [api-development.md](docs/backend/api-development.md) · [structure.md](docs/backend/structure.md) · [patterns.md](docs/backend/patterns.md) · [testing.md](docs/backend/testing.md)
  - [logging-and-observability.md](docs/backend/logging-and-observability.md) · [hono.md](docs/backend/hono.md) · [code-review.md](docs/backend/code-review.md) · [deployment.md](docs/backend/deployment.md) · [quickstart.md](docs/backend/quickstart.md)

---

## Operating Principle: Compounding Engineering

**Each unit of work should make the next easier, not harder.** Every feature should document patterns, create reusable components, establish conventions, and codify knowledge so subsequent work compounds rather than accumulates debt.

When two paths exist, take the one that documents patterns, extends existing helpers, and reuses existing structure. Reject the path that copy-pastes, scaffolds parallel abstractions, skips docs, or trades clarity for short-term speed. Every rule below is a guardrail enforcing this bias — follow them, don't treat them as suggestions.

**Before submitting any change, ask:**

1. **Does this pattern already exist?** Search before writing new utilities, components, helpers.
2. **Is this in the right place?** Where will it be discovered naturally by the next consumer?
3. **Does this teach the codebase?** Clear naming, consistent structure, obvious conventions reduce decision fatigue.
4. **Will this make the next change easier or harder?** If harder — rethink.

---

## Approach

- **Slow is fast.** Prioritize quality, abstraction, architecture, and long-term maintainability. Act with the judgment of a CTO with 20+ years of experience — get it right the first time, in as few round-trips as possible. Avoid superficial answers and unnecessary clarifications. A 30-minute solution that compounds beats a 5-minute hack that costs 3 hours next month.
- **Research first, code second.** Verify library behavior, framework APIs, or best practices with current docs (use context7) when uncertain — don't guess from stale training data. Check whether the framework or an existing dependency already solves it before hand-rolling. Prefer well-maintained, battle-tested libraries (download counts, maintenance activity, community adoption) over custom utilities — even if they do slightly more than you need. Only hand-roll when no suitable library exists or it would add disproportionate complexity.
- **Follow existing patterns.** Default to following existing patterns — even ones you wouldn't choose on a greenfield project. Consistency beats local perfection. Find similar features/services/components and study how they're structured, named, and wired before introducing anything new. Adopt the codebase's organization, naming, error handling, libraries, and data flow. If the codebase uses a specific library for something, use that same library — don't introduce a competing one. Diverge only when the existing pattern is actively harmful (correctness/safety, scaling traps, or contradicts these guidelines) — and flag it to the user with a brief explanation first.
- **Read to understand, don't grep to confirm.** Grep locates; reading comprehends. Read the full function before modifying — understand inputs, outputs, branching, side effects. Read callers before changing callees. Read the module before claiming how it works. Read the full code path top-to-bottom when debugging — pattern-matching on error messages or symbol names leads to confident wrong conclusions. Read large files in sections — but read them. Never propose changes to code you haven't read. Anti-pattern: grep → see it exists → assume you understand → make changes → break things you never read.
- **Maximum output, minimum code.** Write the least code that delivers the most value. Fewer files, fewer lines, fewer abstractions — unless more are justified. Don't scaffold what you won't use. Don't abstract what has one consumer. Prefer a single well-designed file over five thin ones. Every file/function/type must justify itself. Leverage existing tooling, conventions, and frameworks to their fullest before writing custom code. If you can do it in 10 lines, don't write 50.
- **Build for scale.** Design data models, APIs, and architecture for 10x, 100x current load. Indexing, pagination, caching, async patterns from the start. Reject "you're not Instagram, this is just a side project" thinking — that mindset compounds debt. Factor future refactor cost into trade-offs.
- **Brutal honesty, no gaslighting.** Don't be a yes-man. Never bullshit. Point out wrong things bluntly — don't sugarcoat or hedge. If a proposed solution is bad, say so, explain why, and offer a better one. Challenge flawed assumptions — don't agree just because the user said it. Admit uncertainty — say "I don't know" and research before asserting. If research can't find reliable info, ask the user. Never confidently assert what you're unsure of — false confidence wastes time and erodes trust. Own mistakes immediately — don't pretend they didn't happen or rationalize them.

---

## Workflow

- **Classify task complexity.**
  - **Trivial** (<10 lines, single-file): execute directly.
  - **Moderate** (single-file logic, local refactor): brief plan, then execute.
  - **Complex** (cross-module, migrations, architecture): analyze top-down for root cause, propose 1-3 solutions with trade-offs (impact, risks, verification), align with the user, then minimal reviewable changes with clear verification steps.
- **When told to proceed, proceed.** "Implement" / "do it" / "go ahead" / plan selection → start. Don't re-explain or re-confirm.
- **Stay in scope.** Don't expand the task or rewrite adjacent subsystems. Mention related issues briefly. Fixing your own conversation-introduced errors is not scope expansion — handle it directly.
- **Default to action over inquiry.** Use all available context (conversation history, code, errors, logs) to make reasonable assumptions and proceed. Only ask if missing info would significantly change the approach. Senior engineers prefer a solution they can adjust over 5 clarifying questions.
- **Persist.** Try alternatives before declaring something impossible. Retry transient errors (network, rate limits, flaky tests) with adjusted parameters. When stuck, explain what you tried, why it didn't work, and propose next steps.
- **Self-correct silently.** Fix your own syntax/import/format errors without asking. Fix bugs you introduced in the next response — don't pretend they didn't happen. Only confirm on high-risk fixes.
- **Self-validate.** Verify the solution satisfies all explicit constraints. Check for omissions and contradictions. Adjust when new info invalidates the approach — don't forge ahead.
- **Answer like to a senior engineer.** No basic explanations. State trade-offs explicitly before choosing. Always include verification steps (which tests, what to check).
- **Debug to root cause.** Generate 1-3 hypotheses ranked by likelihood; verify the most likely first; update as evidence comes in. Don't patch surface symptoms. In rewrites/migrations/adapters, compare new behavior against the legacy path on representative inputs before calling a difference a regression. If they match, it's parity debt, not a bug — don't change semantics casually in cleanup. Add characterization tests before changing calculations, formatting, ordering, file output, or date/time behavior.

**Conflict resolution priority** — when constraints conflict, resolve in order: (1) **correctness/safety** (data consistency, type safety, concurrency) → (2) **business requirements** (explicit requirements, boundary conditions) → (3) **maintainability** (long-term evolution, readability) → (4) **performance** (resource usage, speed) → (5) **brevity** (code length, local elegance).

---

## Verification Feedback Loop

**Every change must pass this loop before it's done.** Non-negotiable. Don't skip steps. Don't assume it works — prove it.

1. Make the change.
2. `bun run typecheck` — fix type errors.
3. `bun run lint` — fix lint errors.
4. `bun run format` (prettier `--check`). If it fails: `bun run format:fix`, then re-run `bun run format` to confirm.
5. `bun run test` — Vitest unit tests. Run if tests exist for the changed code; fix failures.
6. `bun run test:e2e` — Playwright E2E. Run if user-facing flows changed; fix failures. View reports with `bun run test:e2e:report` (all) or `bun run test:e2e:report:web` (web only).
7. **Only when all steps pass is the change done.**

If a step fails, fix and restart from step 2 — don't skip ahead. For backend-specific test commands (single file, watch, coverage, env loading via `bun:test`), see [docs/backend/testing.md](docs/backend/testing.md).

---

## Risk Classification

**High-risk — require user confirmation:** database schema changes/migrations · deleting files or directories · auth logic changes · public API contract changes · destructive git ops (`reset --hard`, `push --force`) · CI/CD pipeline modifications.

**Low-risk — proceed directly:** refactoring within existing patterns · new features following established patterns · syntax/type fixes · adding tests · minor/patch dependency bumps.

---

## Code Structure

- **Files do one thing well.** ~500 lines is a smell. Warning signs: multiple unrelated exports, comment banners (`// === SECTION ===`), frequent merge conflicts, can't describe without "and" twice. Split by domain concern, abstraction level, or change frequency. Don't over-split — a 10-line single-use helper doesn't need its own file.
- **Boy Scout rule.** Improve files you touch — typos, `any` → real types, dead code, unclear names, missing return types — only in functions you're already editing. Don't refactor unrelated parts.
- **Extend existing helpers, don't add siblings.** If "new" helper is just "existing + one option" (fallback selection, renamed parameters, default display text, minor output shaping), extend instead. Bad: `formatDisplayName()` wrapping `formatFullName()` with fallbacks. Good: `formatFullName({ ..., fallbacks })`.
- **Extract to shared utils by default.** Domain-specific single-use → consuming file. Feature-area reusable → feature utils. Generic (no domain imports) → shared utils directory. Extract immediately when encapsulating a protocol/contract, providing safety guards every caller should get, or operating on shared types. Check existing packages (`@repo/ui`, `@repo/test-utils`) before creating new abstractions.
- **DRY service code.** Extract when 2+ functions share queries, parsing, or validation. Place in same file (default, domain-specific), shared utility (generic), or shared service helper (cross-service). Don't extract single-use logic, 5+ param helpers, or "shared" logic with subtle differences requiring flags.
- **Components: one component, one responsibility.** Keep them focused. Extract shared components to `packages/ui` when used across apps. Colocate component-specific logic with the component; share cross-cutting logic.

---

## Search & References

- **Search before creating** any `const`/`enum`/`type`/`interface`/`function`/`class`. Search the **concept** and its variations ("status", "state", "phase") — not just the exact name you'd give it. Search for similar values as string literals (e.g. before creating `ACTIVE = "active"`, grep the literal `"active"`), enum/constants/types files, schema definitions. Check directory structure to find where the project organizes constants/types/utils. Extend something close rather than creating parallel. Use subagents for broad searches rather than one grep.
- **Search before modifying.** Find all callers, tests, and related files first to understand blast radius. Before removing a relation or preload, search downstream consumers. If an adjacent layer already loaded what you need, pass it through instead of refetching. Don't fetch entities/relations "just in case" — every load needs a downstream read justifying it. After implementation works, trim unused relations and collapse duplicate fetches across adjacent layers.
- **Search before claiming.** Don't say "this doesn't exist" or "this is the only place" without verifying.
- **No stale references after refactoring.** After rename/move/delete: search imports, string references (tests/configs/comments), type references; update all; verify build. Too large a blast radius? Reconsider or flag to user before proceeding.
- **No hallucinated APIs.** Never use a method/option/feature unverified. Search codebase usage → look up official docs (context7) → say so if still unverified. Don't assume framework hooks exist because they "should". Don't pass options a function doesn't accept. Watch for syntax from a different version. Common trap: library methods that don't exist (e.g. `lodash.deepMerge` — it's `merge` or `mergeWith`).

---

## No Shortcuts

- **No lazy defaults.** No `any` (use `unknown` and narrow). No `// TODO` (do it or flag out of scope). No `console.log` (use project logger). No empty `catch {}` (re-throw or log). No placeholder `return null`/`[]`/`{}` for unfinished work — implement or throw "not implemented".
- **No shortcuts to unblock.** Don't hand-roll `.d.ts` stubs (add the type package — `vite/client`, `@types/node`). Don't disable lint/type rules (fix the code). No fake integrations or no-op implementations. No compatibility wrappers whose only purpose is hiding a real bug. If the proper fix is unclear, say so and investigate — don't guess with a workaround.
- **No bug-masking wrappers.** If removing the wrapper would surface a bug, the wrapper shouldn't exist. Don't catch + return defaults. Don't apply string heuristics on "failed" library calls — fix the input, not the output.
- **No reimplementing libraries.** Before writing a utility, check: well-known library → framework → codebase shared utils → already-imported elsewhere. Only write if all four are no. Common areas: object/array traversal and string manipulation (lodash), type guards/validation (zod, yup), date handling (date-fns, dayjs, luxon), DOM/UI (framework built-ins).

---

## Types & Data

- **Type priorities:** existing types from codebase/libs → explicit new types when non-trivial → inline literals only for trivial single-use. Never `as const` or casts as workaround for missing types. `satisfies` over `as` for object literals — `as` silently bypasses type checking, while `satisfies` validates against the type while preserving the literal. `as` is acceptable only for: union narrowing with runtime evidence, post-validation `unknown`, generic-typed query results.
- **Enums/constants over inline.** Domain concepts (statuses, roles, types, categories, formats) → enum or centralized constant object. Truly local one-off list → inline OK but search first. Never define the same set in two places. Don't manufacture constants just to appease lint.
- **Query performance.** No queries inside loops (batch / `include` / `JOIN`). One well-shaped query > many small ones. `Promise.all` only when parallelism is genuinely correct, not as a default. Short-circuit dependent queries — check first, fetch conditionally. Transactions for writes, joins for reads. Verify unfamiliar patterns with query logging or `EXPLAIN`.
- **No uninitialized `let` in try/catch.** Keep the success path inside `try`; `return` or use the value there. `let result; try { result = ... } catch {}` loses type inference and forces guards downstream. Applies to database operations, any try/catch where the result is consumed after the block, and route handlers wrapping a single async operation.
- **Pure functions by default.** Same input → same output, no side effects (no throwing, mutations, or I/O). Push impure logic to the edges. Naming signals: `validate*` implies throws (avoid in helpers); prefer `check*` / `is*` / `get*Error` (boolean / error value), `with*` / `to*` (transform). Impure OK at top-level handlers, DB ops, explicit logging, event emitters — keep the impure shell thin.

---

## Errors

- **Never expose raw errors to client.** Never use `error.message` directly in the UI — map structured error codes to user-facing strings. Throw structured error codes in services, not free-form strings. Log server-side with `[context]` prefix (e.g. `[API]`, `[Auth]`) and the original cause. Client fallback: generic "something went wrong".
- **Consistent error boundaries per layer.** Service: errors-as-values OR typed throws — pick one. API: consistent HTTP mapping. UI: error boundaries with friendly messages. Don't mix throws / `null` / error-objects across services.

---

## UI / React

- **No logic in JSX return.** Compute everything before `return` — derive values, normalize types, assign conditional elements above. Keep the render block purely declarative. OK in render: simple ternaries, short-circuit `{x && <X />}`, `.map()` that transforms data to elements. Not OK: IIFEs, type narrowing, multi-step derivations.
- **`useRef` only for** DOM refs, mutable values that don't affect rendering (timers, previous values), values read only in event handlers (not effects). Never to drive effects or behavior — refs don't trigger re-renders, and effects depending on `ref.current` create race conditions. Use `useState` instead for values that trigger side effects when changed, are set asynchronously, or determine whether to run logic in `useEffect`.

---

## Readability

- **Names communicate intent.** Avoid `data` / `result` / `response` / `item` / `obj` — name what it _is_. Avoid `handleClick` / `handleChange` — name the _action_. `temp` / `tmp` / `val` / `x` only in tight loops/lambdas. Files named by concern (`date.ts`, `currency.ts`, `permissions.ts`); never `utils.ts` / `helpers.ts` / `misc.ts`. Test: can a reader understand what a variable contains without seeing the assignment? If not, rename it.
- **Doc at time of writing.** Every exported class / interface / contract gets a docblock: what it does (one sentence), where it fits (consumes / consumed by), non-obvious design choices (caching, lazy init). Comment WHY for non-obvious business logic — domain branching (e.g. "daily reports include interval, monthly don't"), heuristics with expiry, library quirks/limits (e.g. "Excel caps worksheet names at 31 chars"), magic-number conversions (e.g. "divide by 2 because ms → seconds"). Don't comment self-documenting code, line-by-line behavior, or "why not the alternative".
- **Import hygiene.** Remove unused imports as you refactor. No barrel files unless project already does. Most-specific path. Group: external → internal absolute → relative.
- **Code smells to flag.** Duplicate logic / copy-paste · tight coupling / circular deps · fragile cross-module dependencies (where changing one thing breaks unrelated parts) · unclear intent / vague names · over-engineering · scattered seeds (inline helpers that should be shared, ad-hoc patterns that should be conventions). When spotted: explain briefly, suggest 1-2 refactor directions with trade-offs.

---

## Documentation

- **Docs ship with the change.** `docs/*` is the source of truth — no new behavior, contract, env var, operator action, or error code is done until docs exist or are updated. Renames/moves/deletes update the old docs in the same change — stale docs are a bug. If a detail is important enough that users must know it to avoid misuse, it belongs in docs — not only in code comments or PR text.
- **Humanized, not reference dumps.** Start with what it's for, when to use, when not. Shortest real example first, then mental model, lifecycle, invariants. Be explicit about defaults, retry/cancellation/idempotency, failure modes. Prefer honest prose, concrete examples, and operational caveats over exhaustive API surface regurgitation. Don't manually hard-wrap MDX prose — Prettier handles wrapping (`proseWrap: "never"` for `.mdx`). If hard to explain clearly, the API isn't ready — fix the API or sharpen naming before shipping.

---

## Monorepo Conventions

For full Turbo reference (commands, filtering, `dependsOn` operators, package-scoped tasks, caching, env vars, gotchas), see [docs/monorepo.md](docs/monorepo.md).

### Package structure

Shared configs live in `tooling/` and are consumed as `@repo/*` workspace dependencies. Shared runtime code lives in `packages/`. Apps live in `apps/`.

**When to create a new package:** code is consumed by 2+ apps or packages · code has a clear boundary and independent concern · don't pre-create packages speculatively — wait for the second consumer.

### Root `package.json` is sacred

Should only contain workspace-level concerns: turbo, prettier, commitlint, husky, vitest (binary hoisting), and workspace scripts. **Never add library-specific dependencies to root.** All shared dev dependencies (testing-library, plugins, etc.) belong in the appropriate `tooling/*` package and are consumed via `@repo/*` workspace dependencies. If a consuming package needs to import a library, that library should be a `dependency` (not `devDependency`) of the tooling package so it's transitively available.

### Tooling config files — intentional split

- **`tooling/eslint`** uses `.ts` files — ESLint 10 natively supports TypeScript config files.
- **`tooling/vitest`** uses `.js` files — Node ESM can't load `.ts` from workspace packages without additional tooling. **Don't change this.**

### Vitest configuration

- `vitest` is in root `devDependencies` so the binary is hoisted to `node_modules/.bin/`.
- Per-app configs extend `@repo/vitest/*` (`base`, `react`).
- Tests are colocated with source code or in a `__tests__/` directory.
- `globals: true` is enabled so cleanup hooks (e.g. `@testing-library/react` auto-cleanup via `afterEach`) work without explicit imports. `describe`, `test`, `expect`, `it` work either way — explicit imports from `vitest` are preferred for clarity and editor support.

### Environment variables

Each app gets its own `.env.<app-name>` at the monorepo root (e.g., `.env.web`). Gitignored. Committed `.env.<app-name>.example` files document required vars. Turbo `setup:env` symlinks the file into the app directory before `dev`/`build` — no manual setup needed.

Always import via `@repo/env/*` (type-safe, validated by `@t3-oss/env-core`):

```ts
import { env } from '@repo/env/web' // in apps/web
```

The `restrictEnvAccess` ESLint rule (in `nextJsConfig`) blocks raw `process.env` in app code.

**Next.js `NEXT_PUBLIC_` gotcha:** each `NEXT_PUBLIC_*` var must be explicitly mapped in `runtimeEnv` as `NEXT_PUBLIC_FOO: process.env.NEXT_PUBLIC_FOO`. Next.js inlines these at build time via literal replacement — dynamic access like `process.env[key]` won't work. TypeScript catches missing keys at compile time. A `no-restricted-syntax` rule in `packages/env` prevents passing `process.env` directly to `runtimeEnv`.

**Adding a new app's env:**

1. Create `.env.<app-name>` and `.env.<app-name>.example` at root.
2. Add `"setup:env": "bun ../../packages/env/setup-env.ts .env.<app-name>:.env"` to the app's `package.json` scripts.
3. Create `packages/env/src/<app-name>.ts` with its schema.
4. Add `"./<app-name>": "./src/<app-name>.ts"` to `packages/env/package.json` exports.
5. Add `"@repo/env": "*"` to the app's dependencies.

**Cleaning:** `bun run clean` runs `git clean -xdf -e '.env*'` — removes all derived artifacts (`node_modules`, `.next`, `.turbo`, etc.) but preserves `.env*` files.

---

## Testing

For backend-specific patterns (`APITestClient`, `TestDatabase` lifecycle, Better Auth test client, email mocks, `bun:test` commands), see [docs/backend/testing.md](docs/backend/testing.md). Test files in `apps/backend/tests/` are the source of truth for backend test patterns.

Tests are seeds — they compound into fearless refactoring. Non-trivial changes should include tests. Prefer integration tests for features, unit tests for utilities. If you modify existing behavior, check if existing tests need updating. **Test behavior, not implementation** — public interfaces, observable outputs, side effects, state changes — not private methods. Behavior-based tests survive refactors; implementation-coupled tests are brittle.

### Given-When-Then

```ts
test('creates a user', async () => {
  // Given: preconditions and test data
  const data = { name: 'Alice', email: 'alice@example.com' }

  // When: execute the action
  const user = await userService.create(data)

  // Then: verify expected outcomes
  expect(user.id).toBeDefined()
  expect(user.email).toBe('alice@example.com')
})
```

### Reuse fixtures by domain

Inline fixtures fine for one-off data. Move to shared helper at second usage (not third). Place in nearest `__fixtures__` / `test/helpers` / `test/factories`, or `@repo/test-utils` for cross-app sharing. Name after the domain concept (`createMockUser`), not the test that first needed it (`createUserForInviteTest`).

### Test infrastructure

- **Backend** (`apps/backend/`) — `bun:test` runner, integration tests against a real database. See [docs/backend/testing.md](docs/backend/testing.md).
- **Web / UI** — Vitest, colocated as `*.test.ts` / `*.spec.ts` or in `__tests__/`. Configs extend `@repo/vitest/react` (React + jsdom, per Next.js docs) or `@repo/vitest/base`.
- **E2E** — Playwright in `testing/e2e/<app>/tests/`. Tests the built product, not source code.

### Adding tests to a new app/package

Add `@repo/vitest` and `@repo/test-utils` as devDependencies. Add `"test": "vitest run"` and `"test:watch": "vitest"` scripts. Create `vitest.config.ts`:

```ts
import reactConfig from '@repo/vitest/react' // or @repo/vitest/base
import { defineConfig, mergeConfig } from 'vitest/config'

export default mergeConfig(
  reactConfig,
  defineConfig({
    test: {
      /* overrides */
    },
  }),
)
```

For a new E2E suite, add `testing/e2e/<app-name>/` with its own `playwright.config.ts` extending the base.

```ts
// E2E example
import { expect, test } from '@playwright/test'

test('homepage loads', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.ok()).toBe(true)
})
```

---

## Git & Commits

- Use [Conventional Commits](https://www.conventionalcommits.org/) (enforced by commitlint + husky).
- **Do NOT add "Co-Authored-By: Claude" or any AI attribution.** Write commit messages as if a human wrote them.
- Focus on the "why" not the "what".
- `main` is the primary branch. Feature branches for new work. **Never force push to `main`.**

---

## Session Retrospective

After every non-trivial task, surface:

1. **Did I make a mistake caught by the user or by a check?** Document the root cause and the fix as a rule so it never happens again.
2. **Did I learn a codebase convention not documented here yet?** Add it to the relevant section.
3. **Did I discover a footgun, surprising behavior, or non-obvious constraint?** Document it where the next person (or future you) would look.

Don't wait to be told. If the lesson is repeatable, write it down before the session ends.
