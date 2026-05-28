import app from "./app";
import { assertDatabaseConnection } from "./db";
import { env } from "./env";
import { logApiStartup } from "./logger";

await assertDatabaseConnection();

Bun.serve({
  fetch: app.fetch,
  port: env.PORT,
});

logApiStartup(env.PORT, env.NODE_ENV, env.CORS_ORIGINS);
