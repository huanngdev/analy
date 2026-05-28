import type { NotFoundHandler } from "hono";

import type { AppBindings } from "../app-bindings";

type NotFoundResponse = {
  error: {
    code: "NOT_FOUND";
    message: string;
    requestId: string;
  };
  ok: false;
};

export const notFoundHandler: NotFoundHandler<AppBindings> = (c) => {
  const requestId = c.get("requestId") ?? crypto.randomUUID();

  return c.json<NotFoundResponse>(
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
