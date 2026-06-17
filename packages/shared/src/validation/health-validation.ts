import { z } from "zod";

export const healthResponseSchema = z.object({
  app: z.string(),
  ok: z.boolean(),
  services: z.object({
    database: z.boolean(),
    redis: z.boolean(),
  }),
  timestamp: z.iso.datetime(),
});
