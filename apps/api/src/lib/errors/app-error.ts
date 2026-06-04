import type { ApiErrorCode } from "@repo/shared";
import type { ContentfulStatusCode } from "hono/utils/http-status";

type AppErrorOptions = {
  cause?: unknown;
  code: ApiErrorCode;
  message: string;
  status: ContentfulStatusCode;
};

export class AppError extends Error {
  readonly code: ApiErrorCode;
  readonly status: ContentfulStatusCode;

  constructor({ cause, code, message, status }: AppErrorOptions) {
    super(message, { cause });
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
