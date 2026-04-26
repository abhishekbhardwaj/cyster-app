# Monorepo Quick Reference

Turborepo patterns, commands, and gotchas for this monorepo.

---

## Commands

### Everyday

```bash
bun run dev              # Start all dev servers
bun run build            # Build everything
bun run typecheck        # Type-check all packages
bun run lint             # Lint all packages
bun run format           # Check formatting
bun run format:fix       # Fix formatting
bun run test             # Unit tests
bun run test:e2e         # E2E tests (Playwright)
```

### Database

```bash
bun run database:generate                         # Regenerate Prisma client
bun run database:migrate                          # Deploy migrations (production)
bun run database:migrate:dev -- --name add_users  # Create new migration
bun run database:push                             # Push schema without migration
bun run database:studio                           # Open Prisma Studio GUI
bun run database:reset                            # Reset database
```

### Email

```bash
bun run email:create -- WelcomeEmail              # Create a new email template
bun run email:check                               # Check email template compatibility
bun run email:preview                             # Start the email preview server
```

### Filtering

```bash
bun turbo run build --filter=backend              # Single package
bun turbo run build --filter={./apps/*}           # By directory
bun turbo run build --filter=backend...           # Package + its dependencies
bun turbo run build --filter=...@repo/ui          # Package + its dependents
bun turbo run build --filter=[HEAD^1]             # Changed since last commit
bun turbo run build --force                       # Ignore all caches
```

### Debugging

```bash
bun turbo run typecheck --dry                     # Show task graph without running
bun turbo run build --graph=graph.html            # Visual task graph
bun turbo run typecheck --dry 2>&1 | grep NONEXISTENT  # Find ghost tasks
bun turbo run test --only                         # Skip dependsOn, run task directly
```

### Deployment

```bash
bun turbo prune backend --docker                  # Pruned monorepo for Docker
# out/json/ — package.json files only (for install layer caching)
# out/full/ — full source code
```

---

## Why Root Convenience Scripts

The `database:*` and `email:*` scripts in root `package.json` exist because of how Bun and Turbo interact:

**`bun run <script>`** looks for a script in the current `package.json`. It doesn't know about turbo tasks. Without root scripts, you'd need `bun turbo run database:migrate:dev` every time.

**`bun run --filter @repo/database <script>`** runs the script directly via bun, **bypassing turbo entirely** — no task graph, no `dependsOn`, no `setup:env`, no `interactive: true`. The `turbo.json` config is ignored.

**pnpm** has built-in workspace-aware filtering (`pnpm --filter @repo/database run ...`) that some developers expect. Bun's `--filter` doesn't route through turbo, so it's not equivalent.

The root scripts solve this — they're one-liners that route through turbo so the full task graph is respected:

```jsonc
// root package.json
"database:migrate:dev": "turbo run database:migrate:dev --"
// The trailing -- enables arg passthrough: bun run database:migrate:dev -- --name foo
```

**Rule:** Package-specific tasks that need turbo's task graph (dependsOn, caching, interactive, persistent) should have root convenience scripts. Ad-hoc turbo commands use `bun turbo run` directly.

---

## turbo.json Patterns

### dependsOn operators

| Syntax                               | Meaning          | Example                                      |
| ------------------------------------ | ---------------- | -------------------------------------------- |
| `"build"`                            | Same package     | Run `build` in this package first            |
| `"^build"`                           | Upstream deps    | Run `build` in all dependency packages first |
| `"@repo/database#database:generate"` | Specific package | Run this exact task first                    |
| `"//#codegen"`                       | Root workspace   | Run a task from root `package.json`          |

### Package-scoped tasks (`package#task`)

Task definitions in `turbo.json` are **global by default** — they apply to all packages. Use `package#task` syntax to scope a task to a specific package:

```jsonc
// Generic — creates ghost <NONEXISTENT> tasks in ALL 13 packages
"database:generate": { "cache": false }

// Scoped — only exists in @repo/database, no ghost tasks
"@repo/database#database:generate": { "cache": false }
```

**Why this matters:** Generic definitions create ghost task nodes in every package. If a ghost task has `dependsOn: ["setup:env"]`, turbo cascades `setup:env` into unrelated packages — including ones with their own `setup:env` that references different env files, causing failures.

**Rule:** If a task only exists in one package, always use `package#task` syntax.

Current examples in this repo:

- `@repo/database#database:*`
- `@repo/communications#email:*`

### Caching rules

| Use `cache: false` for                | Why                                          |
| ------------------------------------- | -------------------------------------------- |
| `setup:env`                           | Symlinks env files — must always run         |
| `database:generate`                   | Prisma + Turbo docs both recommend uncached  |
| `database:migrate` / `push` / `reset` | Mutates external database state              |
| `dev`                                 | Long-running — also needs `persistent: true` |

### inputs and outputs

```jsonc
"build": {
  "inputs": ["$TURBO_DEFAULT$", ".env*"],     // What affects the cache key
  "outputs": [".next/**", "!.next/cache/**"]   // What gets cached after success
}
```

- **`$TURBO_DEFAULT$`** — keeps default file hashing. Always include when adding custom inputs.
- **`$TURBO_ROOT$`** — reference files relative to repo root: `"$TURBO_ROOT$/tsconfig.json"`
- **`outputs: []`** — caches only logs (useful for lint/typecheck — cache hit = "no errors")

### Environment variables

| Field              | Cache impact            | Use for                          |
| ------------------ | ----------------------- | -------------------------------- |
| `globalEnv`        | Change busts ALL caches | `NODE_ENV`, `CI`, `DATABASE_URL` |
| `env` (task-level) | Busts only this task    | Task-specific vars               |
| `passThroughEnv`   | No cache impact         | Secrets, CI tokens               |

---

## Gotchas

**1. Generic tasks create ghost nodes everywhere.** Use `@repo/database#database:generate` not `database:generate` for package-specific tasks. Debug with `--dry | grep NONEXISTENT`.

**2. Forgetting `$TURBO_DEFAULT$` in custom inputs.** Without it you lose all default file hashing — only the files you list get hashed.

**3. Missing `outputs` on build tasks.** No `outputs` = turbo caches nothing = task reruns every time.

**4. Missing `persistent: true` on `dev`.** Without it, long-running tasks block dependents forever.

**5. Caching side-effect tasks.** `database:migrate` with caching means the migration silently doesn't run on cache hit.

**6. Overly broad `globalDependencies`.** `"**/.env.*"` matches env files in every package — use `".env.*"` for root only.

**7. Chaining turbo commands.** `turbo run lint && turbo run build` is sequential. `turbo run lint build` lets turbo parallelize both.

**8. Per-package turbo.json missing `extends`.** Must include `"extends": ["//"]` or the config is invalid.

**9. `../` in inputs.** Use `"$TURBO_ROOT$/file"` instead of `"../file"`.

**10. Array override in package configs.** Arrays (`outputs`, `env`, `inputs`) **replace** the parent. Use `$TURBO_EXTENDS$` as first element to append instead.
