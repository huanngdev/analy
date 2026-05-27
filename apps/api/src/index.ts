import app from "./app";

Bun.serve({
  fetch: app.fetch,
  port: Number(process.env.PORT ?? 3000),
});
