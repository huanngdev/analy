import { describe, expect, test } from "bun:test";
import type { Context } from "hono";

import {
  getAuthRequestContext,
  parseJsonBody,
} from "@/features/auth/request-context";
import { AppError } from "@/lib/errors/app-error";

function fakeContext(options: {
  json?: () => Promise<unknown>;
  headers?: Record<string, string>;
}): Context {
  return {
    req: {
      json: options.json ?? (async () => ({})),
      raw: { headers: new Headers(options.headers ?? {}) },
    },
  } as unknown as Context;
}

describe("parseJsonBody", () => {
  test("returns the parsed JSON body", async () => {
    const body = await parseJsonBody(
      fakeContext({ json: async () => ({ email: "a@b.co" }) }),
    );

    expect(body).toEqual({ email: "a@b.co" });
  });

  test("throws a 400 AppError on invalid JSON", async () => {
    const context = fakeContext({
      json: async () => {
        throw new SyntaxError("Unexpected token");
      },
    });

    try {
      await parseJsonBody(context);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).status).toBe(400);
      expect((error as AppError).code).toBe("BAD_REQUEST");
      return;
    }

    throw new Error("Expected parseJsonBody to throw");
  });
});

describe("getAuthRequestContext", () => {
  test("prefers cf-connecting-ip over x-forwarded-for", () => {
    const context = getAuthRequestContext(
      fakeContext({
        headers: {
          "cf-connecting-ip": "1.1.1.1",
          "user-agent": "Mozilla/5.0",
          "x-forwarded-for": "2.2.2.2, 3.3.3.3",
        },
      }),
    );

    expect(context.ipAddress).toBe("1.1.1.1");
    expect(context.userAgent).toBe("Mozilla/5.0");
  });

  test("falls back to the first x-forwarded-for entry, trimmed", () => {
    const context = getAuthRequestContext(
      fakeContext({ headers: { "x-forwarded-for": " 2.2.2.2 , 3.3.3.3" } }),
    );

    expect(context.ipAddress).toBe("2.2.2.2");
  });

  test("returns undefined ip when no proxy headers are present", () => {
    const context = getAuthRequestContext(fakeContext({ headers: {} }));

    expect(context.ipAddress).toBeUndefined();
    expect(context.userAgent).toBeUndefined();
  });
});
