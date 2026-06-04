import app from "@/server/app";
import { assertDatabaseConnection } from "@/lib/db";
import { env } from "@/config/env";
import { logApiStartup } from "@/lib/logger";
import { assertRedisConnection } from "@/lib/redis";

await assertDatabaseConnection();
await assertRedisConnection();

Bun.serve({
  fetch: app.fetch,
  port: env.PORT,
});

logApiStartup(env.PORT, env.NODE_ENV, env.CORS_ORIGINS);
