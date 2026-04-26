# Testing Guide

This guide outlines testing strategies, patterns, and best practices for the backend app. Read existing tests in `apps/backend/tests/` for copy-paste examples. The test files are the source of truth for patterns.

## Architecture Overview

### Testing Stack

- Test runner: [bun:test](https://bun.sh/docs/cli/test)
- Test structure: Given-When-Then
- Database: multi-database support with lifecycle management
- Authentication: Better Auth integration with session and organization testing
- Email: centralized mocking for `@repo/communications/email`
- API client: custom `APITestClient`

### Test Organization

| Location                              | Purpose                                               | Examples                                         |
| ------------------------------------- | ----------------------------------------------------- | ------------------------------------------------ |
| `apps/backend/tests/api/`             | Integration tests for the full request-response cycle | `health.test.ts`, `contact.test.ts`              |
| `apps/backend/tests/api/app-service/` | App Service API tests                                 | `authentication-e2e.test.ts`, `api-keys.test.ts` |
| `apps/backend/tests/utils/`           | Unit tests for isolated utility functions             | `api-key.test.ts`, `phone-number.test.ts`        |

Infrastructure lives in `apps/backend/tests/__reusable-test-utilities__/`. Mocks live in `apps/backend/tests/__mocks__/`.

## Testing Infrastructure

### APITestClient

The `APITestClient` in `apps/backend/tests/__reusable-test-utilities__/api-test-client.ts` extends `TestDatabase` and provides:

- Type-safe `get()`, `post()`, `put()`, `patch()`, and `delete()` methods
- Authentication helpers: `setRequestAsUser()`, `setAPIKey()`, `includeAPIKey()`
- Automatic database setup, seeding, and cleanup
- Typed response bodies for `ApiResponse<T>`

Read the source file for the full API and existing tests for usage patterns.

### Database Lifecycle

The `TestDatabase` class in `apps/backend/tests/__reusable-test-utilities__/test-database.ts` provides:

- `setupDatabase()` - Runs migrations or `db push` depending on database type
- `truncateDatabaseAndSeed()` - Cleans tables and reseeds test data
- `teardown()` - Drops tables and disconnects Prisma

It supports PostgreSQL, MySQL, and SQLite with the correct cleanup strategy for each.

### Test Data Seeding

Read `apps/backend/tests/__reusable-test-utilities__/data-seeding.ts` for the seeded users, organizations, and membership setup used across backend tests.

## Test Types and Patterns

### Given-When-Then Structure

All tests follow the Given-When-Then pattern:

- Given: preconditions and test data
- When: execute the action being tested
- Then: verify expected outcomes

### Behavior-Focused Testing

Focus tests on what the code should achieve, not how it achieves it.

- Test public interfaces and observable behavior
- Assert on outputs, side effects, and state changes
- Avoid testing internal implementation details

### Test Categories

1. Unit tests (`apps/backend/tests/utils/`) for fast isolated utility checks
2. Integration tests (`apps/backend/tests/api/`) for full request-response coverage
3. End-to-end auth flow tests (`apps/backend/tests/api/app-service/authentication-e2e.test.ts`) for multi-step workflows

## Real Test Examples

Read these files for copy-paste templates:

| Scenario                             | File                                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------------ |
| Health check                         | `apps/backend/tests/api/health.test.ts`                                              |
| Contact form with email mocks        | `apps/backend/tests/api/app-service/static/contact.test.ts`                          |
| API key CRUD and access control      | `apps/backend/tests/api/app-service/organization/api-keys.test.ts`                   |
| Auth flows (signup, signin, session) | `apps/backend/tests/api/app-service/authentication-e2e.test.ts`                      |
| Utility unit tests                   | `apps/backend/tests/utils/api-key.test.ts`, `apps/backend/tests/utils/route.test.ts` |

## Authentication Testing

The backend uses a dedicated Better Auth test client from `apps/backend/tests/__reusable-test-utilities__/create-test-auth-client.ts`.

Key patterns:

- Create auth client with `createTestAuthClient(client.app)`
- Sign up with `betterAuth.signUp.email(...)`
- Sign in with `betterAuth.signIn.email(...)`
- Fetch session with `betterAuth.getSession()`

Read `apps/backend/tests/api/app-service/authentication-e2e.test.ts` for full examples.

## Email Service Testing

### Mock Architecture

The backend uses a shared mock module pattern:

- `apps/backend/tests/__mocks__/email.mock.ts` - typed mock definitions
- `apps/backend/tests/__mocks__/index.ts` - central export point
- `apps/backend/tests/preload.ts` - registers mocks via `mock.module()`

### Using Email Mocks

Import `emailMocks` from `tests/__mocks__` for type-safe assertions. Read the mock file for available functions. It mirrors the real email service surface used by the backend.

`mock.clearAllMocks()` runs automatically in `apps/backend/tests/preload.ts` after each test.

### Creating New Mock Modules

To mock a new service:

1. Create `apps/backend/tests/__mocks__/your-service.mock.ts`
2. Export it from `apps/backend/tests/__mocks__/index.ts`
3. Register it in `apps/backend/tests/preload.ts` with `mock.module()`

Read the existing email mock files for the exact pattern.

## Running Tests

### Common Commands

```bash
# From the monorepo root
bun run test

# From apps/backend/
bun test --env-file .env.test
bun test --env-file .env.test --watch
bun test --env-file .env.test --coverage
bun test --env-file .env.test tests/api/health.test.ts
bun test --env-file .env.test --test-name-pattern "API Keys"
```

### Configuration

- `apps/backend/bunfig.toml` loads `tests/preload.ts`
- `apps/backend/tests/preload.ts` registers module mocks and clears mocks between tests
- `apps/backend/.env.test` provides test-specific environment variables

## Best Practices

### Test Organization

- Group related tests with `describe`
- Use descriptive test names
- Follow Given-When-Then consistently

### Database Testing

- Keep tests isolated
- Use clean state between tests
- Always tear down resources

### Authentication Testing

- Leverage seeded users where possible
- Test both authorized and unauthorized paths
- Verify organization-scoped access control

### Mocking Strategy

- Mock external dependencies such as email
- Use predictable mock responses
- Assert on mock calls when behavior depends on side effects

### Type Safety

- Use typed `ApiResponse<T>` assertions
- Reuse Zod schemas where helpful
- Avoid weakly-typed test payloads when the source code already defines the shape

## Related Documentation

- [API Development Guide](./api-development.md) - API testing in the development workflow
- [Database Guide](../database.md) - Database testing patterns
- [Communications Guide](../communications.md) - Email testing and mocking
- [Patterns Reference](./patterns.md) - Quick-reference test patterns
