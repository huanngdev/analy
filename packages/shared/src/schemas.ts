import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  createdAt: z.string().datetime(),
});

export const healthResponseSchema = z.object({
  app: z.string(),
  ok: z.boolean(),
  timestamp: z.string().datetime(),
});

export const dbSchemas = {
  users: userSchema,
};
