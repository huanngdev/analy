import { beforeEach, describe, expect, mock, test } from "bun:test";
import { REFRESH_SESSION_TTL_SECONDS } from "@repo/shared";

import { AppError } from "@/lib/errors/app-error";

// In-memory Redis stand-in shared by every test in this file.
const store = new Map<string, string>();
const audit = {
  created: [] as unknown[],
  revoked: [] as string[],
  rotated: [] as { expiresAt: Date; sessionId: string }[],
};

mock.module("@/lib/redis", () => ({
  getRedisClient: async () => ({
    del: async (key: string) => (store.delete(key) ? 1 : 0),
    expire: async () => 1,
    get: async (key: string) => store.get(key) ?? null,
    incr: async () => 1,
    ping: async () => "PONG",
    set: async (key: string, value: string) => {
      store.set(key, value);
      return "OK";
    },
  }),
}));

mock.module("@/features/auth/auth-repository", () => ({
  createRefreshSessionAudit: async (session: { userId: string }) => {
    audit.created.push(session);
  },
  revokeRefreshSessionAudit: async (sessionId: string) => {
    audit.revoked.push(sessionId);
  },
  updateRefreshSessionAuditRotation: async (
    sessionId: string,
    expiresAt: Date,
  ) => {
    audit.rotated.push({ expiresAt, sessionId });
  },
}));

const { createRefreshSession, revokeRefreshSession, rotateRefreshSession } =
  await import("@/features/auth/refresh-session-service");

const USER_ID = "11111111-1111-4111-8111-111111111111";
const context = { ipAddress: "203.0.113.5", userAgent: "test-agent" };

async function expectAppError(fn: () => Promise<unknown>, status: number) {
  try {
    await fn();
  } catch (error) {
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).status).toBe(status);
    return;
  }

  throw new Error("Expected the call to throw an AppError");
}

beforeEach(() => {
  store.clear();
  audit.created.length = 0;
  audit.rotated.length = 0;
  audit.revoked.length = 0;
});

describe("createRefreshSession", () => {
  test("stores a hashed token, never the raw token, and writes an audit row", async () => {
    const cookie = await createRefreshSession(USER_ID, context);
    const [sessionId, rawToken] = cookie.split(".");

    expect(sessionId).toBeTruthy();
    expect(rawToken).toBeTruthy();

    const stored = store.get(`auth:refresh-session:${sessionId}`);
    expect(stored).toBeTruthy();

    const session = JSON.parse(stored as string);
    expect(session.userId).toBe(USER_ID);
    expect(session.tokenHash).not.toContain(rawToken);
    expect(audit.created).toHaveLength(1);
  });
});

describe("rotateRefreshSession", () => {
  test("issues a fresh token that can itself be rotated again", async () => {
    const cookie = await createRefreshSession(USER_ID, context);

    const rotated = await rotateRefreshSession(cookie);
    expect(rotated.refreshToken).not.toBe(cookie);
    expect(rotated.userId).toBe(USER_ID);
    expect(audit.rotated).toHaveLength(1);

    // Rotating with the latest token continues the session normally.
    const rotatedAgain = await rotateRefreshSession(rotated.refreshToken);
    expect(rotatedAgain.userId).toBe(USER_ID);
    expect(rotatedAgain.refreshToken).not.toBe(rotated.refreshToken);
  });

  test("reuse of an already-rotated token revokes the whole session", async () => {
    const cookie = await createRefreshSession(USER_ID, context);
    const [sessionId] = cookie.split(".");
    const rotated = await rotateRefreshSession(cookie);

    // Replaying the old, already-rotated cookie is a theft signal.
    await expectAppError(() => rotateRefreshSession(cookie), 401);

    // ...and it tears down the session, so even the latest token stops working.
    expect(audit.revoked).toContain(sessionId);
    await expectAppError(() => rotateRefreshSession(rotated.refreshToken), 401);
  });

  test("slides the expiry window forward on each rotation", async () => {
    const cookie = await createRefreshSession(USER_ID, context);
    const [sessionId] = cookie.split(".");
    const key = `auth:refresh-session:${sessionId}`;

    // Simulate an aged session that is still valid (expires in 1000s).
    const aged = JSON.parse(store.get(key) as string);
    aged.expiresAt = new Date(Date.now() + 1000 * 1000).toISOString();
    store.set(key, JSON.stringify(aged));

    const rotated = await rotateRefreshSession(cookie);

    // The renewed window is the full TTL, not the ~1000s that remained.
    expect(rotated.refreshTokenMaxAge).toBeGreaterThan(
      REFRESH_SESSION_TTL_SECONDS - 60,
    );
  });

  test("rejects missing, malformed, and unknown cookies", async () => {
    await expectAppError(() => rotateRefreshSession(undefined), 401);
    await expectAppError(() => rotateRefreshSession("no-separator"), 401);
    await expectAppError(() => rotateRefreshSession("aaaa.bbbb.cccc"), 401);
    await expectAppError(
      () =>
        rotateRefreshSession(
          "22222222-2222-4222-8222-222222222222.unknown-token",
        ),
      401,
    );
  });

  test("rejects a tampered token for a known session", async () => {
    const cookie = await createRefreshSession(USER_ID, context);
    const [sessionId] = cookie.split(".");

    await expectAppError(
      () => rotateRefreshSession(`${sessionId}.tampered-token`),
      401,
    );
  });

  test("rejects an expired session", async () => {
    const cookie = await createRefreshSession(USER_ID, context);
    const [sessionId] = cookie.split(".");
    const key = `auth:refresh-session:${sessionId}`;
    const session = JSON.parse(store.get(key) as string);
    session.expiresAt = new Date(Date.now() - 1000).toISOString();
    store.set(key, JSON.stringify(session));

    await expectAppError(() => rotateRefreshSession(cookie), 401);
  });
});

describe("revokeRefreshSession", () => {
  test("deletes the session, records the audit, and blocks reuse", async () => {
    const cookie = await createRefreshSession(USER_ID, context);
    const [sessionId] = cookie.split(".");

    await revokeRefreshSession(cookie);

    expect(store.has(`auth:refresh-session:${sessionId}`)).toBe(false);
    expect(audit.revoked).toContain(sessionId);
    await expectAppError(() => rotateRefreshSession(cookie), 401);
  });

  test("is a no-op for an empty cookie", async () => {
    await revokeRefreshSession(undefined);
    expect(audit.revoked).toHaveLength(0);
  });
});
