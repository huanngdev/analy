import type { ApiErrorResponse } from "@repo/shared";
import type { NotFoundHandler } from "hono";

import type { AppBindings } from "@/server/app-bindings";

export const notFoundHandler: NotFoundHandler<AppBindings> = (c) => {
  const requestId = c.get("requestId") ?? crypto.randomUUID();

  return c.json<ApiErrorResponse>(
    {
      error: {
        code: "NOT_FOUND",
        message: "Route not found",
        requestId,
      },
      ok: false,
    },
    404,
  );
};
