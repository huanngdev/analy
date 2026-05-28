import { z } from "zod";

export const healthResponseSchema = z.object({
  app: z.string(),
  ok: z.boolean(),
  timestamp: z.iso.datetime(),
});
