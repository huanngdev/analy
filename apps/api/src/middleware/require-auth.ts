import type { MiddlewareHandler } from "hono";

import type { AppBindings } from "@/app-bindings";
import { verifyAccessToken } from "@/auth/access-token";
import { getAccessTokenCookie } from "@/auth/auth-cookies";

export const requireAuthMiddleware: MiddlewareHandler<AppBindings> = async (
  c,
  next,
) => {
  const accessToken = getAccessTokenCookie(c);
  const payload = await verifyAccessToken(accessToken ?? "");

  c.set("auth", payload);

  await next();
};
