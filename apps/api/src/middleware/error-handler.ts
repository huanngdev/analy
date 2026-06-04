import type { ApiErrorResponse } from "@repo/shared";
import type { ErrorHandler } from "hono";
import { ZodError } from "zod";

import type { AppBindings } from "@/server/app-bindings";
import { isAppError } from "@/lib/errors/app-error";
import { logUnhandledError } from "@/lib/logger";

export const errorHandler: ErrorHandler<AppBindings> = (error, c) => {
  const requestId = c.get("requestId") ?? crypto.randomUUID();

  if (isAppError(error)) {
    return c.json<ApiErrorResponse>(
      {
        error: {
          code: error.code,
          message: error.message,
          requestId,
        },
        ok: false,
      },
      error.status,
    );
  }

  if (error instanceof ZodError) {
    return c.json<ApiErrorResponse>(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          requestId,
        },
        ok: false,
      },
      400,
    );
  }

  logUnhandledError(error, requestId);

  return c.json<ApiErrorResponse>(
    {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
        requestId,
      },
      ok: false,
    },
    500,
  );
};
