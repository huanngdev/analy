import { apiReference } from "@scalar/hono-api-reference";
import type { OpenAPIHono } from "@hono/zod-openapi";
import { AUTH_COOKIE_NAMES } from "@repo/shared";

import type { AppBindings } from "@/app-bindings";
import { env } from "@/env";

const OPEN_API_PATH = "/openapi.json";

export function registerApiDocs(app: OpenAPIHono<AppBindings>) {
  if (env.NODE_ENV === "production") {
    return;
  }

  app.openAPIRegistry.registerComponent(
    "securitySchemes",
    "accessTokenCookie",
    {
      in: "cookie",
      name: AUTH_COOKIE_NAMES.accessToken,
      type: "apiKey",
    },
  );

  app.openAPIRegistry.registerComponent(
    "securitySchemes",
    "refreshTokenCookie",
    {
      in: "cookie",
      name: AUTH_COOKIE_NAMES.refreshToken,
      type: "apiKey",
    },
  );

  app.doc31(OPEN_API_PATH, {
    openapi: "3.1.0",
    info: {
      title: "Analy API",
      version: "0.1.0",
    },
  });

  app.get(
    "/docs",
    apiReference({
      spec: {
        url: OPEN_API_PATH,
      },
      theme: "kepler",
    }),
  );
}
