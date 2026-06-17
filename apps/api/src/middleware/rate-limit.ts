import type { ApiErrorResponse } from "@repo/shared";
import type { MiddlewareHandler } from "hono";

import type { AppBindings } from "@/server/app-bindings";
import { getClientIpFromHeaders } from "@/lib/client-ip";
import { logRedisError } from "@/lib/logger";
import { getRedisClient } from "@/lib/redis";

const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_SECONDS = 1;

// Liveness/readiness probes must never be rate limited.
const RATE_LIMIT_EXEMPT_PATHS = new Set(["/health"]);

export const rateLimitMiddleware: MiddlewareHandler<AppBindings> = async (
  c,
  next,
) => {
  if (RATE_LIMIT_EXEMPT_PATHS.has(c.req.path)) {
    return next();
  }

  const now = Math.floor(Date.now() / 1000);
  const clientIp = getClientIpFromHeaders(c.req.raw.headers) ?? "unknown";
  const redisKey = `rate-limit:${clientIp}:${now}`;

  let requestCount: number;

  try {
    const client = await getRedisClient();
    requestCount = await client.incr(redisKey);

    if (requestCount === 1) {
      await client.expire(redisKey, RATE_LIMIT_WINDOW_SECONDS);
    }
  } catch (error) {
    // Fail open: a Redis outage must not take the whole API down with it.
    logRedisError(error);

    return next();
  }

  const remaining = Math.max(RATE_LIMIT_MAX_REQUESTS - requestCount, 0);

  c.header("RateLimit-Limit", String(RATE_LIMIT_MAX_REQUESTS));
  c.header("RateLimit-Remaining", String(remaining));
  c.header("RateLimit-Reset", String(now + RATE_LIMIT_WINDOW_SECONDS));

  if (requestCount > RATE_LIMIT_MAX_REQUESTS) {
    const requestId = c.get("requestId");

    c.header("Retry-After", String(RATE_LIMIT_WINDOW_SECONDS));

    return c.json<ApiErrorResponse>(
      {
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests",
          requestId,
        },
        ok: false,
      },
      429,
    );
  }

  await next();
};
