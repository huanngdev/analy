# Analy Agent Guide

## Product

Analy is a workspace and analytics platform.

Users can create organizations, create projects inside those organizations, manage team members, and control permissions. Inside a project, users can create and manage links, forms, events, and uploaded files. These features are intended to work together as one product surface, not as separate apps.

## Core Concepts

- Organization: top-level workspace owned or managed by users.
- Project: belongs to an organization and groups links, forms, events, files, and analytics.
- Team: users invited to an organization or project.
- Permissions: access control for team members and project resources.
- Links: trackable or managed links created inside projects.
- Forms: project-owned forms for collecting user input.
- Events: analytics or product events associated with links, forms, files, or user actions.
- Files: uploaded assets stored through object storage.

## Architecture

This is a Turborepo monorepo with a Vite client, a Hono API, and shared internal packages.

- `apps/web`: frontend client.
- `apps/api`: backend API.
- `packages/shared`: shared constants, Drizzle schemas, Zod schemas, generated/inferred types, and reusable cross-app utilities.
- `packages/eslint-config`: shared ESLint configs.
- `packages/ts-config`: shared TypeScript configs.

## Stack

Frontend:

- Vite
- React
- shadcn/ui
- TanStack Query
- Axios
- Zustand

Backend:

- Hono
- Drizzle ORM
- PostgreSQL
- Redis
- ClickHouse
- MinIO

Infrastructure:

- PostgreSQL is the main relational database.
- ClickHouse stores analytics data and event-style reporting data.
- Redis caches heavy or frequently accessed data.
- MinIO stores uploaded files and S3-compatible objects.

## Shared Package Rules

`packages/shared` is the source of truth for data structures that cross app boundaries.

- Put all Drizzle PostgreSQL table schemas in `packages/shared`.
- Put all shared TypeScript types in `packages/shared`.
- Put all shared Zod request/response schemas in `packages/shared`.
- Export inferred types from schemas instead of redefining duplicate DTOs in apps.
- API code should import database schemas/types from `@repo/shared`.
- Web code should import API-facing types and validation schemas from `@repo/shared`.
- Keep app-only implementation details inside the app that owns them.
- Do not duplicate table definitions, request DTOs, response DTOs, role names, or permission names inside `apps/api` or `apps/web`.

Recommended shared layout:

- `packages/shared/src/db/schema`: Drizzle table schemas and relations.
- `packages/shared/src/schemas`: Zod validation schemas for requests, responses, forms, and environment contracts.
- `packages/shared/src/types`: exported domain types, inferred schema types, auth/session types, and API response types.
- `packages/shared/src/constants`: roles, permissions, cookie names, token TTLs, route constants, and storage constants.
- `packages/shared/src/utils`: pure reusable helpers that are safe in both API and web runtimes.

## Authentication

Authentication rules live in `guide/1-authentication.md`. Follow that guide for token TTLs, cookie rules, Redis refresh sessions, `/auth/me`, `/auth/rotate-token`, Zustand hydration, Axios refresh behavior, and OAuth provider login.

## Authorization

Use RBAC with explicit resource scoping. Do not rely only on frontend checks.

- System roles: `admin`, `regular`.
- System `admin` can perform platform-level administration only where explicitly allowed.
- System `regular` has no implicit organization/project power.
- Organization/project permissions must come from memberships and assigned roles.
- Every protected API route must check authentication first and authorization second.
- Every project-owned resource query must scope by `organizationId` and `projectId` where applicable.
- Never authorize by resource id alone.
- Keep authorization checks server-side and close to the operation being protected.
- Centralize reusable permission helpers in focused API modules while keeping role/permission constants in `packages/shared`.
- Return `401` for unauthenticated requests and `403` for authenticated users without permission.
- Prefer deny-by-default permission checks.
- Add tests for permission boundaries when implementing protected resources.

Recommended RBAC model:

- `roles`: role definitions scoped by system, organization, or project.
- `permissions`: stable permission keys such as `project.read`, `project.update`, `link.create`, `form.read`, `file.delete`.
- `role_permissions`: permissions assigned to each role.
- `memberships`: user membership in organization or project with assigned role.
- `resource ownership`: every resource stores its organization/project ownership in PostgreSQL.

## Backend Code Rules

- Keep Hono route handlers small.
- Move reusable business logic into focused modules such as services, repositories, and auth/authorization helpers.
- Reuse functions across routes instead of copying query/auth/validation logic.
- Validate request input with shared Zod schemas from `@repo/shared`.
- Use Drizzle schemas from `@repo/shared` for all PostgreSQL operations.
- Keep PostgreSQL as the source of truth for application data.
- Use ClickHouse only for analytics/event workloads that benefit from columnar storage.
- Use Redis only for cache, rate limits, and refresh sessions.
- Use MinIO for objects, but store file metadata, ownership, and permissions in PostgreSQL.

## Frontend Code Rules

- Split UI and logic.
- Components should render UI and wire events only.
- Do not put API calls, data mapping, auth rotation, permission logic, or complex business logic directly inside React components.
- Put reusable UI in components.
- Put server-state logic in hooks backed by TanStack Query.
- Put local UI state in Zustand stores.
- Put API clients/interceptors in dedicated lib files.
- Put pure reusable helpers in shared utilities when safe for both API and web, otherwise app-local `lib` modules.
- Keep forms validated with shared Zod schemas when data is sent to the API.

Recommended web layout:

- `apps/web/src/components/ui`: primitive/reusable UI components.
- `apps/web/src/features/<feature>/components`: feature-specific UI components.
- `apps/web/src/features/<feature>/hooks`: feature-specific hooks for queries, mutations, and UI orchestration.
- `apps/web/src/features/<feature>/api`: feature API wrappers when needed.
- `apps/web/src/stores`: Zustand stores.
- `apps/web/src/lib`: Axios client, auth bootstrap, query client, and app-only utilities.

## Library Guidance

- Drizzle ORM: PostgreSQL schema, relations, migrations, and typed database queries.
- Zod: runtime validation for input, output, forms, and environment variables.
- Hono: API routing, middleware composition, and HTTP handling.
- TanStack Query: server state, caching, invalidation, queries, and mutations.
- Axios: browser HTTP client and auth refresh interceptor behavior.
- Zustand: local UI state and persisted safe auth hints.
- `jose`: JWT signing and verification for access tokens.
- `@node-rs/argon2`: password hashing and verification.
- `arctic`: OAuth provider flows for GitHub and Google.
- Redis client: refresh sessions, cache, rate limits, and short-lived coordination only.

## Development Notes

- Keep organization, project, team, and permission boundaries explicit in backend code.
- Use PostgreSQL for source-of-truth application data.
- Use ClickHouse only for analytics/event data that benefits from columnar queries.
- Use Redis for cacheable data, not as the source of truth.
- Use MinIO for file/object storage; store metadata and ownership in PostgreSQL.
- Put Drizzle schemas, shared schemas, and shared types in `packages/shared`.
- Keep API routes small and move reusable logic into focused modules.
- Keep frontend server state in TanStack Query and local UI state in Zustand.
- Keep React components free of business logic; move reusable logic into hooks, stores, API clients, or shared utilities.
- Do not add Docker services for the frontend or backend unless explicitly requested.
