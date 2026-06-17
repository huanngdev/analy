import { describe, expect, test } from "bun:test";

import { apiEnvSchema, webEnvSchema } from "./env-validation";

const baseApiEnv = {
  ACCESS_TOKEN_SECRET: "a".repeat(32),
  DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
  GITHUB_CLIENT_ID: "github-id",
  GITHUB_CLIENT_SECRET: "github-secret",
  GOOGLE_CLIENT_ID: "google-id",
  GOOGLE_CLIENT_SECRET: "google-secret",
  REDIS_URL: "redis://localhost:6379",
  REFRESH_TOKEN_SECRET: "b".repeat(32),
};

describe("apiEnvSchema", () => {
  test("applies defaults for optional values", () => {
    const env = apiEnvSchema.parse(baseApiEnv);

    expect(env.PORT).toBe(5000);
    expect(env.NODE_ENV).toBe("development");
    expect(env.API_PUBLIC_URL).toBe("http://localhost:5000");
    expect(env.WEB_APP_URL).toBe("http://localhost:3000");
    expect(env.CORS_ORIGINS).toEqual(["http://localhost:3000"]);
  });

  test("coerces the PORT string into a number", () => {
    const env = apiEnvSchema.parse({ ...baseApiEnv, PORT: "8080" });

    expect(env.PORT).toBe(8080);
  });

  test("splits, trims, and filters CORS_ORIGINS", () => {
    const env = apiEnvSchema.parse({
      ...baseApiEnv,
      CORS_ORIGINS: "http://a.com, http://b.com,",
    });

    expect(env.CORS_ORIGINS).toEqual(["http://a.com", "http://b.com"]);
  });

  test("rejects a missing secret", () => {
    const rest = { ...baseApiEnv } as Partial<typeof baseApiEnv>;
    delete rest.ACCESS_TOKEN_SECRET;

    expect(apiEnvSchema.safeParse(rest).success).toBe(false);
  });

  test("rejects a secret shorter than 32 characters", () => {
    expect(
      apiEnvSchema.safeParse({ ...baseApiEnv, ACCESS_TOKEN_SECRET: "short" })
        .success,
    ).toBe(false);
  });

  test("rejects a non-postgres database url", () => {
    expect(
      apiEnvSchema.safeParse({
        ...baseApiEnv,
        DATABASE_URL: "mysql://user:pass@localhost:3306/db",
      }).success,
    ).toBe(false);
  });

  test("rejects an out-of-range port", () => {
    expect(
      apiEnvSchema.safeParse({ ...baseApiEnv, PORT: "70000" }).success,
    ).toBe(false);
  });
});

describe("webEnvSchema", () => {
  test("defaults VITE_API_URL when absent", () => {
    expect(webEnvSchema.parse({}).VITE_API_URL).toBe("http://localhost:5000");
  });

  test("keeps a provided VITE_API_URL", () => {
    expect(
      webEnvSchema.parse({ VITE_API_URL: "https://api.analy.dev" })
        .VITE_API_URL,
    ).toBe("https://api.analy.dev");
  });

  test("rejects a non-url VITE_API_URL", () => {
    expect(webEnvSchema.safeParse({ VITE_API_URL: "nope" }).success).toBe(
      false,
    );
  });
});
