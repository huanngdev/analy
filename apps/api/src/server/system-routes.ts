import { createRoute, type OpenAPIHono } from "@hono/zod-openapi";
import {
  APP_NAME,
  apiErrorResponseSchema,
  apiRootResponseSchema,
  formatGreeting,
  healthResponseSchema,
} from "@repo/shared";

import type { AppBindings } from "@/server/app-bindings";
import { jsonContent } from "@/server/openapi-helpers";

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

export function registerSystemRoutes(app: OpenAPIHono<AppBindings>) {
  app.openapi(rootRoute, (c) =>
    c.json(
      apiRootResponseSchema.parse({ message: formatGreeting("api") }),
      200,
    ),
  );

  app.openapi(healthRoute, (c) => {
    const response = healthResponseSchema.parse({
      app: APP_NAME,
      ok: true,
      timestamp: new Date().toISOString(),
    });

    return c.json(response, 200);
  });
}
