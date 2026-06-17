import { describe, expect, mock, test } from "bun:test";
import type { ApiErrorResponse } from "@repo/shared";
import type { Context } from "hono";
import { z } from "zod";

import type { AppBindings } from "@/server/app-bindings";
import { AppError } from "@/lib/errors/app-error";

// Silence the unhandled-error log path so the test output stays clean.
mock.module("@/lib/logger", () => ({
  logUnhandledError: () => {},
}));

const { errorHandler } = await import("@/middleware/error-handler");

type CapturedResponse = { body: ApiErrorResponse; status?: number };

function fakeContext(): Context<AppBindings> {
  return {
    get: () => "req-123",
    json: (body: ApiErrorResponse, status?: number): CapturedResponse => ({
      body,
      status,
    }),
  } as unknown as Context<AppBindings>;
}

describe("errorHandler", () => {
  test("maps an AppError to its status, code, and request id", () => {
    const result = errorHandler(
      new AppError({ code: "CONFLICT", message: "duplicate", status: 409 }),
      fakeContext(),
    ) as unknown as CapturedResponse;

    expect(result.status).toBe(409);
    expect(result.body.ok).toBe(false);
    expect(result.body.error.code).toBe("CONFLICT");
    expect(result.body.error.message).toBe("duplicate");
    expect(result.body.error.requestId).toBe("req-123");
  });

  test("maps a ZodError to a 400 validation error", () => {
    let zodError: unknown;
    try {
      z.object({ name: z.string() }).parse({});
    } catch (error) {
      zodError = error;
    }

    const result = errorHandler(
      zodError as Error,
      fakeContext(),
    ) as unknown as CapturedResponse;

    expect(result.status).toBe(400);
    expect(result.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("maps an unknown error to a 500 with a generic message", () => {
    const result = errorHandler(
      new Error("boom"),
      fakeContext(),
    ) as unknown as CapturedResponse;

    expect(result.status).toBe(500);
    expect(result.body.error.code).toBe("INTERNAL_SERVER_ERROR");
    expect(result.body.error.message).toBe("Something went wrong");
  });
});
