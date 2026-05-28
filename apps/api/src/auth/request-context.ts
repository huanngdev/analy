import type { Context } from "hono";

import { AppError } from "@/errors/app-error";

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
  return {
    ipAddress:
      c.req.header("cf-connecting-ip") ??
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim(),
    userAgent: c.req.header("user-agent"),
  };
}
