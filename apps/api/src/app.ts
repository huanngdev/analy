import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import {
  APP_NAME,
  apiErrorResponseSchema,
  apiRootResponseSchema,
  formatGreeting,
  healthResponseSchema,
} from "@repo/shared";
import type { AppBindings } from "@/app-bindings";
import { authRoutes } from "@/auth/auth-routes";
import { registerApiDocs } from "@/open-api";
import { requestLogger } from "@/logger";
import { corsMiddleware } from "@/middleware/cors";
import { errorHandler } from "@/middleware/error-handler";
import { notFoundHandler } from "@/middleware/not-found";
import { rateLimitMiddleware } from "@/middleware/rate-limit";
import { requestIdMiddleware } from "@/middleware/request-id";
import { securityMiddleware } from "@/middleware/security";

const app = new OpenAPIHono<AppBindings>();

const jsonContent = <TSchema>(schema: TSchema, description: string) => ({
  content: {
    "application/json": {
      schema,
    },
  },
  description,
});

const rootRoute = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: jsonContent(apiRootResponseSchema, "API greeting."),
  },
  tags: ["System"],
});

const healthRoute = createRoute({
  method: "get",
  path: "/health",
  responses: {
    200: jsonContent(healthResponseSchema, "API health status."),
    500: jsonContent(apiErrorResponseSchema, "Unexpected server error."),
  },
  tags: ["System"],
});

app.use("*", securityMiddleware);
app.use("*", corsMiddleware);
app.use("*", requestIdMiddleware);
app.use("*", requestLogger);
app.use("*", rateLimitMiddleware);

registerApiDocs(app);

app.openapi(rootRoute, (c) =>
  c.json(apiRootResponseSchema.parse({ message: formatGreeting("api") }), 200),
);

app.openapi(healthRoute, (c) => {
  const response = healthResponseSchema.parse({
    app: APP_NAME,
    ok: true,
    timestamp: new Date().toISOString(),
  });

  return c.json(response, 200);
});

app.route("/auth", authRoutes);

app.onError(errorHandler);
app.notFound(notFoundHandler);

export default app;
