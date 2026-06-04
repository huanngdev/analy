import {
  apiErrorResponseSchema,
  postgresCreateRequestSchema,
  postgresCreateResponseSchema,
  postgresDetailResponseSchema,
  postgresListQuerySchema,
  postgresListResponseSchema,
  postgresMeta,
  postgresMetaResponseSchema,
} from "@repo/shared";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

import type { AppBindings } from "@/server/app-bindings";
import { parseJsonBody } from "@/features/auth/request-context";
import { requireAuthMiddleware } from "@/middleware/require-auth";
import {
  createPostgresInstance,
  getPostgresInstance,
  listPostgresInstances,
  stopPostgresInstance,
} from "@/features/postgres/postgres-service";
import { jsonContent, jsonRequestBody } from "@/server/openapi-helpers";

export const postgresRoutes = new OpenAPIHono<AppBindings>();

const metaRoute = createRoute({
  method: "get",
  path: "/meta",
  responses: {
    200: jsonContent(postgresMetaResponseSchema, "PostgreSQL create options."),
  },
  tags: ["PostgreSQL"],
});

const listRoute = createRoute({
  method: "get",
  path: "/",
  request: {
    query: postgresListQuerySchema,
  },
  responses: {
    200: jsonContent(postgresListResponseSchema, "User PostgreSQL instances."),
    401: jsonContent(
      apiErrorResponseSchema,
      "Access token is missing or invalid.",
    ),
  },
  security: [{ accessTokenCookie: [] }],
  tags: ["PostgreSQL"],
});

const createPostgresRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: jsonRequestBody(
      postgresCreateRequestSchema,
      "PostgreSQL instance create payload.",
    ),
  },
  responses: {
    201: jsonContent(
      postgresCreateResponseSchema,
      "PostgreSQL instance created.",
    ),
    400: jsonContent(apiErrorResponseSchema, "Invalid request body."),
    401: jsonContent(
      apiErrorResponseSchema,
      "Access token is missing or invalid.",
    ),
    404: jsonContent(apiErrorResponseSchema, "Project not found."),
    409: jsonContent(apiErrorResponseSchema, "Service name conflict."),
  },
  security: [{ accessTokenCookie: [] }],
  tags: ["PostgreSQL"],
});

const detailRoute = createRoute({
  method: "get",
  path: "/{serviceId}",
  request: {
    params: z.object({ serviceId: z.uuid() }),
  },
  responses: {
    200: jsonContent(
      postgresDetailResponseSchema,
      "PostgreSQL instance detail.",
    ),
    401: jsonContent(
      apiErrorResponseSchema,
      "Access token is missing or invalid.",
    ),
    404: jsonContent(apiErrorResponseSchema, "PostgreSQL instance not found."),
  },
  security: [{ accessTokenCookie: [] }],
  tags: ["PostgreSQL"],
});

const stopRoute = createRoute({
  method: "post",
  path: "/{serviceId}/stop",
  request: {
    params: z.object({ serviceId: z.uuid() }),
  },
  responses: {
    200: jsonContent(postgresDetailResponseSchema, "PostgreSQL stopped."),
    401: jsonContent(
      apiErrorResponseSchema,
      "Access token is missing or invalid.",
    ),
    404: jsonContent(apiErrorResponseSchema, "PostgreSQL instance not found."),
  },
  security: [{ accessTokenCookie: [] }],
  tags: ["PostgreSQL"],
});

postgresRoutes.openapi(metaRoute, (c) =>
  c.json(postgresMetaResponseSchema.parse({ ok: true, ...postgresMeta }), 200),
);

postgresRoutes.use("*", requireAuthMiddleware);

postgresRoutes.openapi(listRoute, async (c) => {
  const payload = c.get("auth");
  const query = c.req.valid("query");
  const instances = await listPostgresInstances(payload.id, query);

  return c.json(postgresListResponseSchema.parse({ instances, ok: true }), 200);
});

postgresRoutes.openapi(createPostgresRoute, async (c) => {
  const payload = c.get("auth");
  const input = postgresCreateRequestSchema.parse(await parseJsonBody(c));
  const instance = await createPostgresInstance(payload.id, input);

  return c.json(
    postgresCreateResponseSchema.parse({ instance, ok: true }),
    201,
  );
});

postgresRoutes.openapi(stopRoute, async (c) => {
  const payload = c.get("auth");
  const { serviceId } = c.req.valid("param");
  const instance = await stopPostgresInstance(payload.id, serviceId);

  return c.json(
    postgresDetailResponseSchema.parse({ instance, ok: true }),
    200,
  );
});

postgresRoutes.openapi(detailRoute, async (c) => {
  const payload = c.get("auth");
  const { serviceId } = c.req.valid("param");
  const instance = await getPostgresInstance(payload.id, serviceId);

  return c.json(
    postgresDetailResponseSchema.parse({ instance, ok: true }),
    200,
  );
});
