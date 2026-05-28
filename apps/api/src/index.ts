import app from "./app";
import { logApiStartup } from "./logger";

const port = Number(process.env.PORT ?? 3000);

Bun.serve({
  fetch: app.fetch,
  port,
});

logApiStartup(port);
