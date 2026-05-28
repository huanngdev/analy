# Analy Code Rules

These rules apply to agent and developer changes in this repository. MUST FOLLOW ALL RULES

## Shared Source Of Truth

- Write all Drizzle table schemas in `packages/shared`.
- Write all shared TypeScript types in `packages/shared`.
- Write all shared Zod schemas in `packages/shared`.
- Do not duplicate DTOs, role names, permission names, or database schemas inside apps.
- Apps must import shared schemas and types from `@repo/shared`.

## Type Safety

- Do not use `any`.
- Prefer inferred types from Drizzle, Zod, and shared schemas.
- Use `unknown` for truly unknown input, then narrow it safely.
- Do not silence TypeScript errors with unsafe casts unless there is a clear reason and a safer alternative is not available.

## File Naming

- Use `kebab-case` for all file names, matching `apps/web/src/components/ui`.
- Examples: `button.tsx`, `alert-dialog.tsx`, `input-group.tsx`, `auth-service.ts`, `project-members.repository.ts`.
- Do not use `PascalCase`, `camelCase`, `snake_case`, or spaces in file names.
- React components should still export PascalCase component names from kebab-case files.
- Keep directory names lowercase and prefer `kebab-case` for multi-word directories.

## Backend

- Keep Hono handlers small.
- Put reusable logic into focused services, repositories, auth helpers, and authorization helpers.
- Validate requests with shared Zod schemas.
- Use Drizzle schemas from `@repo/shared` for database work.
- Use PostgreSQL as the source of truth, ClickHouse for analytics, Redis for cache/session state, and MinIO for object storage.
- Handle all backend errors through global error handling middleware.
- Do not duplicate try/catch response formatting in route handlers unless the handler can recover locally.
- Convert known domain failures into typed application errors with stable status codes and safe response messages.
- Never leak secrets, stack traces, SQL details, tokens, or internal service errors to API responses.
- Log unexpected backend errors with enough context to debug without exposing sensitive data.

## Backend Tests

- Add tests when creating or changing functions, services, repositories, endpoints, middleware, or permission-sensitive logic.
- Cover success, validation failure, unauthorized/forbidden access when relevant, missing resources, edge cases, and unexpected dependency failures.
- Test endpoint status codes and response bodies, not only implementation details.
- Test reusable functions directly and endpoint behavior through the HTTP layer when practical.
- Do not add untested backend behavior unless the change is trivial documentation or wiring.

## Frontend

- Split UI and logic.
- Do not put API calls, data mapping, auth refresh, permission logic, or business logic directly inside React components.
- Put query/mutation logic in hooks.
- Put local UI state in Zustand stores.
- Put HTTP clients and interceptors in `lib`.
- Put reusable render-only components in `components`.
- Use TanStack Query for server state and Zustand for local UI/session hints.
- Handle loading, empty, success, and error states explicitly in UI flows.
- Surface user-safe error messages in the UI; do not render raw backend errors or stack traces.
- Keep frontend error mapping in hooks, API clients, or small utilities instead of duplicating it inside components.
- Components should receive already-prepared state and callbacks from hooks whenever practical.
