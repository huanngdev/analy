import {
  DEFAULT_POSTGRES_HARDWARE_PROFILE,
  DEFAULT_POSTGRES_VERSION,
  POSTGRES_HARDWARE_PROFILE_IDS,
  POSTGRES_HARDWARE_PROFILES,
  POSTGRES_VERSIONS,
  SERVICE_STATUSES,
} from "@/constants/service-constants";
import { z } from "zod";

const instanceNameSchema = z
  .string()
  .min(3)
  .max(48)
  .regex(/^[a-z][a-z0-9-]*[a-z0-9]$/, {
    message:
      "Use 3-48 lowercase letters, numbers, and hyphens. Start with a letter and do not end with a hyphen.",
  });

const postgresIdentifierSchema = z
  .string()
  .min(1)
  .max(63)
  .regex(/^[a-z][a-z0-9_]*$/, {
    message:
      "Use lowercase letters, numbers, and underscores. Start with a letter.",
  });

export const postgresCreateRequestSchema = z.object({
  databaseName: postgresIdentifierSchema.default("app"),
  description: z.string().max(160).optional(),
  hardwareProfile: z
    .enum(POSTGRES_HARDWARE_PROFILE_IDS)
    .default(DEFAULT_POSTGRES_HARDWARE_PROFILE),
  name: instanceNameSchema,
  password: z
    .string()
    .min(16)
    .max(128)
    .regex(/[a-z]/, "Password needs a lowercase letter")
    .regex(/[A-Z]/, "Password needs an uppercase letter")
    .regex(/[0-9]/, "Password needs a number")
    .regex(/[^A-Za-z0-9]/, "Password needs a symbol"),
  postgresVersion: z.enum(POSTGRES_VERSIONS).default(DEFAULT_POSTGRES_VERSION),
  projectId: z.uuid().optional(),
  username: postgresIdentifierSchema.refine(
    (value) => !["postgres", "root", "admin", "analy"].includes(value),
    "Choose a less privileged username",
  ),
});

export const postgresListQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
});

export const postgresProjectSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
});

export const postgresInstanceSchema = z.object({
  connectionUri: z.string().optional(),
  createdAt: z.iso.datetime(),
  databaseName: z.string(),
  description: z.string().nullable(),
  hardwareProfile: z.enum(POSTGRES_HARDWARE_PROFILE_IDS),
  hardware: z.object({
    cpuLimit: z.string(),
    memoryMb: z.number(),
    storageMb: z.number(),
  }),
  health: z.object({
    checkedAt: z.iso.datetime().nullable(),
    status: z.string(),
  }),
  host: z.string(),
  id: z.uuid(),
  imageTag: z.string(),
  name: z.string(),
  port: z.number(),
  postgresVersion: z.enum(POSTGRES_VERSIONS),
  project: postgresProjectSchema,
  projectId: z.uuid(),
  status: z.enum(SERVICE_STATUSES),
  updatedAt: z.iso.datetime(),
  username: z.string(),
  usage: z.object({
    cpu: z.number().min(0).max(100),
    memory: z.number().min(0).max(100),
    storage: z.number().min(0).max(100),
  }),
});

export const postgresListItemSchema = z.object({
  createdAt: z.iso.datetime(),
  description: z.string().nullable(),
  healthStatus: z.string(),
  id: z.uuid(),
  name: z.string(),
  postgresVersion: z.enum(POSTGRES_VERSIONS),
  project: postgresProjectSchema,
  status: z.enum(SERVICE_STATUSES),
  updatedAt: z.iso.datetime(),
});

export const postgresListResponseSchema = z.object({
  instances: z.array(postgresListItemSchema),
  ok: z.literal(true),
});

export const postgresCreateResponseSchema = z.object({
  instance: postgresInstanceSchema.extend({ connectionUri: z.string() }),
  ok: z.literal(true),
});

export const postgresDetailResponseSchema = z.object({
  instance: postgresInstanceSchema,
  ok: z.literal(true),
});

export const postgresMetaResponseSchema = z.object({
  hardwareProfiles: z.array(
    z.object({
      cpuLimit: z.string(),
      id: z.enum(POSTGRES_HARDWARE_PROFILE_IDS),
      memoryMb: z.number(),
      name: z.string(),
      storageMb: z.number(),
    }),
  ),
  ok: z.literal(true),
  versions: z.array(z.enum(POSTGRES_VERSIONS)),
});

export const postgresMeta = {
  hardwareProfiles: POSTGRES_HARDWARE_PROFILES,
  versions: POSTGRES_VERSIONS,
};
