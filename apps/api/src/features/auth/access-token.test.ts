import { describe, expect, test } from "bun:test";
import type { AuthUser } from "@repo/shared";
import { SignJWT } from "jose";

import {
  signAccessToken,
  verifyAccessToken,
} from "@/features/auth/access-token";
import { AppError } from "@/lib/errors/app-error";

const user: AuthUser = {
  avatarUrl: null,
  createdAt: new Date("2024-01-01T00:00:00.000Z").toISOString(),
  email: "user@example.com",
  emailVerified: true,
  id: "00000000-0000-4000-8000-000000000000",
  name: "User",
  systemRole: "regular",
};

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

describe("access token", () => {
  test("signs and verifies a token round trip", async () => {
    const token = await signAccessToken(user);
    const payload = await verifyAccessToken(token);

    expect(payload).toEqual({
      email: user.email,
      id: user.id,
      systemRole: "regular",
    });
  });

  test("rejects an empty token", async () => {
    await expectAppError(() => verifyAccessToken(""), 401);
  });

  test("rejects a tampered token", async () => {
    const token = await signAccessToken(user);

    await expectAppError(() => verifyAccessToken(`${token}tampered`), 401);
  });

  test("rejects a token signed with a different secret", async () => {
    const foreign = await new SignJWT({
      email: user.email,
      systemRole: user.systemRole,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(new TextEncoder().encode("a-totally-different-secret-0000000000"));

    await expectAppError(() => verifyAccessToken(foreign), 401);
  });

  test("rejects an expired token", async () => {
    const secret = new TextEncoder().encode(
      process.env.ACCESS_TOKEN_SECRET as string,
    );
    const nowSeconds = Math.floor(Date.now() / 1000);
    const expired = await new SignJWT({
      email: user.email,
      systemRole: user.systemRole,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(user.id)
      .setIssuedAt(nowSeconds - 1000)
      .setExpirationTime(nowSeconds - 10)
      .sign(secret);

    await expectAppError(() => verifyAccessToken(expired), 401);
  });
});
