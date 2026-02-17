import { z } from "zod";
import { logger } from "./pino";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string(),
});

const env = envSchema.parse(process.env);

logger.info(`Env loaded successfully`);
export default env;
