// Shared Playwright fixtures available to all E2E suites.
// Extend the base test with common fixtures here.
//
// Usage in suite-specific fixtures:
//   import { test as base } from "../../shared/fixtures";
//   export const test = base.extend<{ ... }>({ ... });

export { test, expect } from '@playwright/test'
