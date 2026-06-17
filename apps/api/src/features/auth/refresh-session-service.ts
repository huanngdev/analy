import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { REFRESH_SESSION_TTL_SECONDS } from "@repo/shared";
import { z } from "zod";

import {
  createRefreshSessionAudit,
  revokeRefreshSessionAudit,
  updateRefreshSessionAuditRotation,
} from "@/features/auth/auth-repository";
import type { AuthRequestContext } from "@/features/auth/request-context";
import { env } from "@/config/env";
import { AppError } from "@/lib/errors/app-error";
import { getRedisClient } from "@/lib/redis";

const refreshSessionSchema = z.object({
  createdAt: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
  ipHash: z.string().optional(),
  lastRotatedAt: z.iso.datetime(),
  sessionId: z.uuid(),
  tokenHash: z.string().min(1),
  userAgent: z.string().optional(),
  userId: z.uuid(),
});

type RefreshSession = z.infer<typeof refreshSessionSchema>;

function redisSessionKey(sessionId: string) {
  return `auth:refresh-session:${sessionId}`;
}

function createRefreshToken() {
  return randomBytes(48).toString("base64url");
}

function createRefreshTokenHash(sessionId: string, refreshToken: string) {
  return createHmac("sha256", env.REFRESH_TOKEN_SECRET)
    .update(`${sessionId}.${refreshToken}`)
    .digest("hex");
}

function createIpHash(ipAddress: string | undefined) {
  if (!ipAddress) {
    return undefined;
  }

  return createHmac("sha256", env.REFRESH_TOKEN_SECRET)
    .update(ipAddress)
    .digest("hex");
}

function createExpiresAt() {
  return new Date(Date.now() + REFRESH_SESSION_TTL_SECONDS * 1000);
}

function getRemainingSeconds(expiresAt: string) {
  return Math.max(Math.ceil((Date.parse(expiresAt) - Date.now()) / 1000), 1);
}

function createCookieValue(sessionId: string, refreshToken: string) {
  return `${sessionId}.${refreshToken}`;
}

function parseCookieValue(cookieValue: string | undefined) {
  if (!cookieValue) {
    return undefined;
  }

  const [sessionId, refreshToken, extra] = cookieValue.split(".");

  if (!sessionId || !refreshToken || extra) {
    return undefined;
  }

  return { refreshToken, sessionId };
}

function compareHashes(expected: string, actual: string) {
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(actual, "hex");

  return (
    expectedBuffer.length === actualBuffer.length &&
    timingSafeEqual(expectedBuffer, actualBuffer)
  );
}

async function saveRedisSession(session: RefreshSession) {
  const client = await getRedisClient();

  await client.set(
    redisSessionKey(session.sessionId),
    JSON.stringify(session),
    {
      EX: getRemainingSeconds(session.expiresAt),
    },
  );
}

async function readRedisSession(sessionId: string) {
  const client = await getRedisClient();
  const value = await client.get(redisSessionKey(sessionId));

  if (!value) {
    return undefined;
  }

  try {
    return refreshSessionSchema.parse(JSON.parse(value));
  } catch {
    return undefined;
  }
}

function unauthorized() {
  return new AppError({
    code: "UNAUTHORIZED",
    message: "Authentication required",
    status: 401,
  });
}

async function deleteRedisSession(sessionId: string) {
  const client = await getRedisClient();
  await client.del(redisSessionKey(sessionId));
}

export async function createRefreshSession(
  userId: string,
  context: AuthRequestContext,
) {
  const sessionId = crypto.randomUUID();
  const refreshToken = createRefreshToken();
  const now = new Date();
  const expiresAt = createExpiresAt();
  const session: RefreshSession = {
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    ipHash: createIpHash(context.ipAddress),
    lastRotatedAt: now.toISOString(),
    sessionId,
    tokenHash: createRefreshTokenHash(sessionId, refreshToken),
    userAgent: context.userAgent,
    userId,
  };

  await saveRedisSession(session);

  try {
    await createRefreshSessionAudit({
      expiresAt,
      id: sessionId,
      ipHash: session.ipHash,
      redisKey: redisSessionKey(sessionId),
      userAgent: session.userAgent,
      userId,
    });
  } catch (error) {
    const client = await getRedisClient();
    await client.del(redisSessionKey(sessionId));
    throw error;
  }

  return createCookieValue(sessionId, refreshToken);
}

export async function rotateRefreshSession(refreshCookie: string | undefined) {
  const parsedCookie = parseCookieValue(refreshCookie);

  if (!parsedCookie) {
    throw unauthorized();
  }

  const session = await readRedisSession(parsedCookie.sessionId);

  if (!session) {
    throw unauthorized();
  }

  if (Date.parse(session.expiresAt) <= Date.now()) {
    await deleteRedisSession(session.sessionId);
    await revokeRefreshSessionAudit(session.sessionId);
    throw unauthorized();
  }

  const refreshTokenHash = createRefreshTokenHash(
    parsedCookie.sessionId,
    parsedCookie.refreshToken,
  );

  if (!compareHashes(session.tokenHash, refreshTokenHash)) {
    // The presented token does not match the session's current secret. The
    // browser only ever holds the latest token, so this means either tampering
    // or replay of an already-rotated token (a theft signal). Revoke the whole
    // session so a leaked token cannot be reused against a live session.
    await deleteRedisSession(session.sessionId);
    await revokeRefreshSessionAudit(session.sessionId);
    throw unauthorized();
  }

  // Sliding expiration: each rotation extends the session window so active
  // users stay signed in, rather than being cut off at a fixed point from
  // first login.
  const nextRefreshToken = createRefreshToken();
  const expiresAt = createExpiresAt();
  const rotatedSession: RefreshSession = {
    ...session,
    expiresAt: expiresAt.toISOString(),
    lastRotatedAt: new Date().toISOString(),
    tokenHash: createRefreshTokenHash(session.sessionId, nextRefreshToken),
  };

  await saveRedisSession(rotatedSession);
  await updateRefreshSessionAuditRotation(session.sessionId, expiresAt);

  return {
    refreshToken: createCookieValue(session.sessionId, nextRefreshToken),
    refreshTokenMaxAge: getRemainingSeconds(rotatedSession.expiresAt),
    userId: session.userId,
  };
}

export async function revokeRefreshSession(refreshCookie: string | undefined) {
  const parsedCookie = parseCookieValue(refreshCookie);

  if (!parsedCookie) {
    return;
  }

  await deleteRedisSession(parsedCookie.sessionId);
  await revokeRefreshSessionAudit(parsedCookie.sessionId);
}
