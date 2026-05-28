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
- `packages/shared`: shared constants, schemas, types, and utilities.
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

## Development Notes

- Keep organization, project, team, and permission boundaries explicit in backend code.
- Use PostgreSQL for source-of-truth application data.
- Use ClickHouse only for analytics/event data that benefits from columnar queries.
- Use Redis for cacheable data, not as the source of truth.
- Use MinIO for file/object storage; store metadata and ownership in PostgreSQL.
- Prefer shared schemas/types in `packages/shared` when data crosses app boundaries.
- Keep API routes small and move reusable logic into focused modules.
- Keep frontend server state in TanStack Query and local UI state in Zustand.
- Do not add Docker services for the frontend or backend unless explicitly requested.
