import { describe, expect, test } from "bun:test";
import { AUTH_COOKIE_NAMES } from "@repo/shared";
import { Hono } from "hono";
import type { Context } from "hono";

import {
  clearAuthCookies,
  getRefreshTokenCookie,
  setAuthCookies,
} from "@/features/auth/auth-cookies";

function appWith(handler: (c: Context) => Response | Promise<Response>) {
  const app = new Hono();
  app.get("/", handler);
  return app;
}

describe("auth cookies", () => {
  test("setAuthCookies emits http-only, lax cookies for both tokens", async () => {
    const app = appWith((c) => {
      setAuthCookies(c, "access-1", "refresh-1");
      return c.text("ok");
    });

    const res = await app.request("/");
    const setCookies = res.headers.getSetCookie();
    const access = setCookies.find((value) =>
      value.startsWith(`${AUTH_COOKIE_NAMES.accessToken}=`),
    );
    const refresh = setCookies.find((value) =>
      value.startsWith(`${AUTH_COOKIE_NAMES.refreshToken}=`),
    );

    expect(access).toContain("access-1");
    expect(access).toContain("HttpOnly");
    expect(access).toContain("SameSite=Lax");
    expect(access).toContain("Path=/");
    // NODE_ENV=test, so cookies must not be marked Secure.
    expect(access).not.toContain("Secure");
    expect(refresh).toContain("refresh-1");
    expect(refresh).toContain("HttpOnly");
  });

  test("getRefreshTokenCookie reads the refresh cookie from the request", async () => {
    const app = appWith((c) =>
      c.json({ token: getRefreshTokenCookie(c) ?? null }),
    );

    const res = await app.request("/", {
      headers: { Cookie: `${AUTH_COOKIE_NAMES.refreshToken}=abc.def` },
    });

    expect(await res.json()).toEqual({ token: "abc.def" });
  });

  test("clearAuthCookies expires both auth cookies", async () => {
    const app = appWith((c) => {
      clearAuthCookies(c);
      return c.text("ok");
    });

    const res = await app.request("/");
    const setCookies = res.headers.getSetCookie();
    const expiredAccess = setCookies.some(
      (value) =>
        value.includes(AUTH_COOKIE_NAMES.accessToken) &&
        value.includes("Max-Age=0"),
    );
    const expiredRefresh = setCookies.some(
      (value) =>
        value.includes(AUTH_COOKIE_NAMES.refreshToken) &&
        value.includes("Max-Age=0"),
    );

    expect(expiredAccess).toBe(true);
    expect(expiredRefresh).toBe(true);
  });
});
