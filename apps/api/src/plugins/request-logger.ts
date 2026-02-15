import { Elysia } from 'elysia';
import { logger } from '../config/logger';

/**
 * Request logging plugin using Pino
 * Logs all incoming requests and responses with timing information
 */
export const requestLogger = () =>
  new Elysia({ name: 'request-logger' })
    .onRequest(({ request, store }) => {
      // Store start time for response timing
      (store as any).startTime = Date.now();

      logger.debug({
        msg: 'Incoming request',
        method: request.method,
        url: request.url,
        headers: request.headers.get('user-agent'),
      });
    })
    .onAfterHandle(({ request, store, set }) => {
      const duration = Date.now() - ((store as any).startTime || Date.now());

      logger.info({
        msg: 'Request completed',
        method: request.method,
        url: request.url,
        status: set.status || 200,
        duration: `${duration}ms`,
      });
    })
    .onError(({ request, error, code, store }) => {
      const duration = Date.now() - ((store as any).startTime || Date.now());

      // Type guard for Error objects
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error(
        {
          method: request.method,
          url: request.url,
          error: errorMessage,
          code,
          duration: `${duration}ms`,
          ...(errorStack && { stack: errorStack }),
        },
        'Request failed'
      );
    });
