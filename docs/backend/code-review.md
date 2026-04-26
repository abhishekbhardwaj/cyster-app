# Code Review Guidelines

These guidelines apply to code reviews for the backend app (`apps/backend/`) and any shared packages (`packages/*`) it depends on within this Turborepo monorepo. When changes touch shared packages, consider cross-workspace impact on all consumers.

When specifically asked to perform a code review, evaluate the changes against the following parameters.

## Review Scope

You will code review against one of:

- `git diff --staged` (staged changes)
- `git diff` (unstaged changes)
- `git diff main...HEAD` (branch changes vs main)

## Review Principles

- **Verify before flagging**: Never flag a potential issue (e.g., missing export, undefined function, incorrect API usage) without first verifying it actually exists. Read the relevant files to confirm the issue is real before reporting it.
- **No speculation**: If you're unsure whether something is a bug or intentional, verify by reading the code. Don't report speculative issues.
- **Context matters**: Understand the purpose of the change before critiquing implementation details.
- **Prioritize**: Focus on high-impact issues first (security, correctness, performance) before style nitpicks.

## Review Checklist

### Code Quality & Best Practices

- [ ] Code follows project coding standards and patterns
- [ ] No code duplication or copy-paste issues
- [ ] Appropriate abstraction level (not over-engineered, not under-abstracted)
- [ ] Clear naming for functions, variables, and types
- [ ] Proper TypeScript types (no unnecessary `any`)

### Correctness & Bugs

- [ ] Logic errors or edge cases not handled
- [ ] Race conditions or TOCTOU (time-of-check to time-of-use) issues
- [ ] Null/undefined handling
- [ ] Error handling is appropriate
- [ ] Async/await used correctly (no floating promises)

### Security - OWASP Top 10

| Vulnerability               | Check For                                          |
| --------------------------- | -------------------------------------------------- |
| Injection (SQL/NoSQL)       | Parameterized queries, no string concatenation     |
| Broken Authentication       | Session management, password handling              |
| Sensitive Data Exposure     | Secrets in code, logging PII, unencrypted data     |
| XML External Entities (XXE) | XML parsing configuration                          |
| Broken Access Control       | Authorization checks, IDOR vulnerabilities         |
| Security Misconfiguration   | Default credentials, verbose errors in prod        |
| Cross-Site Scripting (XSS)  | Output encoding, CSP headers                       |
| Insecure Deserialization    | Untrusted data deserialization                     |
| Using Vulnerable Components | Outdated dependencies with known CVEs              |
| Insufficient Logging        | Security events not logged, sensitive data in logs |

### Security - Additional Checks

- [ ] Hardcoded secrets or credentials
- [ ] Cross-Site Request Forgery (CSRF) protection
- [ ] Server-Side Request Forgery (SSRF) - URL validation
- [ ] Insecure cryptographic practices
- [ ] Input validation and sanitization at boundaries
- [ ] Rate limiting on sensitive endpoints
- [ ] Proper CORS configuration

### Performance

- [ ] N+1 query issues (database)
- [ ] Unnecessary database queries or API calls
- [ ] Missing indexes for query patterns
- [ ] Large payload sizes
- [ ] Blocking operations in async context
- [ ] Memory leaks (unclosed connections, event listeners)
- [ ] Inefficient algorithms or data structures

### API Design

- [ ] RESTful conventions followed
- [ ] Appropriate HTTP status codes
- [ ] Consistent error response format
- [ ] Request/response validation with Zod schemas
- [ ] OpenAPI documentation updated
- [ ] Breaking changes identified and documented

### Authentication & Authorization

- [ ] Authentication required where needed
- [ ] Authorization checks at handler level
- [ ] Session/token handling is secure
- [ ] API key validation for external APIs
- [ ] Organization-level access control verified

### Testing

- [ ] New code has appropriate test coverage
- [ ] Existing tests updated if behavior changed
- [ ] Edge cases tested
- [ ] Error paths tested
- [ ] Mocks used appropriately

### Maintainability

- [ ] Code is self-documenting or has necessary comments
- [ ] Complex logic explained
- [ ] No magic numbers/strings (use constants)
- [ ] Reusable utilities extracted where appropriate
- [ ] Changes don't introduce technical debt
- [ ] Changes to shared packages (`packages/*`) checked for cross-workspace impact

### Documentation

- [ ] README updated if needed
- [ ] API documentation updated
- [ ] Breaking changes documented
- [ ] Migration steps provided if needed

### Database (see [docs/database.md](../database.md))

- [ ] Naming conventions followed:
  - Models: PascalCase (`User`, `Organization`)
  - Fields: camelCase (`userId`, `createdAt`)
  - Tables: snake_case via `@@map("table_name")`
  - Columns: snake_case via `@map("column_name")`
- [ ] Migration is reversible (or rollback plan documented)
- [ ] Foreign key constraints and cascades are intentional
- [ ] Indexes added for new query patterns
- [ ] N+1 queries avoided (use `include` appropriately)
- [ ] Transaction boundaries correct for multi-step operations
- [ ] Optimistic locking for concurrent update scenarios
- [ ] No raw SQL without parameterization

### Operational

- [ ] Idempotency for mutating operations (POST/PUT)
- [ ] Timeouts configured for external service calls
- [ ] Retry logic with exponential backoff where appropriate
- [ ] Pagination implemented for list endpoints
- [ ] Rollback safety (can changes be reverted without data loss?)
- [ ] Graceful degradation if dependencies fail
- [ ] Health check endpoints updated if new dependencies added

### Compliance

- [ ] License headers present (if required by project)
- [ ] Third-party license compatibility verified
- [ ] No proprietary code in open-source files

## Review Output Format

Structure your review as:

```
## Summary
[1-2 sentence overview of the changes]

## Critical Issues (Must Fix)
- [Security/correctness issues that block merge]

## Improvements (Should Fix)
- [Performance, maintainability issues]

## Suggestions (Consider)
- [Style, minor enhancements]

## Questions
- [Clarifications needed before approving]
```
