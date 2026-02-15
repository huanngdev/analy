import { Elysia } from 'elysia';
import { env, getDatabaseUrl, getRedisUrl } from '../config/env';
import { logger } from '../config/logger';

export const healthRoute = new Elysia({ prefix: '/health' })

  .get('/', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  }))
  .get('/detailed', async () => {
    const services = {
      database: getDatabaseUrl().replace(/:[^:]*@/, ':***@'), // Hide password
      redis: getRedisUrl().replace(/:[^:]*@/, ':***@'), // Hide password
      storage: `${env.MINIO_ENDPOINT}:${env.MINIO_PORT}`,
    };

    logger.debug({ services }, 'Detailed health check requested');

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      services,
      system: {
        memory: {
          total: process.memoryUsage().heapTotal,
          used: process.memoryUsage().heapUsed,
          external: process.memoryUsage().external,
        },
        cpu: process.cpuUsage(),
      },
    };
  })
  .get('/ready', () => ({
    ready: true,
    timestamp: new Date().toISOString(),
  }))
  .get('/live', () => ({
    alive: true,
    timestamp: new Date().toISOString(),
  }));
