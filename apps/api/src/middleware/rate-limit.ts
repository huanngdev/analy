import type { ApiErrorResponse } from "@repo/shared";
import type { MiddlewareHandler } from "hono";

import type { AppBindings } from "@/app-bindings";
import { getRedisClient } from "@/redis";

const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_SECONDS = 1;

function getClientIp(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  return (
    forwardedFor ??
    headers.get("cf-connecting-ip") ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}

export const rateLimitMiddleware: MiddlewareHandler<AppBindings> = async (
  c,
  next,
) => {
  const now = Math.floor(Date.now() / 1000);
  const clientIp = getClientIp(c.req.raw.headers);
  const redisKey = `rate-limit:${clientIp}:${now}`;
  const client = await getRedisClient();
  const requestCount = await client.incr(redisKey);

  if (requestCount === 1) {
    await client.expire(redisKey, RATE_LIMIT_WINDOW_SECONDS);
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
