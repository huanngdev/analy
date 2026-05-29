# Analy Agent Guide

## Product

Analy is a unified database cloud for developers.

Each user owns projects and the infrastructure services attached to those projects. Users can provision, manage, monitor, and access databases, caches, analytics engines, storage services, and future infrastructure resources from one dashboard without organization or team scopes.

## Core Concepts

- User: the authenticated owner of all projects and infrastructure resources they create.
- Project: a user-owned grouping for provisioned infrastructure.
- Service: a managed infrastructure service inside a project, such as PostgreSQL, Redis, ClickHouse, object storage, or a message queue.
- Credentials: connection strings, passwords, access keys, and other secrets used to access provisioned services.
- Monitoring: CPU, memory, storage, network, and usage metrics for provisioned services.
- Backups: scheduled snapshots, retention policies, restore points, and disaster recovery workflows for supported services.

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

- PostgreSQL is the main relational database and an initial provisionable service target.
- Redis stores refresh sessions and cache data, and is an initial provisionable service target.
- ClickHouse is planned for analytics and event-style reporting workloads.
- MinIO is planned for S3-compatible object storage workflows.

## Shared Package Rules

`packages/shared` is the source of truth for data structures that cross app boundaries.

- Put all Drizzle PostgreSQL table schemas in `packages/shared`.
- Put all shared TypeScript types in `packages/shared`.
- Put all shared Zod request/response schemas in `packages/shared`.
- Export inferred types from schemas instead of redefining duplicate DTOs in apps.
- API code should import database schemas/types from `@repo/shared`.
- Web code should import API-facing types and validation schemas from `@repo/shared`.
- Keep app-only implementation details inside the app that owns them.
- Do not duplicate table definitions, request DTOs, response DTOs, service types, project ownership rules, or provisioning constants inside `apps/api` or `apps/web`.

Recommended shared layout:

- `packages/shared/src/db/schema`: Drizzle table schemas and relations.
- `packages/shared/src/schemas`: Zod validation schemas for requests, responses, forms, and environment contracts.
- `packages/shared/src/types`: exported domain types, inferred schema types, auth/session types, and API response types.
- `packages/shared/src/constants`: auth constants, cookie names, token TTLs, route constants, service type constants, provisioning constants, and storage constants.
- `packages/shared/src/utils`: pure reusable helpers that are safe in both API and web runtimes.

## Authentication

Authentication rules live in `guide/1-authentication.md`. Follow that guide for token TTLs, cookie rules, Redis refresh sessions, `/auth/me`, `/auth/rotate-token`, Zustand hydration, Axios refresh behavior, and OAuth provider login.

## Resource Ownership

Use explicit user-owned resource scoping. Do not rely only on frontend checks.

- Every protected API route must authenticate the user first.
- Every user-owned resource must store `userId` in PostgreSQL.
- Project-owned resources must store `projectId` and remain scoped to the authenticated user.
- Service-owned resources must also store `serviceId` when they belong under a provisioned service.
- Every user-owned resource query must scope by `userId` and, where applicable, `projectId` and `serviceId`.
- Never authorize by resource id alone.
- Keep ownership checks server-side and close to the operation being protected.
- Return `401` for unauthenticated requests and `404` or `403` for resources outside the authenticated user's ownership, depending on endpoint semantics.
- Prefer deny-by-default ownership checks.
- Add tests for ownership boundaries when implementing protected resources.

Recommended ownership model:

- `users`: authenticated accounts that own resources.
- `projects`: user-owned containers for provisioned infrastructure.
- `services`: project-owned provisioned infrastructure instances.
- `credentials`, `backups`, `metrics`, `usage_records`: user-owned resources scoped to a project and service when applicable.
- `resource ownership`: every protected resource stores enough ownership columns to scope queries by authenticated user.

## Backend Code Rules

- Keep Hono route handlers small.
- Move reusable business logic into focused modules such as services, repositories, auth helpers, and ownership helpers.
- Reuse functions across routes instead of copying query/auth/validation logic.
- Validate request input with shared Zod schemas from `@repo/shared`.
- Use Drizzle schemas from `@repo/shared` for all PostgreSQL operations.
- Keep PostgreSQL as the source of truth for application data.
- Use ClickHouse only for analytics/event workloads that benefit from columnar storage.
- Use Redis only for cache, rate limits, and refresh sessions.
- Use MinIO for future object storage, but store object metadata and user/project ownership in PostgreSQL.

## Frontend Code Rules

- Split UI and logic.
- Components should render UI and wire events only.
- Do not put API calls, data mapping, auth rotation, ownership checks, or complex business logic directly inside React components.
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

- Keep user, project, and service ownership boundaries explicit in backend code.
- Use PostgreSQL for source-of-truth application data.
- Use ClickHouse only for analytics, event, and usage data that benefits from columnar queries.
- Use Redis for cacheable data, not as the source of truth.
- Use MinIO for file/object storage; store metadata and user/project ownership in PostgreSQL.
- Put Drizzle schemas, shared schemas, and shared types in `packages/shared`.
- Keep API routes small and move reusable logic into focused modules.
- Keep frontend server state in TanStack Query and local UI state in Zustand.
- Keep React components free of business logic; move reusable logic into hooks, stores, API clients, or shared utilities.
- Do not add Docker services for the frontend or backend unless explicitly requested.
