import type { Context } from "hono";

/**
 * Resolve a best-effort client IP from the usual proxy headers, using a single
 * consistent precedence (Cloudflare → first X-Forwarded-For hop → X-Real-IP).
 *
 * NOTE: these headers are client-supplied and are only trustworthy when a
 * trusted reverse proxy overwrites them. Treat the result as advisory (e.g. for
 * rate-limit bucketing or audit metadata), never as a security boundary.
 */
export function getClientIpFromHeaders(headers: Headers): string | undefined {
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  return (
    headers.get("cf-connecting-ip") ??
    (forwardedFor && forwardedFor.length > 0 ? forwardedFor : undefined) ??
    headers.get("x-real-ip") ??
    undefined
  );
}

export function getClientIp(c: Context): string | undefined {
  return getClientIpFromHeaders(c.req.raw.headers);
}
