import { Hono } from "hono";
import { APP_NAME, formatGreeting, healthResponseSchema } from "@repo/shared";
import { requestLogger } from "./logger";

const app = new Hono();

app.use("*", requestLogger);

app.get("/", (c) => c.json({ message: formatGreeting("api") }));

app.get("/health", (c) => {
  const response = healthResponseSchema.parse({
    app: APP_NAME,
    ok: true,
    timestamp: new Date().toISOString(),
  });

  return c.json(response);
});

export default app;
