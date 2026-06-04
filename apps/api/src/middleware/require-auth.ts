import type { MiddlewareHandler } from "hono";

import type { AppBindings } from "@/server/app-bindings";
import { verifyAccessToken } from "@/features/auth/access-token";
import { getAccessTokenCookie } from "@/features/auth/auth-cookies";

export const requireAuthMiddleware: MiddlewareHandler<AppBindings> = async (
  c,
  next,
) => {
  const accessToken = getAccessTokenCookie(c);
  const payload = await verifyAccessToken(accessToken ?? "");

  c.set("auth", payload);

  await next();
};
