export const API_ERROR_CODES = [
  "BAD_REQUEST",
  "CONFLICT",
  "FORBIDDEN",
  "INTERNAL_SERVER_ERROR",
  "NOT_FOUND",
  "UNAUTHORIZED",
  "VALIDATION_ERROR",
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export type ApiErrorResponse = {
  error: {
    code: ApiErrorCode;
    message: string;
    requestId: string;
  };
  ok: false;
};

export type ApiResponse<TSuccess> = TSuccess | ApiErrorResponse;
