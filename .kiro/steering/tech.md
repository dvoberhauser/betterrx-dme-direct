# Technical steering

The current application is vanilla HTML, CSS, and JavaScript with no runtime dependencies. Treat it as an executable specification.

Before refactoring, run `npm run validate`. Keep new rules deterministic and testable. Separate domain rules from rendering and browser storage. Prefer typed models, explicit state transitions, accessible semantic controls, and small modules with one domain responsibility.

Production work must add secure authentication, organization scoping, server-side authorization, immutable audit history, encrypted persistence, API validation, observability, backup/recovery, and automated security/accessibility testing. Browser-local storage is demo-only.
