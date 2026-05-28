import type { z } from "zod";
import type { healthResponseSchema, userSchema } from "./schemas";

export type User = z.infer<typeof userSchema>;
export type HealthResponse = z.infer<typeof healthResponseSchema>;
export * from "./types/index";
