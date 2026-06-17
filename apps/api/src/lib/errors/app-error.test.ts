import { describe, expect, test } from "bun:test";

import { AppError, isAppError } from "@/lib/errors/app-error";

describe("AppError", () => {
  test("carries code, status, and message", () => {
    const error = new AppError({
      code: "CONFLICT",
      message: "Email is already registered",
      status: 409,
    });

    expect(error.code).toBe("CONFLICT");
    expect(error.status).toBe(409);
    expect(error.message).toBe("Email is already registered");
    expect(error.name).toBe("AppError");
    expect(error).toBeInstanceOf(Error);
  });

  test("preserves the underlying cause", () => {
    const cause = new Error("root cause");
    const error = new AppError({
      cause,
      code: "INTERNAL_SERVER_ERROR",
      message: "boom",
      status: 500,
    });

    expect(error.cause).toBe(cause);
  });
});

describe("isAppError", () => {
  test("returns true for AppError instances", () => {
    expect(
      isAppError(
        new AppError({ code: "BAD_REQUEST", message: "x", status: 400 }),
      ),
    ).toBe(true);
  });

  test("returns false for plain errors and non-errors", () => {
    expect(isAppError(new Error("plain"))).toBe(false);
    expect(isAppError("string")).toBe(false);
    expect(isAppError(null)).toBe(false);
  });
});
