import pino from 'pino';
import { env, isDev } from './env';

/**
 * Pino logger configuration
 */
export const logger = pino({
  level: env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
        singleLine: false,
        messageFormat: '{msg}',
      },
    },
  }),
  ...(!isDev && {
    formatters: {
      level: label => {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  }),
  serializers: {
    req: req => ({
      method: req.method,
      url: req.url,
      headers: req.headers,
    }),
    res: res => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
});

/**
 * Log levels:
 * - trace (10): Very detailed, typically only enabled when investigating specific issues
 * - debug (20): Detailed information for debugging
 * - info (30): General informational messages
 * - warn (40): Warning messages
 * - error (50): Error messages
 * - fatal (60): Fatal errors that cause the application to exit
 */

export default logger;
