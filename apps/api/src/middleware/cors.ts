import { cors } from "hono/cors";

import { env } from "@/env";

const allowedOrigins = new Set(env.CORS_ORIGINS);

export const corsMiddleware = cors({
  allowHeaders: ["content-type", "authorization", "x-request-id"],
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
  exposeHeaders: ["x-request-id"],
  origin: (origin) => {
    if (allowedOrigins.has(origin)) {
      return origin;
    }

    return null;
  },
});
