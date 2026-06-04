import {
  ACCESS_TOKEN_TTL_SECONDS,
  AUTH_COOKIE_NAMES,
  REFRESH_SESSION_TTL_SECONDS,
} from "@repo/shared";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { Context } from "hono";
import type { CookieOptions } from "hono/utils/cookie";

import { env } from "@/config/env";

const secureCookie = env.NODE_ENV === "production";
const OAUTH_COOKIE_MAX_AGE_SECONDS = 10 * 60;
const oauthStateCookieName = (provider: string) =>
  `analy_oauth_${provider}_state`;
const oauthCodeVerifierCookieName = (provider: string) =>
  `analy_oauth_${provider}_code_verifier`;

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

function oauthCookieOptions(maxAge: number): CookieOptions {
  return {
    ...cookieOptions(maxAge),
    maxAge,
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

export function getOAuthStateCookie(c: Context, provider: string) {
  return getCookie(c, oauthStateCookieName(provider));
}

export function getOAuthCodeVerifierCookie(c: Context, provider: string) {
  return getCookie(c, oauthCodeVerifierCookieName(provider));
}

export function setOAuthStateCookie(
  c: Context,
  provider: string,
  state: string,
) {
  setCookie(
    c,
    oauthStateCookieName(provider),
    state,
    oauthCookieOptions(OAUTH_COOKIE_MAX_AGE_SECONDS),
  );
}

export function setOAuthCodeVerifierCookie(
  c: Context,
  provider: string,
  codeVerifier: string,
) {
  setCookie(
    c,
    oauthCodeVerifierCookieName(provider),
    codeVerifier,
    oauthCookieOptions(OAUTH_COOKIE_MAX_AGE_SECONDS),
  );
}

export function clearOAuthCookies(c: Context, provider: string) {
  deleteCookie(c, oauthStateCookieName(provider), oauthCookieOptions(0));
  deleteCookie(c, oauthCodeVerifierCookieName(provider), oauthCookieOptions(0));
}
