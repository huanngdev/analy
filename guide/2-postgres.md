# PostgreSQL Feature PRD

This PRD is the source of truth for the first Analy PostgreSQL service feature. The goal is to let an authenticated user create, manage, and connect to a PostgreSQL instance from the dashboard while keeping local development light enough to run inside WSL.

## Summary

Analy should support user-owned PostgreSQL instances as the first provisionable database service.

Users can create a PostgreSQL instance by choosing a project, instance name, PostgreSQL version, database name, username, password, and a predefined hardware profile. After provisioning, the user can view connection details, health, resource limits, lifecycle state, and basic management actions.

Initial provisioning is development/local-first. Instances should be strong enough for realistic application queries and light enough for a developer machine running WSL.

## Goals

- Allow an authenticated user to create a PostgreSQL instance from the web dashboard.
- Store all PostgreSQL service metadata in the main application PostgreSQL database.
- Run provisioned PostgreSQL instances with bounded CPU, memory, and storage limits.
- Support multiple PostgreSQL versions through a controlled allowlist.
- Generate safe connection details for the user after provisioning.
- Keep ownership checks explicit: users can only access their own projects and services.
- Design the feature so local Docker provisioning can later be replaced by a production orchestrator.

## Non-Goals

- Multi-node PostgreSQL clusters.
- Read replicas.
- High availability failover.
- Point-in-time recovery.
- Public cloud provisioning.
- Team or organization access control.
- Advanced monitoring dashboards beyond basic health and resource state.
- In-browser SQL editor.
- Automatic query optimization.

## User Story

As an authenticated user, I want to create a PostgreSQL database instance for one of my projects, choose a PostgreSQL version and basic credentials, then copy a connection string so I can use it in my application.

## Primary User Flow

1. User opens `/dashboard/services/postgresql`.
2. User clicks `Create PostgreSQL Instance`.
3. User selects a project or creates one if no project exists.
4. User fills the instance creation form.
5. API validates ownership, input, version, resource profile, and unique service name inside the project.
6. API creates a service record with `provisioning` status.
7. Provisioner creates the PostgreSQL runtime instance with resource limits.
8. API stores generated connection metadata and encrypted/hashed secret material where appropriate.
9. UI shows the instance status as `Starting`.
10. When the instance is healthy, UI shows `Ready` and displays connection details.

## Create Instance Fields

Required fields:

- `projectId`: the user-owned project where the instance belongs.
- `name`: human-readable instance name, unique within the project.
- `postgresVersion`: allowlisted PostgreSQL version.
- `databaseName`: initial database to create.
- `username`: initial database user.
- `password`: initial database password.
- `hardwareProfile`: predefined CPU, memory, and storage profile.

Optional fields for first release:

- `description`: short user-facing note for the instance.
- `port`: only for local development if the user wants a fixed host port. Default should be auto-assigned to avoid collisions.

Validation rules:

- `name`: 3-48 characters, lowercase letters, numbers, and hyphens only, must start with a letter, must not end with a hyphen.
- `databaseName`: 1-63 characters, lowercase letters, numbers, and underscores only, must start with a letter.
- `username`: 1-63 characters, lowercase letters, numbers, and underscores only, must start with a letter, must not be `postgres`, `root`, `admin`, or `analy`.
- `password`: 16-128 characters, must contain at least one lowercase letter, one uppercase letter, one number, and one symbol.
- `postgresVersion`: must be in the allowlist.
- `hardwareProfile`: must be in the allowlist.
- `projectId`: must belong to the authenticated user.

## PostgreSQL Versions

Initial allowlist:

- PostgreSQL 17.
- PostgreSQL 16.
- PostgreSQL 15.

Default version:

- PostgreSQL 17.

Rules:

- Do not accept arbitrary image tags from the user.
- Store the exact resolved image tag used for provisioning.
- Version upgrades are out of scope for the first release.

## Hardware Profiles

Use predefined profiles instead of arbitrary CPU and memory input. This keeps the product simple, avoids unsafe host usage, and makes local WSL behavior predictable.

Initial profiles:

| Profile        | CPU Limit | Memory Limit | Storage Limit | Purpose                                                        |
| -------------- | --------: | -----------: | ------------: | -------------------------------------------------------------- |
| `dev-light`    |  0.50 CPU |       512 MB |          1 GB | Small apps, smoke tests, demos.                                |
| `dev-standard` |  1.00 CPU |         1 GB |          3 GB | Default. Handles realistic queries while staying WSL-friendly. |
| `dev-power`    |  2.00 CPU |         2 GB |          5 GB | Heavier local queries on stronger machines.                    |

Default profile:

- `dev-standard`.

Hard local safety limits:

- Maximum one `dev-power` instance running per user in local development.
- Maximum three running PostgreSQL instances total in local development.
- API should reject create/start operations that exceed configured local capacity.
- Stopped instances should keep metadata and persistent volume data.

WSL recommendation:

- `dev-standard` should be the product default because it is usable for moderate joins, indexes, and application workloads without overwhelming a typical WSL Docker setup.

## Runtime Architecture

First release provisioning target:

- Docker container per PostgreSQL instance.
- Docker named volume per PostgreSQL instance for data persistence.
- Docker network shared by provisioned services where needed.
- Host port auto-assigned unless the user explicitly chooses a valid available port.

Container rules:

- Container name should be deterministic and include the service id, not raw user input only.
- Apply CPU and memory limits from the selected hardware profile.
- Mount a dedicated data volume for `/var/lib/postgresql/data`.
- Use official PostgreSQL images from the version allowlist.
- Do not expose containers without an explicit mapped port.
- Health check should verify PostgreSQL readiness with `pg_isready`.

Provisioning boundary:

- Route handlers should not call Docker directly.
- API routes call a PostgreSQL service module.
- Service module validates ownership and input, creates metadata, and enqueues or invokes provisioning.
- Provisioner module owns Docker-specific behavior.
- Keep Docker implementation replaceable by a future production orchestrator.

## Data Model

All shared Drizzle schemas belong in `packages/shared`.

Recommended tables:

- `projects`: user-owned project container if not already implemented.
- `services`: generic provisioned service metadata.
- `postgres_instances`: PostgreSQL-specific settings and runtime metadata.
- `credentials`: credential metadata and encrypted secret references.
- `service_events`: lifecycle audit events for provisioning, start, stop, restart, and delete.

`services` should include:

- `id`.
- `userId`.
- `projectId`.
- `type`: `postgresql`.
- `name`.
- `description`.
- `status`: `provisioning`, `starting`, `ready`, `stopping`, `stopped`, `failed`, `deleting`.
- `createdAt`.
- `updatedAt`.

`postgres_instances` should include:

- `id`.
- `userId`.
- `projectId`.
- `serviceId`.
- `postgresVersion`.
- `imageTag`.
- `databaseName`.
- `username`.
- `hardwareProfile`.
- `cpuLimit`.
- `memoryMb`.
- `storageMb`.
- `host`.
- `port`.
- `containerId`.
- `containerName`.
- `volumeName`.
- `lastHealthStatus`.
- `lastHealthCheckedAt`.
- `createdAt`.
- `updatedAt`.

Credential rules:

- Never return passwords in list responses.
- Show generated connection strings only after create or through an explicit reveal endpoint.
- Store secrets encrypted if they must be retrievable.
- Prefer separate credential records instead of embedding secrets in `postgres_instances`.
- Audit credential reveal events.

## API Design

All protected routes must authenticate first and scope every query by `userId`.

Recommended endpoints:

- `GET /postgres/versions`: list supported PostgreSQL versions.
- `GET /postgres/hardware-profiles`: list allowed hardware profiles.
- `POST /projects/:projectId/postgres`: create a PostgreSQL instance.
- `GET /projects/:projectId/postgres`: list PostgreSQL instances in a project.
- `GET /projects/:projectId/postgres/:serviceId`: get one PostgreSQL instance.
- `POST /projects/:projectId/postgres/:serviceId/start`: start a stopped instance.
- `POST /projects/:projectId/postgres/:serviceId/stop`: stop a running instance.
- `POST /projects/:projectId/postgres/:serviceId/restart`: restart an instance.
- `DELETE /projects/:projectId/postgres/:serviceId`: delete instance and optionally its volume.
- `POST /projects/:projectId/postgres/:serviceId/credentials/reveal`: reveal connection details after explicit user action.

Create response should include:

- Service id.
- Project id.
- Name.
- Status.
- PostgreSQL version.
- Hardware profile.
- Host and port when available.
- Initial connection details only when safe to reveal immediately.

Error rules:

- `401` when unauthenticated.
- `404` when the project or service does not belong to the user.
- `409` when service name or port conflicts.
- `422` when capacity limits are exceeded.
- `500` only for unexpected provisioning failures with a safe public message.

## Frontend Design

PostgreSQL page sections:

- Header with PostgreSQL logo, title, and description.
- Primary action: `Create PostgreSQL Instance`.
- Instance list grouped by project or filtered by selected project.
- Empty state explaining what PostgreSQL is and how to create the first instance.
- Status badges for `Provisioning`, `Ready`, `Stopped`, and `Failed`.

Create modal/form fields:

- Project selector.
- Instance name.
- Description.
- PostgreSQL version selector.
- Hardware profile selector with CPU, memory, and storage explanation.
- Database name.
- Username.
- Password input with generate button.
- Optional advanced section for fixed local port.

Instance detail view:

- Status and health.
- Connection details.
- Hardware profile.
- PostgreSQL version.
- Project ownership context.
- Lifecycle actions: start, stop, restart, delete.
- Recent service events.

Connection detail fields:

- Host.
- Port.
- Database.
- Username.
- Password reveal action.
- Connection URL.
- `psql` command.

## Security Requirements

- Every route must use auth middleware.
- Every read and write must scope by `userId`, `projectId`, and `serviceId` where applicable.
- Do not authorize by `serviceId` alone.
- Never accept Docker image names, volume names, or container names from the user.
- Never log raw passwords or connection URLs containing passwords.
- Keep database passwords out of browser state unless the user explicitly reveals them.
- Use server-side validation from shared Zod schemas.
- Sanitize names before using them in infrastructure identifiers.
- Keep container access local by default in development.

## Monitoring And Health

First release health states:

- `unknown`: no health check result yet.
- `healthy`: PostgreSQL accepts connections.
- `unhealthy`: PostgreSQL container exists but readiness check fails.
- `stopped`: container is intentionally stopped.
- `missing`: expected container or volume cannot be found.

Basic metrics for first release:

- Container running state.
- Health check status.
- CPU profile limit.
- Memory profile limit.
- Storage profile limit.
- Last health checked timestamp.

Detailed query analytics, slow query logs, and historical graphs are future work.

## Lifecycle Behavior

Create:

- Create metadata first with `provisioning` status.
- Provision Docker container and volume.
- Run readiness check.
- Mark service `ready` when PostgreSQL accepts connections.
- Mark service `failed` with a safe failure reason if provisioning fails.

Stop:

- Stop the container.
- Keep the volume.
- Mark service `stopped`.

Start:

- Recreate container from existing metadata and volume if needed.
- Reapply resource limits.
- Mark service `ready` after health check passes.

Restart:

- Stop and start the same instance.
- Keep credentials and volume unchanged.

Delete:

- Default behavior should ask whether to delete data volume.
- If volume is deleted, credentials should be revoked and instance should not be recoverable.
- Delete should be asynchronous if Docker cleanup can take time.

## Capacity Rules

Local development should protect the host machine.

Default local capacity limits:

- Maximum running PostgreSQL instances: 3.
- Maximum total PostgreSQL CPU limit: 3 CPU.
- Maximum total PostgreSQL memory limit: 3 GB.
- Maximum total PostgreSQL storage allocation: 10 GB.

Create and start operations should calculate current running PostgreSQL usage before provisioning. If the requested instance exceeds capacity, the API should reject the request with a clear message explaining the limit.

## Acceptance Criteria

- Authenticated user can create a PostgreSQL instance from the dashboard.
- User can choose PostgreSQL 15, 16, or 17.
- User can choose `dev-light`, `dev-standard`, or `dev-power` hardware profile.
- User can set instance name, database name, username, and password.
- API rejects invalid names, weak passwords, unsupported versions, unsupported hardware profiles, and duplicate service names.
- API rejects project and service access outside the authenticated user's ownership.
- Provisioned instance starts with the selected PostgreSQL version.
- Provisioned instance enforces the selected CPU and memory limits.
- User can copy connection details after the instance is ready.
- User can stop, start, restart, and delete the instance.
- Stopped instance keeps its data volume.
- Deleted instance can remove its data volume after explicit confirmation.
- Lint and typecheck pass for changed frontend, API, and shared packages.

## Implementation Phases

Phase 1: Product shell

- PostgreSQL page header.
- Empty state.
- Create instance form UI.
- Static version and hardware profile constants from shared package.

Phase 2: Shared contracts and database schema

- Shared service constants.
- Shared Zod schemas.
- Drizzle tables for projects, services, PostgreSQL instances, credentials, and service events.
- API-facing inferred types.

Phase 3: API routes

- Protected PostgreSQL routes.
- Ownership checks.
- Create/list/detail endpoints.
- OpenAPI metadata.
- Validation and safe errors.

Phase 4: Local provisioner

- Docker provisioner module.
- Container creation with CPU and memory limits.
- Named volume creation.
- Health checks.
- Start, stop, restart, and delete actions.

Phase 5: Frontend integration

- TanStack Query hooks.
- Create mutation.
- Instance list.
- Instance detail.
- Connection reveal action.
- Lifecycle action mutations.

Phase 6: Tests and hardening

- Ownership boundary tests.
- Validation tests.
- Provisioner unit tests with Docker boundary mocked where useful.
- Manual local WSL provisioning test.
- Failure recovery behavior for partially created containers or volumes.

## Open Questions

- Should the first release require projects to exist before PostgreSQL creation, or should the create flow auto-create a default project?
- Should passwords be user-provided only, generated only, or both?
- Should local host ports always be auto-assigned, or should fixed ports be available in the first release?
- Should deleting an instance default to preserving or deleting the volume?
- Should connection details be visible immediately after create, or only through a reveal action?

## Next Agent Session Notes

- Keep this feature user-owned only; do not introduce organization or team scope.
- Keep infrastructure-specific Docker code isolated behind a provisioner module.
- Keep all cross-app constants, schemas, Drizzle tables, and inferred types in `packages/shared`.
- Use `dev-standard` as the default hardware profile for WSL-friendly behavior.
- Do not add Docker services for the frontend or backend; provisioned PostgreSQL instances are separate runtime resources created by the feature.
