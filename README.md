# Analy

Analy is an open-source unified analytics platform built as a modern TypeScript monorepo. It is designed for developers who want one product surface to collect, manage, and understand analytics for anything they ship — without wiring up a separate tool for every channel.

This repository is also maintained as a portfolio project for my CV. It demonstrates full-stack product engineering with a typed API, shared validation contracts, authentication, local infrastructure, and a scalable monorepo architecture.

## What Analy Does

Analy provides the foundation for a developer analytics platform:

- Create user accounts and sign in with email/password, GitHub, or Google.
- Manage authenticated sessions with secure cookies, short-lived access tokens, and refresh token rotation.
- Bring your trackable sources into one dashboard: shortened links, blogs and pages, forms, and custom events.
- Measure clicks, views, submissions, and event streams from a single control panel.
- Share validation contracts, constants, and types across the frontend and backend.
- Run a local development stack with PostgreSQL, Redis, ClickHouse, and MinIO.

## Product Vision

Analy aims to become the simplest way for developers, indie hackers, startups, small teams, freelancers, and students to understand what their audience actually does — across every surface they own.

Developers should not need separate accounts, dashboards, and SDKs for link analytics, blog/page analytics, form conversions, and product events. Analy should provide a consistent control panel where any source — a shortened link, a blog post, a form, or a custom event stream — can be tracked and analyzed the same way.

The product goal is to hide measurement complexity so users can focus on building products and acting on the numbers.

## Current Features

- React web app with landing, login, register, and dashboard routes.
- Hono API with OpenAPI route definitions and Scalar API documentation.
- Email/password registration and login.
- GitHub and Google OAuth flows.
- JWT access tokens and refresh sessions.
- Redis-backed refresh session handling.
- PostgreSQL schema managed with Drizzle ORM.
- Shared Zod schemas and inferred TypeScript types in `@repo/shared`.
- Centralized validation for API and web environment variables.
- Dashboard shell with sidebar sections for Links, Blogs, Forms, and Events (UI placeholders, ready to build on).
- Docker Compose infrastructure for local development services.
- Turbo-powered workspace scripts for development, builds, linting, and typechecking.

## Planned Product Features

- Link shortener with click analytics (clicks, referrers, geo, devices).
- Blog and page view analytics with traffic sources and trends.
- Form submission tracking and conversion analytics.
- A flexible "track anything" custom event pipeline.
- Unified dashboards that compare performance across every source.
- Shareable reports and exportable data.
- Real-time event streaming for high-volume sources.
- Alerts and goals driven by the metrics that matter.

## Tech Stack

### Frontend

- Vite
- React 19
- React Router
- TanStack Query
- Axios
- Zustand
- Tailwind CSS
- shadcn/ui-style component primitives

### Backend

- Bun
- Hono
- Hono OpenAPI / Zod OpenAPI
- Drizzle ORM
- PostgreSQL
- Redis
- JWT with `jose`
- Password hashing with `@node-rs/argon2`
- OAuth with `arctic`

### Infrastructure

- PostgreSQL for application data
- Redis for refresh sessions, caching, and rate limits
- ClickHouse for high-volume analytics/event workloads
- MinIO for S3-compatible object storage
- Docker Compose for local services

## Monorepo Structure

```txt
apps/
  api/        Hono API, auth flows, middleware, OpenAPI docs
  web/        Vite React client and dashboard UI
packages/
  shared/     Zod schemas, Drizzle schemas, constants, shared types
  ts-config/  Shared TypeScript configuration
  eslint-config/ Shared ESLint configuration
```

## Getting Started

### Requirements

- Bun `1.3.14` or newer
- Docker and Docker Compose

### Install Dependencies

```sh
bun install
```

### Configure Environment

Create API and web environment files before running the apps.

`apps/api/.env`:

```env
NODE_ENV=development
PORT=5000
API_PUBLIC_URL=http://localhost:5000
WEB_APP_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
DATABASE_URL=postgresql://analy:analy_password@localhost:5432/analy
REDIS_URL=redis://:redis_password@localhost:6379
ACCESS_TOKEN_SECRET=replace-with-at-least-32-characters
REFRESH_TOKEN_SECRET=replace-with-at-least-32-characters
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

`apps/web/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Root `.env` for Docker Compose:

```env
POSTGRES_DB=analy
POSTGRES_USER=analy
POSTGRES_PASSWORD=analy_password
POSTGRES_PORT=5432
REDIS_PASSWORD=redis_password
REDIS_PORT=6379
CLICKHOUSE_DB=analy_events
CLICKHOUSE_USER=analy
CLICKHOUSE_PASSWORD=clickhouse_password
CLICKHOUSE_HTTP_PORT=8123
CLICKHOUSE_NATIVE_PORT=9000
MINIO_ROOT_USER=analy_minio
MINIO_ROOT_PASSWORD=minio_password
MINIO_API_PORT=9002
MINIO_CONSOLE_PORT=9003
```

### Start Local Infrastructure

```sh
bun run infra:up
```

### Run The Apps

```sh
bun run dev
```

By default:

- Web app: `http://localhost:3000`
- API: `http://localhost:5000`
- API health check: `http://localhost:5000/health`

## Useful Scripts

- `bun run dev` starts the web app, API, and shared package watcher through Turbo.
- `bun run dev:web` starts only the frontend.
- `bun run dev:api` starts only the backend.
- `bun run build` builds all workspaces.
- `bun run typecheck` typechecks all workspaces.
- `bun run lint` lints all workspaces.
- `bun run format` formats the repository with Prettier.
- `bun run db:studio` opens Drizzle Studio.
- `bun run infra:up` starts local services.
- `bun run infra:down` stops local services.

## Architecture Notes

Analy keeps cross-app contracts in `packages/shared` so the frontend and backend use the same source of truth for database models, request validation, response validation, constants, and TypeScript types.

The backend keeps authentication and user ownership checks close to the operation being protected, while the frontend keeps API access, auth state, and UI composition separated. This keeps the codebase ready for the analytics sources, ingestion endpoints, dashboards, reports, and alerting features as the product grows.

## Roadmap

- Link shortener with click analytics
- Blog and page view analytics
- Form submission and conversion analytics
- Custom event ingestion and exploration
- Unified cross-source dashboards
- Shareable reports and data export
- Real-time event streaming
- Alerts, goals, and usage dashboards
- Ownership boundary tests and production deployment guides

## License

This project is being prepared for open-source release. A license file will be added before the first public release.
