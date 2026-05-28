import { z } from "zod";

const nodeEnvSchema = z
  .enum(["development", "test", "production"])
  .default("development");

const corsOriginsSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return ["http://localhost:3000"];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}, z.array(z.url()).min(1));

export const apiEnvSchema = z.object({
  ACCESS_TOKEN_SECRET: z.string().min(32),
  AUTH_COOKIE_DOMAIN: z.string().min(1).optional(),
  CORS_ORIGINS: corsOriginsSchema.default(["http://localhost:3000"]),
  DATABASE_URL: z.url().startsWith("postgresql://"),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  NODE_ENV: nodeEnvSchema,
  PORT: z.coerce.number().int().positive().max(65535).default(5000),
  REDIS_URL: z.url().startsWith("redis://"),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  API_PUBLIC_URL: z.url().default("http://localhost:5000"),
  WEB_APP_URL: z.url().default("http://localhost:3000"),
});

export const databaseEnvSchema = apiEnvSchema.pick({
  DATABASE_URL: true,
});

export const webEnvSchema = z.object({
  VITE_API_URL: z.url().default("http://localhost:5000"),
});
