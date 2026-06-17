import type { Context } from "hono";

import { getClientIpFromHeaders } from "@/lib/client-ip";
import { AppError } from "@/lib/errors/app-error";

export type AuthRequestContext = {
  ipAddress?: string;
  userAgent?: string;
};

export async function parseJsonBody(c: Context): Promise<unknown> {
  try {
    return await c.req.json();
  } catch (error) {
    throw new AppError({
      cause: error,
      code: "BAD_REQUEST",
      message: "Request body must be valid JSON",
      status: 400,
    });
  }
}

export function getAuthRequestContext(c: Context): AuthRequestContext {
  const headers = c.req.raw.headers;

  return {
    ipAddress: getClientIpFromHeaders(headers),
    userAgent: headers.get("user-agent") ?? undefined,
  };
}
