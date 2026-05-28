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
  ACCESS_TOKEN_SECRET: z.string().min(32),
  AUTH_COOKIE_DOMAIN: z.string().min(1).optional(),
  CORS_ORIGINS: corsOriginsSchema.default(["http://localhost:5173"]),
  DATABASE_URL: z.url().startsWith("postgresql://"),
  NODE_ENV: nodeEnvSchema,
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  REDIS_URL: z.url().startsWith("redis://"),
  REFRESH_TOKEN_SECRET: z.string().min(32),
});

export const databaseEnvSchema = apiEnvSchema.pick({
  DATABASE_URL: true,
});
