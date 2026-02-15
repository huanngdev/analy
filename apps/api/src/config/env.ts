import { t } from 'elysia';

/**
 * Environment variable schema using Elysia's TypeBox
 */
const envSchema = t.Object({
  // Server Configuration
  NODE_ENV: t.Union([t.Literal('development'), t.Literal('production'), t.Literal('test')], {
    default: 'development',
  }),
  PORT: t.Number({ minimum: 1, maximum: 65535, default: 3000 }),
  HOST: t.String({ default: '0.0.0.0' }),
  LOG_LEVEL: t.Optional(
    t.Union([
      t.Literal('trace'),
      t.Literal('debug'),
      t.Literal('info'),
      t.Literal('warn'),
      t.Literal('error'),
      t.Literal('fatal'),
    ])
  ),

  // CORS Configuration
  CORS_ORIGIN: t.String({ default: '*' }),
  CORS_CREDENTIALS: t.Boolean({ default: true }),

  // Database Configuration
  DATABASE_URL: t.String({ minLength: 1 }),

  // Redis Configuration
  REDIS_URL: t.Optional(t.String()),

  // MinIO/S3 Configuration
  MINIO_ENDPOINT: t.String({ default: 'localhost' }),
  MINIO_PORT: t.Number({ minimum: 1, maximum: 65535, default: 9000 }),
  MINIO_ROOT_USER: t.String({ minLength: 1 }),
  MINIO_ROOT_PASSWORD: t.String({ minLength: 8 }),
  MINIO_USE_SSL: t.Boolean({ default: false }),
  MINIO_BUCKET: t.String({ default: 'analy' }),
});

type EnvSchema = typeof envSchema.static;

/**
 * Parse and validate environment variables
 */
function parseEnv(): EnvSchema {
  const rawEnv = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
    HOST: process.env.HOST || '0.0.0.0',
    LOG_LEVEL: process.env.LOG_LEVEL as
      | 'trace'
      | 'debug'
      | 'info'
      | 'warn'
      | 'error'
      | 'fatal'
      | undefined,

    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    CORS_CREDENTIALS: process.env.CORS_CREDENTIALS !== 'false',

    // Database
    DATABASE_URL: process.env.DATABASE_URL || '',

    // Redis
    REDIS_URL: process.env.REDIS_URL,

    // MinIO
    MINIO_ENDPOINT: process.env.MINIO_ENDPOINT || 'localhost',
    MINIO_PORT: process.env.MINIO_PORT ? Number(process.env.MINIO_PORT) : 9000,
    MINIO_ROOT_USER: process.env.MINIO_ROOT_USER || '',
    MINIO_ROOT_PASSWORD: process.env.MINIO_ROOT_PASSWORD || '',
    MINIO_USE_SSL: process.env.MINIO_USE_SSL === 'true',
    MINIO_BUCKET: process.env.MINIO_BUCKET || 'analy',
  };

  // Manual validation for critical fields
  const errors: string[] = [];

  // Validate PORT
  if (isNaN(rawEnv.PORT) || rawEnv.PORT < 1 || rawEnv.PORT > 65535) {
    errors.push('PORT must be a number between 1 and 65535');
  }

  // Validate required database fields
  if (!rawEnv.DATABASE_URL) errors.push('DATABASE_URL is required');

  // Validate Redis
  if (!rawEnv.REDIS_URL) errors.push('REDIS_URL is required');

  // Validate MinIO
  if (!rawEnv.MINIO_ROOT_USER) errors.push('MINIO_ROOT_USER is required');
  if (!rawEnv.MINIO_ROOT_PASSWORD) {
    errors.push('MINIO_ROOT_PASSWORD is required');
  } else if (rawEnv.MINIO_ROOT_PASSWORD.length < 8) {
    errors.push('MINIO_ROOT_PASSWORD must be at least 8 characters');
  }
  if (isNaN(rawEnv.MINIO_PORT) || rawEnv.MINIO_PORT < 1 || rawEnv.MINIO_PORT > 65535) {
    errors.push('MINIO_PORT must be a number between 1 and 65535');
  }

  if (errors.length > 0) {
    console.error('❌ Environment validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }

  return rawEnv as EnvSchema;
}

/**
 * Validated and type-safe environment configuration
 */
export const env = parseEnv();

/**
 * Helper to construct DATABASE_URL if not provided
 */
export function getDatabaseUrl(): string {
  return env.DATABASE_URL || '';
}

/**
 * Helper to construct REDIS_URL if not provided
 */
export function getRedisUrl(): string {
  return env.REDIS_URL || '';
}

/**
 * Check if running in production
 */
export const isProd = env.NODE_ENV === 'production';

/**
 * Check if running in development
 */
export const isDev = env.NODE_ENV === 'development';

/**
 * Check if running in test
 */
export const isTest = env.NODE_ENV === 'test';
