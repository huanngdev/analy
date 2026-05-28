import type { ContentfulStatusCode } from "hono/utils/http-status";

export type AppErrorCode =
  | "BAD_REQUEST"
  | "FORBIDDEN"
  | "INTERNAL_SERVER_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR";

type AppErrorOptions = {
  cause?: unknown;
  code: AppErrorCode;
  message: string;
  status: ContentfulStatusCode;
};

export class AppError extends Error {
  readonly code: AppErrorCode;
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
