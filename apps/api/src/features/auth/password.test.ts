import { describe, expect, test } from "bun:test";

import { hashPassword, verifyPassword } from "@/features/auth/password";

describe("password hashing", () => {
  test("verifies a correct password against its hash", async () => {
    const hash = await hashPassword("correct horse battery staple");

    expect(await verifyPassword(hash, "correct horse battery staple")).toBe(
      true,
    );
  });

  test("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct horse battery staple");

    expect(await verifyPassword(hash, "wrong password")).toBe(false);
  });

  test("never stores the plaintext and salts each hash uniquely", async () => {
    const first = await hashPassword("same-password");
    const second = await hashPassword("same-password");

    expect(first).not.toBe("same-password");
    expect(first).not.toBe(second);
  });
});
