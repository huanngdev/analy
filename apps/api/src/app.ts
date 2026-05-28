import { Hono } from "hono";
import { APP_NAME, formatGreeting, healthResponseSchema } from "@repo/shared";
import type { AppBindings } from "./app-bindings";
import { requestLogger } from "./logger";
import { corsMiddleware } from "./middleware/cors";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found";
import { requestIdMiddleware } from "./middleware/request-id";
import { securityMiddleware } from "./middleware/security";

const app = new Hono<AppBindings>();

app.use("*", securityMiddleware);
app.use("*", corsMiddleware);
app.use("*", requestIdMiddleware);
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

app.onError(errorHandler);
app.notFound(notFoundHandler);

export default app;
