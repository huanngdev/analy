import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "drizzle-kit";

const apiDir = dirname(fileURLToPath(import.meta.url));

function readApiEnv() {
  const envPath = resolve(apiDir, ".env");

  if (!existsSync(envPath)) {
    return;
  }

  const entries = readFileSync(envPath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  for (const entry of entries) {
    const [key, ...valueParts] = entry.split("=");

    if (!key || key in process.env) {
      continue;
    }

    process.env[key] = valueParts.join("=");
  }
}

readApiEnv();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for Drizzle");
}

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  out: "./packages/shared/src/db/migrations",
  schema: "./packages/shared/src/db/schema/index.ts",
  strict: true,
});
