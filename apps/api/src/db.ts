import { dbSchema } from "@repo/shared";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "./env";
import {
  logDatabaseConnecting,
  logDatabaseError,
  logDatabaseReady,
} from "./logger";

const client = postgres(env.DATABASE_URL, {
  connect_timeout: 5,
  max: 10,
});

export const db = drizzle(client, { schema: dbSchema });

export async function assertDatabaseConnection() {
  logDatabaseConnecting();

  try {
    await client`select 1`;
    logDatabaseReady();
  } catch (error) {
    logDatabaseError(error);
    await client.end({ timeout: 1 });
    throw error;
  }
}

export async function closeDatabaseConnection() {
  await client.end({ timeout: 5 });
}
