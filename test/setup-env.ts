// Shared test bootstrap, loaded via `bunfig.toml` `[test] preload`.
//
// The API parses `process.env` with `apiEnvSchema` at import time
// (`apps/api/src/config/env.ts`), so every required variable must exist before
// any module that transitively imports `@/config/env` is loaded. Values use
// `??=` so a real environment (CI, local `.env`) is never overwritten.
const defaults: Record<string, string> = {
  NODE_ENV: "test",
  ACCESS_TOKEN_SECRET: "test-access-token-secret-000000000000000000",
  REFRESH_TOKEN_SECRET: "test-refresh-token-secret-00000000000000000",
  DATABASE_URL: "postgresql://test:test@localhost:5432/analy_test",
  REDIS_URL: "redis://localhost:6379",
  GITHUB_CLIENT_ID: "test-github-client-id",
  GITHUB_CLIENT_SECRET: "test-github-client-secret",
  GOOGLE_CLIENT_ID: "test-google-client-id",
  GOOGLE_CLIENT_SECRET: "test-google-client-secret",
  API_PUBLIC_URL: "http://localhost:5000",
  WEB_APP_URL: "http://localhost:3000",
  VITE_API_URL: "http://localhost:5000",
};

for (const [key, value] of Object.entries(defaults)) {
  process.env[key] ??= value;
}
