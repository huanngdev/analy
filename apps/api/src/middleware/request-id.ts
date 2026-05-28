import type { MiddlewareHandler } from "hono";

import type { AppBindings } from "@/app-bindings";

const REQUEST_ID_HEADER = "x-request-id";

export const requestIdMiddleware: MiddlewareHandler<AppBindings> = async (
  c,
  next,
) => {
  const requestId = c.req.header(REQUEST_ID_HEADER) ?? crypto.randomUUID();

  c.set("requestId", requestId);
  c.header(REQUEST_ID_HEADER, requestId);

  await next();
};
