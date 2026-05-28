import {
  apiErrorResponseSchema,
  authLoginRequestSchema,
  authLogoutResponseSchema,
  authMeResponseSchema,
  authRegisterRequestSchema,
  authSessionResponseSchema,
} from "@repo/shared";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

import type { AppBindings } from "@/app-bindings";
import {
  clearAuthCookies,
  getRefreshTokenCookie,
  setAuthCookies,
} from "@/auth/auth-cookies";
import {
  getAuthUser,
  loginWithEmailPassword,
  registerWithEmailPassword,
  rotateAuthTokens,
} from "@/auth/auth-service";
import { getAuthRequestContext, parseJsonBody } from "@/auth/request-context";
import { revokeRefreshSession } from "@/auth/refresh-session-service";
import { requireAuthMiddleware } from "@/middleware/require-auth";

export const authRoutes = new OpenAPIHono<AppBindings>();

const jsonContent = <TSchema>(schema: TSchema, description: string) => ({
  content: {
    "application/json": {
      schema,
    },
  },
  description,
});

const jsonRequestBody = <TSchema>(schema: TSchema, description: string) => ({
  content: {
    "application/json": {
      schema,
    },
  },
  description,
  required: true,
});

const authMeOpenApiResponseSchema = authMeResponseSchema.extend({
  memberships: z.array(z.object({}).passthrough()),
  organizations: z.array(z.object({}).passthrough()),
});

const registerRoute = createRoute({
  method: "post",
  path: "/register",
  request: {
    body: jsonRequestBody(
      authRegisterRequestSchema,
      "Email/password registration payload.",
    ),
  },
  responses: {
    201: jsonContent(
      authSessionResponseSchema,
      "User registered and auth cookies set.",
    ),
    400: jsonContent(apiErrorResponseSchema, "Invalid request body."),
    409: jsonContent(apiErrorResponseSchema, "Email is already registered."),
    500: jsonContent(apiErrorResponseSchema, "Unexpected server error."),
  },
  tags: ["Auth"],
});

const loginRoute = createRoute({
  method: "post",
  path: "/login",
  request: {
    body: jsonRequestBody(
      authLoginRequestSchema,
      "Email/password login payload.",
    ),
  },
  responses: {
    200: jsonContent(
      authSessionResponseSchema,
      "User authenticated and auth cookies set.",
    ),
    400: jsonContent(apiErrorResponseSchema, "Invalid request body."),
    401: jsonContent(apiErrorResponseSchema, "Invalid email or password."),
    500: jsonContent(apiErrorResponseSchema, "Unexpected server error."),
  },
  tags: ["Auth"],
});

const logoutRoute = createRoute({
  method: "post",
  path: "/logout",
  responses: {
    200: jsonContent(
      authLogoutResponseSchema,
      "Refresh session revoked and auth cookies cleared.",
    ),
    500: jsonContent(apiErrorResponseSchema, "Unexpected server error."),
  },
  security: [{ refreshTokenCookie: [] }],
  tags: ["Auth"],
});

const rotateTokenRoute = createRoute({
  method: "post",
  path: "/rotate-token",
  responses: {
    200: jsonContent(authSessionResponseSchema, "Auth cookies rotated."),
    401: jsonContent(
      apiErrorResponseSchema,
      "Refresh token is missing or invalid.",
    ),
    500: jsonContent(apiErrorResponseSchema, "Unexpected server error."),
  },
  security: [{ refreshTokenCookie: [] }],
  tags: ["Auth"],
});

const meRoute = createRoute({
  method: "get",
  path: "/me",
  responses: {
    200: jsonContent(
      authMeOpenApiResponseSchema,
      "Current authenticated user context.",
    ),
    401: jsonContent(
      apiErrorResponseSchema,
      "Access token is missing or invalid.",
    ),
    500: jsonContent(apiErrorResponseSchema, "Unexpected server error."),
  },
  security: [{ accessTokenCookie: [] }],
  tags: ["Auth"],
});

authRoutes.openapi(registerRoute, async (c) => {
  const input = authRegisterRequestSchema.parse(await parseJsonBody(c));
  const result = await registerWithEmailPassword(
    input,
    getAuthRequestContext(c),
  );

  setAuthCookies(c, result.accessToken, result.refreshToken);

  return c.json(
    authSessionResponseSchema.parse({
      ok: true,
      user: result.user,
    }),
    201,
  );
});

authRoutes.openapi(loginRoute, async (c) => {
  const input = authLoginRequestSchema.parse(await parseJsonBody(c));
  const result = await loginWithEmailPassword(input, getAuthRequestContext(c));

  setAuthCookies(c, result.accessToken, result.refreshToken);

  return c.json(
    authSessionResponseSchema.parse({
      ok: true,
      user: result.user,
    }),
    200,
  );
});

authRoutes.openapi(logoutRoute, async (c) => {
  await revokeRefreshSession(getRefreshTokenCookie(c));
  clearAuthCookies(c);

  return c.json(authLogoutResponseSchema.parse({ ok: true }), 200);
});

authRoutes.openapi(rotateTokenRoute, async (c) => {
  const result = await rotateAuthTokens(getRefreshTokenCookie(c));

  setAuthCookies(c, result.accessToken, result.refreshToken, {
    refreshTokenMaxAge: result.refreshTokenMaxAge,
  });

  return c.json(
    authSessionResponseSchema.parse({
      ok: true,
      user: result.user,
    }),
    200,
  );
});

authRoutes.use("/me", requireAuthMiddleware);

authRoutes.openapi(meRoute, async (c) => {
  const payload = c.get("auth");
  const user = await getAuthUser(payload.id);

  return c.json(
    authMeResponseSchema.parse({
      memberships: [],
      ok: true,
      organizations: [],
      permissions: [],
      user,
    }),
    200,
  );
});
