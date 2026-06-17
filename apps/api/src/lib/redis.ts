import { createClient } from "redis";

import { env } from "@/config/env";
import { logRedisConnecting, logRedisError, logRedisReady } from "@/lib/logger";

const redisClient = createClient({
  url: env.REDIS_URL,
});

let connectPromise: Promise<void> | undefined;

export type RedisSessionClient = {
  del(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number | boolean>;
  get(key: string): Promise<string | null>;
  incr(key: string): Promise<number>;
  ping(): Promise<string>;
  set(
    key: string,
    value: string,
    options: { EX: number },
  ): Promise<string | null>;
};

redisClient.on("error", (error) => {
  logRedisError(error);
});

export async function getRedisClient(): Promise<RedisSessionClient> {
  if (!redisClient.isOpen) {
    connectPromise ??= redisClient.connect().then(() => undefined);
  }

  await connectPromise;

  return redisClient;
}

export async function assertRedisConnection() {
  logRedisConnecting();

  const client = await getRedisClient();
  await client.ping();

  logRedisReady();
}

export async function checkRedisConnection(): Promise<boolean> {
  try {
    const client = await getRedisClient();
    await client.ping();
    return true;
  } catch (error) {
    logRedisError(error);
    return false;
  }
}

export async function closeRedisConnection() {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
}
