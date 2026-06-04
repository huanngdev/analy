# Analy Agent Guide

## Agent Skill Usage

These instructions apply to Codex, opencode, and any other agent that reads this repository guide.

- Before starting non-trivial work, consider whether an available skill applies.
- Use relevant skills proactively, but do not load unrelated skills just because they exist.
- Use `code-reviewer` for reviews, audits, security, performance, or PR checks.
- Use `fullstack-developer` for API, frontend, database, React, Hono, Drizzle, TanStack Query, or full-stack implementation.
- Use `shadcn` for shadcn/ui, `components.json`, UI primitives, or component styling.
- Use `ux-designer` for UX, flows, wireframes, usability, copy, layout, or design strategy.
- Use `project-planner` for roadmaps, task breakdowns, milestones, and project planning.
- Use `karpathy-guidelines` when writing, reviewing, or refactoring code.
- Use `customize-opencode` only for opencode config, agents, skills, plugins, MCP, or permissions.
- Use `find-skills` when the user asks to find or install additional skills.

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
- `packages/shared/src/validation`: Zod validation schemas for requests, responses, forms, and environment contracts.
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

- Keep `apps/api/src/index.ts` as the runtime entrypoint only.
- Keep `apps/api/src/server/app.ts` focused on Hono app composition: middleware, docs, system routes, and feature route mounting.
- Put Hono app bindings, OpenAPI setup/helpers, and system routes in `apps/api/src/server`.
- Put environment loading in `apps/api/src/config`.
- Put infrastructure clients, logger, reusable adapters, and error helpers in `apps/api/src/lib`.
- Put app-wide Hono middleware in `apps/api/src/middleware`.
- Put domain work in `apps/api/src/features/<feature>`.
- Keep Hono route handlers small.
- Move reusable business logic into focused modules such as services, repositories, auth helpers, and ownership helpers inside the owning feature.
- Reuse functions across routes instead of copying query/auth/validation logic.
- Validate request input with shared Zod schemas from `@repo/shared`.
- Use Drizzle schemas from `@repo/shared` for all PostgreSQL operations.
- Keep Hono `Context` usage in route/request helper modules. Services should accept explicit inputs like `userId`, params, and validated payloads.
- Keep OpenAPI route metadata beside route definitions, but share common OpenAPI helpers instead of duplicating response/body builders.
- Keep PostgreSQL as the source of truth for application data.
- Use ClickHouse only for analytics/event workloads that benefit from columnar storage.
- Use Redis only for cache, rate limits, and refresh sessions.
- Use MinIO for future object storage, but store object metadata and user/project ownership in PostgreSQL.

Recommended API layout:

- `apps/api/src/index.ts`: runtime startup and dependency readiness checks.
- `apps/api/src/server`: app composition, app bindings, API docs, OpenAPI helpers, and system routes.
- `apps/api/src/config`: environment parsing and configuration.
- `apps/api/src/lib`: database/Redis clients, logger, errors, and reusable infrastructure helpers.
- `apps/api/src/middleware`: app-wide Hono middleware.
- `apps/api/src/features/<feature>/<feature>-routes.ts`: Hono/OpenAPI routes for a feature.
- `apps/api/src/features/<feature>/<feature>-service.ts`: business logic and ownership-scoped operations.
- `apps/api/src/features/<feature>/<feature>-repository.ts`: reusable database queries when service files become too large or query reuse appears.

## Frontend Code Rules

- Split UI and logic.
- Components should render UI and wire events only.
- Do not put API calls, data mapping, auth rotation, ownership checks, or complex business logic directly inside React components.
- Put route-level screens and layouts in `features/<feature>/pages`.
- Put feature-specific reusable UI in `features/<feature>/components`.
- Put app-wide reusable UI in `components`.
- Treat `components/ui` as the shadcn-owned primitive layer. Do not put feature code there, and do not edit it unless the task explicitly requires changing a primitive.
- Put server-state logic in hooks backed by TanStack Query.
- Put local UI state in Zustand stores.
- Put the shared Axios client/interceptors in `lib`.
- Put feature API wrappers in `features/<feature>/api`.
- Put pure reusable helpers in shared utilities when safe for both API and web, otherwise app-local `lib` modules.
- Keep forms validated with shared Zod schemas when data is sent to the API.
- Keep root route declarations in `apps/web/src/routes`. Do not define nested `<Routes>` inside pages or feature components; use route children and `Outlet` for layouts.
- Page files may read route params, set document titles, call feature hooks, and pass data/actions into components.
- Hooks own query keys, TanStack Query calls, mutations, debounced URL state, toasts, and navigation side effects.
- Feature API wrappers should only translate typed inputs to HTTP requests and return typed response data.
- When a list endpoint supports search/filter/sort, keep that state in the URL and send it to the API. Do not client-filter server collections unless the data is explicitly local-only.

Recommended web layout:

- `apps/web/src/components/ui`: primitive/reusable UI components.
- `apps/web/src/components`: app-wide shell, screens, branding, and reusable non-feature components.
- `apps/web/src/routes`: root router and route-level router composition only.
- `apps/web/src/features/<feature>/pages`: feature route pages and layouts.
- `apps/web/src/features/<feature>/components`: feature-specific UI components.
- `apps/web/src/features/<feature>/hooks`: feature-specific hooks for queries, mutations, and UI orchestration.
- `apps/web/src/features/<feature>/api`: feature API wrappers when needed.
- `apps/web/src/features/<feature>/constants`: feature-specific constants and route metadata.
- `apps/web/src/providers`: app provider composition and bootstrap providers.
- `apps/web/src/stores`: Zustand stores.
- `apps/web/src/lib`: Axios client, query client, and app-only utilities.

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
- Put Drizzle schemas, shared validation schemas, and shared types in `packages/shared`.
- Keep API routes small and move reusable logic into focused modules.
- Keep frontend server state in TanStack Query and local UI state in Zustand.
- Keep React components free of business logic; move reusable logic into hooks, stores, API clients, or shared utilities.
- Do not add Docker services for the frontend or backend unless explicitly requested.
