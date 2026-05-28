import {
  ACCESS_TOKEN_TTL_SECONDS,
  AUTH_COOKIE_NAMES,
  REFRESH_SESSION_TTL_SECONDS,
} from "@repo/shared";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { Context } from "hono";
import type { CookieOptions } from "hono/utils/cookie";

import { env } from "@/env";

const secureCookie = env.NODE_ENV === "production";

function cookieOptions(maxAge: number): CookieOptions {
  return {
    domain: env.AUTH_COOKIE_DOMAIN,
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "Lax",
    secure: secureCookie,
  };
}

export function getAccessTokenCookie(c: Context) {
  return getCookie(c, AUTH_COOKIE_NAMES.accessToken);
}

export function getRefreshTokenCookie(c: Context) {
  return getCookie(c, AUTH_COOKIE_NAMES.refreshToken);
}

export function setAuthCookies(
  c: Context,
  accessToken: string,
  refreshToken: string,
  options: { refreshTokenMaxAge?: number } = {},
) {
  setCookie(
    c,
    AUTH_COOKIE_NAMES.accessToken,
    accessToken,
    cookieOptions(ACCESS_TOKEN_TTL_SECONDS),
  );
  setCookie(
    c,
    AUTH_COOKIE_NAMES.refreshToken,
    refreshToken,
    cookieOptions(options.refreshTokenMaxAge ?? REFRESH_SESSION_TTL_SECONDS),
  );
}

export function clearAuthCookies(c: Context) {
  deleteCookie(c, AUTH_COOKIE_NAMES.accessToken, cookieOptions(0));
  deleteCookie(c, AUTH_COOKIE_NAMES.refreshToken, cookieOptions(0));
}
