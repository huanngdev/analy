import {
  apiErrorResponseSchema,
  authLoginRequestSchema,
  authLogoutResponseSchema,
  authMeResponseSchema,
  authRegisterRequestSchema,
  authSessionResponseSchema,
} from "@repo/shared";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { Context } from "hono";

import type { AppBindings } from "@/server/app-bindings";
import {
  clearAuthCookies,
  clearOAuthCookies,
  getOAuthCodeVerifierCookie,
  getOAuthStateCookie,
  getRefreshTokenCookie,
  setAuthCookies,
  setOAuthCodeVerifierCookie,
  setOAuthStateCookie,
} from "@/features/auth/auth-cookies";
import {
  getAuthUser,
  loginWithOAuth,
  loginWithEmailPassword,
  registerWithEmailPassword,
  rotateAuthTokens,
} from "@/features/auth/auth-service";
import {
  createOAuthAuthorization,
  getOAuthUserProfile,
  type OAuthProvider,
} from "@/features/auth/oauth-service";
import {
  getAuthRequestContext,
  parseJsonBody,
} from "@/features/auth/request-context";
import { revokeRefreshSession } from "@/features/auth/refresh-session-service";
import { env } from "@/config/env";
import { AppError, isAppError } from "@/lib/errors/app-error";
import { logUnhandledError } from "@/lib/logger";
import { requireAuthMiddleware } from "@/middleware/require-auth";
import {
  jsonContent,
  jsonRequestBody,
  openApiDefaultHook,
} from "@/server/openapi-helpers";

export const authRoutes = new OpenAPIHono<AppBindings>({
  defaultHook: openApiDefaultHook,
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

const githubOAuthRoute = createRoute({
  method: "get",
  path: "/github",
  responses: {
    302: { description: "Redirect to GitHub OAuth." },
    500: jsonContent(apiErrorResponseSchema, "Unexpected server error."),
  },
  tags: ["Auth"],
});

const githubOAuthCallbackRoute = createRoute({
  method: "get",
  path: "/github/callback",
  responses: {
    302: { description: "OAuth callback accepted and auth cookies set." },
    401: jsonContent(apiErrorResponseSchema, "OAuth callback is invalid."),
    500: jsonContent(apiErrorResponseSchema, "Unexpected server error."),
  },
  tags: ["Auth"],
});

const googleOAuthRoute = createRoute({
  method: "get",
  path: "/google",
  responses: {
    302: { description: "Redirect to Google OAuth." },
    500: jsonContent(apiErrorResponseSchema, "Unexpected server error."),
  },
  tags: ["Auth"],
});

const googleOAuthCallbackRoute = createRoute({
  method: "get",
  path: "/google/callback",
  responses: {
    302: { description: "OAuth callback accepted and auth cookies set." },
    401: jsonContent(apiErrorResponseSchema, "OAuth callback is invalid."),
    500: jsonContent(apiErrorResponseSchema, "Unexpected server error."),
  },
  tags: ["Auth"],
});

function getOAuthCallbackInput(c: Context<AppBindings>) {
  const code = c.req.query("code");
  const state = c.req.query("state");
  const error = c.req.query("error");

  if (error) {
    throw new AppError({
      code: "UNAUTHORIZED",
      message: "OAuth sign in was cancelled",
      status: 401,
    });
  }

  if (!code || !state) {
    throw new AppError({
      code: "UNAUTHORIZED",
      message: "OAuth callback is invalid",
      status: 401,
    });
  }

  return { code, state };
}

async function handleOAuthCallback(
  c: Context<AppBindings>,
  provider: OAuthProvider,
) {
  // OAuth callbacks are top-level browser navigations, so failures must land
  // the user back on the login page with a friendly message rather than
  // returning a raw JSON error body from the global error handler.
  try {
    const { code, state } = getOAuthCallbackInput(c);
    const expectedState = getOAuthStateCookie(c, provider);
    const codeVerifier = getOAuthCodeVerifierCookie(c, provider);

    clearOAuthCookies(c, provider);

    if (!expectedState || state !== expectedState) {
      throw new AppError({
        code: "UNAUTHORIZED",
        message: "OAuth callback is invalid",
        status: 401,
      });
    }

    const profile = await getOAuthUserProfile(provider, code, codeVerifier);
    const result = await loginWithOAuth(profile, getAuthRequestContext(c));

    setAuthCookies(c, result.accessToken, result.refreshToken);

    return c.redirect(`${env.WEB_APP_URL}/dashboard`, 302);
  } catch (error) {
    clearOAuthCookies(c, provider);

    // Unexpected (non-AppError) failures are worth logging; expected user
    // errors (cancelled consent, invalid state, unverified email) are not.
    if (!isAppError(error)) {
      logUnhandledError(error, c.get("requestId") ?? "oauth-callback");
    }

    return c.redirect(`${env.WEB_APP_URL}/login?error=oauth`, 302);
  }
}

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

authRoutes.openapi(githubOAuthRoute, (c) => {
  const authorization = createOAuthAuthorization("github");

  setOAuthStateCookie(c, "github", authorization.state);

  return c.redirect(authorization.url.toString(), 302);
});

authRoutes.openapi(githubOAuthCallbackRoute, (c) =>
  handleOAuthCallback(c, "github"),
);

authRoutes.openapi(googleOAuthRoute, (c) => {
  const authorization = createOAuthAuthorization("google");

  setOAuthStateCookie(c, "google", authorization.state);

  if (authorization.codeVerifier) {
    setOAuthCodeVerifierCookie(c, "google", authorization.codeVerifier);
  }

  return c.redirect(authorization.url.toString(), 302);
});

authRoutes.openapi(googleOAuthCallbackRoute, (c) =>
  handleOAuthCallback(c, "google"),
);

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
