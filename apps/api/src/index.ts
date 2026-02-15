import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import 'dotenv/config';
import { env, isDev } from './config/env';
import { logger } from './config/logger';
import { security } from './plugins/security';
import { requestLogger } from './plugins/request-logger';
import { errorHandler } from './plugins/error-handler';
import { routes } from './routes';

const app = new Elysia()
  // Security headers
  .use(security())
  // CORS configuration
  .use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: env.CORS_CREDENTIALS,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposeHeaders: ['Content-Length', 'X-Request-Id'],
      maxAge: 86400, // 24 hours
    })
  )
  // Request logging
  .use(requestLogger())
  // Global error handling
  .use(errorHandler())
  // Set JSON as default response type
  .onAfterHandle({ as: 'global' }, ({ set }) => {
    if (!set.headers['Content-Type']) {
      set.headers['Content-Type'] = 'application/json; charset=utf-8';
    }
  })
  // Register all routes
  .use(routes)
  // Start server
  .listen({
    port: env.PORT,
    hostname: env.HOST,
  });

logger.info('Environment validation passed');
logger.info(`Server started on ${app.server?.hostname}:${app.server?.port}`);
logger.info(`Environment: ${env.NODE_ENV}`);
logger.info(`Log level: ${env.LOG_LEVEL || (isDev ? 'debug' : 'info')}`);
logger.info(`CORS origin: ${env.CORS_ORIGIN}`);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  app.server?.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  app.server?.stop();
  process.exit(0);
});
