import { z } from "zod";
import { logger } from "./pino";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
});

const env = envSchema.parse(process.env);

logger.info(`Env loaded successfully`);
export default env;
