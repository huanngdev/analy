import {
  DEFAULT_POSTGRES_HARDWARE_PROFILE,
  POSTGRES_HARDWARE_PROFILES,
  postgresInstances,
  projects,
  services,
  type PostgresCreateRequest,
  type PostgresInstance,
} from "@repo/shared";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { AppError } from "@/errors/app-error";

const DEFAULT_PROJECT = {
  name: "Default Project",
  slug: "default-project",
};

function getHardwareProfile(id = DEFAULT_POSTGRES_HARDWARE_PROFILE) {
  return POSTGRES_HARDWARE_PROFILES.find((profile) => profile.id === id)!;
}

function toIsoString(value: Date | null) {
  return value?.toISOString() ?? null;
}

function getUsageValue(input: {
  id: string;
  max: number;
  min: number;
  offset: number;
  status: typeof services.$inferSelect.status;
  stepMs?: number;
}) {
  if (["failed", "stopped", "stopping"].includes(input.status)) {
    return 0;
  }

  if (["provisioning", "starting"].includes(input.status)) {
    return Math.min(input.max, input.min + 6);
  }

  const seed = [...input.id].reduce(
    (total, char) => total + char.charCodeAt(0),
    0,
  );
  const timeStep = Math.floor(Date.now() / (input.stepMs ?? 5_000));
  const wave = (Math.sin((seed + input.offset + timeStep) * 0.7) + 1) / 2;

  return Math.round(input.min + wave * (input.max - input.min));
}

function buildConnectionUri(input: {
  databaseName: string;
  host: string;
  password: string;
  port: number;
  username: string;
}) {
  const username = encodeURIComponent(input.username);
  const password = encodeURIComponent(input.password);

  return `postgresql://${username}:${password}@${input.host}:${input.port}/${input.databaseName}`;
}

function mapInstance(row: {
  instance: typeof postgresInstances.$inferSelect;
  project: typeof projects.$inferSelect;
  service: typeof services.$inferSelect;
}): PostgresInstance {
  return {
    createdAt: row.service.createdAt.toISOString(),
    databaseName: row.instance.databaseName,
    description: row.service.description,
    hardware: {
      cpuLimit: row.instance.cpuLimit,
      memoryMb: row.instance.memoryMb,
      storageMb: row.instance.storageMb,
    },
    hardwareProfile: row.instance.hardwareProfile,
    health: {
      checkedAt: toIsoString(row.instance.lastHealthCheckedAt),
      status: row.instance.lastHealthStatus,
    },
    host: row.instance.host,
    id: row.service.id,
    imageTag: row.instance.imageTag,
    name: row.service.name,
    port: row.instance.port,
    postgresVersion: row.instance.postgresVersion as "17" | "16" | "15",
    project: {
      id: row.project.id,
      name: row.project.name,
      slug: row.project.slug,
    },
    projectId: row.project.id,
    status: row.service.status,
    updatedAt: row.service.updatedAt.toISOString(),
    usage: {
      cpu: getUsageValue({
        id: row.service.id,
        max: 72,
        min: 8,
        offset: 3,
        status: row.service.status,
      }),
      memory: getUsageValue({
        id: row.service.id,
        max: 82,
        min: 18,
        offset: 17,
        status: row.service.status,
      }),
      storage: getUsageValue({
        id: row.service.id,
        max: 68,
        min: 14,
        offset: 31,
        status: row.service.status,
        stepMs: 30_000,
      }),
    },
    username: row.instance.username,
  };
}

async function getPostgresInstanceRow(userId: string, serviceId: string) {
  const [row] = await db
    .select({
      instance: postgresInstances,
      project: projects,
      service: services,
    })
    .from(services)
    .innerJoin(postgresInstances, eq(postgresInstances.serviceId, services.id))
    .innerJoin(projects, eq(projects.id, services.projectId))
    .where(
      and(
        eq(services.id, serviceId),
        eq(services.userId, userId),
        eq(services.type, "postgresql"),
      ),
    )
    .limit(1);

  if (!row) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "PostgreSQL instance not found",
      status: 404,
    });
  }

  return row;
}

async function getOrCreateProject(userId: string, projectId?: string) {
  if (projectId) {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
      .limit(1);

    if (!project) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Project not found",
        status: 404,
      });
    }

    return project;
  }

  const [existingProject] = await db
    .select()
    .from(projects)
    .where(
      and(eq(projects.userId, userId), eq(projects.slug, DEFAULT_PROJECT.slug)),
    )
    .limit(1);

  if (existingProject) {
    return existingProject;
  }

  const [project] = await db
    .insert(projects)
    .values({
      name: DEFAULT_PROJECT.name,
      slug: DEFAULT_PROJECT.slug,
      userId,
    })
    .returning();

  return project!;
}

export async function listPostgresInstances(userId: string) {
  const rows = await db
    .select({
      instance: postgresInstances,
      project: projects,
      service: services,
    })
    .from(services)
    .innerJoin(postgresInstances, eq(postgresInstances.serviceId, services.id))
    .innerJoin(projects, eq(projects.id, services.projectId))
    .where(and(eq(services.userId, userId), eq(services.type, "postgresql")));

  return rows.map(mapInstance);
}

export async function getPostgresInstance(userId: string, serviceId: string) {
  const row = await getPostgresInstanceRow(userId, serviceId);

  return mapInstance(row);
}

export async function stopPostgresInstance(userId: string, serviceId: string) {
  const row = await getPostgresInstanceRow(userId, serviceId);
  const now = new Date();

  const [service] = await db
    .update(services)
    .set({
      status: "stopped",
      updatedAt: now,
    })
    .where(
      and(
        eq(services.id, serviceId),
        eq(services.userId, userId),
        eq(services.type, "postgresql"),
      ),
    )
    .returning();

  const [instance] = await db
    .update(postgresInstances)
    .set({
      lastHealthCheckedAt: now,
      lastHealthStatus: "stopped",
      updatedAt: now,
    })
    .where(
      and(
        eq(postgresInstances.serviceId, serviceId),
        eq(postgresInstances.userId, userId),
      ),
    )
    .returning();

  return mapInstance({
    instance: instance ?? row.instance,
    project: row.project,
    service: service ?? row.service,
  });
}

export async function createPostgresInstance(
  userId: string,
  input: PostgresCreateRequest,
) {
  const project = await getOrCreateProject(userId, input.projectId);

  const [duplicate] = await db
    .select({ id: services.id })
    .from(services)
    .where(
      and(eq(services.projectId, project.id), eq(services.name, input.name)),
    )
    .limit(1);

  if (duplicate) {
    throw new AppError({
      code: "CONFLICT",
      message: "A service with this name already exists in the project",
      status: 409,
    });
  }

  const hardwareProfile = getHardwareProfile(input.hardwareProfile);
  const port = 54_320 + Math.floor(Math.random() * 1_000);
  const imageTag = `postgres:${input.postgresVersion}`;
  const host = "localhost";

  const [service] = await db
    .insert(services)
    .values({
      description: input.description,
      name: input.name,
      projectId: project.id,
      status: "ready",
      type: "postgresql",
      userId,
    })
    .returning();

  if (!service) {
    throw new AppError({
      code: "INTERNAL_SERVER_ERROR",
      message: "PostgreSQL instance could not be created",
      status: 500,
    });
  }

  const [instance] = await db
    .insert(postgresInstances)
    .values({
      containerName: `analy-postgres-${service.id}`,
      cpuLimit: hardwareProfile.cpuLimit,
      databaseName: input.databaseName,
      hardwareProfile: hardwareProfile.id,
      host,
      imageTag,
      lastHealthCheckedAt: new Date(),
      lastHealthStatus: "ready",
      memoryMb: hardwareProfile.memoryMb,
      port,
      postgresVersion: input.postgresVersion,
      projectId: project.id,
      serviceId: service.id,
      storageMb: hardwareProfile.storageMb,
      userId,
      username: input.username,
      volumeName: `analy-postgres-${service.id}-data`,
    })
    .returning();

  if (!instance) {
    throw new AppError({
      code: "INTERNAL_SERVER_ERROR",
      message: "PostgreSQL instance could not be initialized",
      status: 500,
    });
  }

  return {
    ...mapInstance({ instance, project, service }),
    connectionUri: buildConnectionUri({
      databaseName: input.databaseName,
      host,
      password: input.password,
      port,
      username: input.username,
    }),
  };
}
