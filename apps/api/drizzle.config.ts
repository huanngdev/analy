import { defineConfig } from "drizzle-kit";
import env from "./src/config/env";

export default defineConfig({
  schema: "../../packages/shared/db_schema",
  out: "./src/infrastructure/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
