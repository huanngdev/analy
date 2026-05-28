import type { ErrorHandler } from "hono";
import { ZodError } from "zod";

import type { AppBindings } from "../app-bindings";
import { isAppError } from "../errors/app-error";
import { logUnhandledError } from "../logger";

type ErrorResponse = {
  error: {
    code: string;
    message: string;
    requestId: string;
  };
  ok: false;
};

export const errorHandler: ErrorHandler<AppBindings> = (error, c) => {
  const requestId = c.get("requestId") ?? crypto.randomUUID();

  if (isAppError(error)) {
    return c.json<ErrorResponse>(
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
    return c.json<ErrorResponse>(
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

  return c.json<ErrorResponse>(
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
