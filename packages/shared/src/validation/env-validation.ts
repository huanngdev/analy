import { z } from "zod";

const nodeEnvSchema = z
  .enum(["development", "test", "production"])
  .default("development");

const corsOriginsSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return ["http://localhost:5173"];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}, z.array(z.url()).min(1));

export const apiEnvSchema = z.object({
  CORS_ORIGINS: corsOriginsSchema.default(["http://localhost:5173"]),
  DATABASE_URL: z.url().startsWith("postgresql://"),
  NODE_ENV: nodeEnvSchema,
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
});

export const databaseEnvSchema = apiEnvSchema.pick({
  DATABASE_URL: true,
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;
