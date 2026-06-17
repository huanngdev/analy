import { describe, expect, test } from "bun:test";
import { AxiosError, AxiosHeaders } from "axios";

import { getApiErrorMessage, isApiError } from "@/lib/api-client";

function apiError(message: string): AxiosError {
  return new AxiosError(
    "Request failed with status code 400",
    "ERR_BAD_REQUEST",
    { headers: new AxiosHeaders() } as never,
    undefined,
    {
      config: { headers: new AxiosHeaders() } as never,
      data: {
        error: { code: "BAD_REQUEST", message, requestId: "r1" },
        ok: false,
      },
      headers: {},
      status: 400,
      statusText: "Bad Request",
    },
  );
}

describe("isApiError", () => {
  test("detects axios errors", () => {
    expect(isApiError(apiError("x"))).toBe(true);
  });

  test("rejects plain errors and non-errors", () => {
    expect(isApiError(new Error("nope"))).toBe(false);
    expect(isApiError("nope")).toBe(false);
  });
});

describe("getApiErrorMessage", () => {
  test("prefers the structured api error message", () => {
    expect(getApiErrorMessage(apiError("Email is already registered"))).toBe(
      "Email is already registered",
    );
  });

  test("falls back to a plain Error message", () => {
    expect(getApiErrorMessage(new Error("network down"))).toBe("network down");
  });

  test("uses a final generic fallback for unknown values", () => {
    expect(getApiErrorMessage("weird")).toBe("Something went wrong");
  });
});
