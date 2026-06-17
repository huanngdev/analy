import { describe, expect, test } from "bun:test";

import {
  authLoginRequestSchema,
  authRegisterRequestSchema,
  authUserSchema,
} from "./auth-validation";

describe("authRegisterRequestSchema", () => {
  const valid = {
    confirmPassword: "password123",
    email: "User@Example.com",
    password: "password123",
  };

  test("lowercases the email", () => {
    const result = authRegisterRequestSchema.parse({
      ...valid,
      email: "User@Example.COM",
    });

    expect(result.email).toBe("user@example.com");
  });

  test("trims surrounding whitespace before validating and normalizing", () => {
    const result = authRegisterRequestSchema.parse({
      ...valid,
      email: "  User@Example.COM  ",
    });

    expect(result.email).toBe("user@example.com");
  });

  test("rejects mismatched passwords and reports the confirmPassword path", () => {
    const result = authRegisterRequestSchema.safeParse({
      ...valid,
      confirmPassword: "different123",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["confirmPassword"]);
  });

  test("rejects passwords shorter than 8 characters", () => {
    const result = authRegisterRequestSchema.safeParse({
      confirmPassword: "short",
      email: "user@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
  });

  test("rejects passwords longer than 128 characters", () => {
    const long = "a".repeat(129);
    const result = authRegisterRequestSchema.safeParse({
      confirmPassword: long,
      email: "user@example.com",
      password: long,
    });

    expect(result.success).toBe(false);
  });

  test("rejects an invalid email", () => {
    expect(
      authRegisterRequestSchema.safeParse({ ...valid, email: "not-an-email" })
        .success,
    ).toBe(false);
  });
});

describe("authLoginRequestSchema", () => {
  test("lowercases the email and accepts any non-empty password", () => {
    const result = authLoginRequestSchema.parse({
      email: "ME@Example.IO",
      password: "x",
    });

    expect(result.email).toBe("me@example.io");
    expect(result.password).toBe("x");
  });

  test("rejects an empty password", () => {
    expect(
      authLoginRequestSchema.safeParse({ email: "a@b.co", password: "" })
        .success,
    ).toBe(false);
  });

  test("rejects a password over 128 characters", () => {
    expect(
      authLoginRequestSchema.safeParse({
        email: "a@b.co",
        password: "x".repeat(129),
      }).success,
    ).toBe(false);
  });
});

describe("authUserSchema", () => {
  const user = {
    avatarUrl: null,
    createdAt: new Date("2024-01-01T00:00:00.000Z").toISOString(),
    email: "user@example.com",
    emailVerified: true,
    id: "00000000-0000-4000-8000-000000000000",
    name: "User",
    systemRole: "regular",
  };

  test("accepts a valid user record", () => {
    expect(authUserSchema.safeParse(user).success).toBe(true);
  });

  test("accepts a null avatar and name", () => {
    expect(
      authUserSchema.safeParse({ ...user, avatarUrl: null, name: null })
        .success,
    ).toBe(true);
  });

  test("rejects a non-url avatar", () => {
    expect(
      authUserSchema.safeParse({ ...user, avatarUrl: "not-a-url" }).success,
    ).toBe(false);
  });

  test("rejects an unknown system role", () => {
    expect(
      authUserSchema.safeParse({ ...user, systemRole: "superadmin" }).success,
    ).toBe(false);
  });
});
