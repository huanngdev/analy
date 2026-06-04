import {
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import {
  POSTGRES_HARDWARE_PROFILE_IDS,
  SERVICE_STATUSES,
  SERVICE_TYPES,
} from "../../constants/service-constants";
import { users } from "./auth-schema";

export const serviceTypeEnum = pgEnum("service_type", SERVICE_TYPES);
export const serviceStatusEnum = pgEnum("service_status", SERVICE_STATUSES);
export const postgresHardwareProfileEnum = pgEnum(
  "postgres_hardware_profile",
  POSTGRES_HARDWARE_PROFILE_IDS,
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("projects_user_id_idx").on(table.userId),
    uniqueIndex("projects_user_slug_unique_idx").on(table.userId, table.slug),
  ],
);

export const services = pgTable(
  "services",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    type: serviceTypeEnum("type").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: serviceStatusEnum("status").notNull().default("provisioning"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("services_user_id_idx").on(table.userId),
    index("services_project_id_idx").on(table.projectId),
    uniqueIndex("services_project_name_unique_idx").on(
      table.projectId,
      table.name,
    ),
  ],
);

export const postgresInstances = pgTable(
  "postgres_instances",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    postgresVersion: text("postgres_version").notNull(),
    imageTag: text("image_tag").notNull(),
    databaseName: text("database_name").notNull(),
    username: text("username").notNull(),
    hardwareProfile: postgresHardwareProfileEnum("hardware_profile").notNull(),
    cpuLimit: numeric("cpu_limit", { precision: 4, scale: 2 }).notNull(),
    memoryMb: integer("memory_mb").notNull(),
    storageMb: integer("storage_mb").notNull(),
    host: text("host").notNull(),
    port: integer("port").notNull(),
    containerName: text("container_name"),
    volumeName: text("volume_name"),
    lastHealthStatus: text("last_health_status").notNull().default("ready"),
    lastHealthCheckedAt: timestamp("last_health_checked_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("postgres_instances_user_id_idx").on(table.userId),
    uniqueIndex("postgres_instances_service_id_unique_idx").on(table.serviceId),
  ],
);
