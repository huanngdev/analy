import { Elysia } from 'elysia';
import { z } from 'zod';
import { logger } from '../config/logger';
import { isDev } from '../config/env';

/**
 * Global error handler plugin
 * Handles all errors and formats them into consistent JSON responses
 */
export const errorHandler = () =>
  new Elysia({ name: 'error-handler' }).onError(({ code, error, set }) => {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      logger.warn({ validation_errors: error.issues }, 'Validation failed');
      set.status = 400;
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: error.issues.map(err => ({
            path: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
        },
        timestamp: new Date().toISOString(),
      };
    }

    // Type guard for Error objects
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error({ code, error: errorMessage, stack: errorStack }, 'Request error');

    // Structured error responses
    const errorResponse = {
      error: {
        code,
        message: errorMessage,
        ...(isDev && errorStack && { stack: errorStack }),
      },
      timestamp: new Date().toISOString(),
    };

    switch (code) {
      case 'NOT_FOUND':
        set.status = 404;
        return {
          ...errorResponse,
          error: { ...errorResponse.error, message: 'Route not found' },
        };
      case 'VALIDATION':
        set.status = 400;
        return errorResponse;
      case 'PARSE':
        set.status = 400;
        return {
          ...errorResponse,
          error: { ...errorResponse.error, message: 'Invalid JSON payload' },
        };
      case 'INTERNAL_SERVER_ERROR':
        set.status = 500;
        return {
          ...errorResponse,
          error: {
            ...errorResponse.error,
            message: isDev ? errorMessage : 'Internal server error',
          },
        };
      case 'UNKNOWN':
        set.status = 500;
        return {
          ...errorResponse,
          error: {
            ...errorResponse.error,
            message: isDev ? errorMessage : 'An unexpected error occurred',
          },
        };
      default:
        set.status = 500;
        return errorResponse;
    }
  });
