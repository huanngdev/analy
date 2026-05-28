import { SYSTEM_ROLES } from "@/constants/auth-constants";
import { z } from "zod";

export const authUserSchema = z.object({
  avatarUrl: z.url().nullable(),
  createdAt: z.iso.datetime(),
  email: z.email(),
  emailVerified: z.boolean(),
  id: z.uuid(),
  name: z.string().nullable(),
  systemRole: z.enum(SYSTEM_ROLES),
});

export const authRegisterRequestSchema = z.object({
  email: z.email().trim().toLowerCase(),
  name: z.string().trim().min(1).max(120).optional(),
  password: z.string().min(8).max(128),
});

export const authLoginRequestSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1).max(128),
});

export const authSessionResponseSchema = z.object({
  ok: z.literal(true),
  user: authUserSchema,
});

export const authMeResponseSchema = authSessionResponseSchema.extend({
  memberships: z.array(z.never()),
  organizations: z.array(z.never()),
  permissions: z.array(z.string()),
});

export const authLogoutResponseSchema = z.object({
  ok: z.literal(true),
});
