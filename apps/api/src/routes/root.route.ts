import { Elysia } from 'elysia';
import { env } from '../config/env';

export const rootRoute = new Elysia({ prefix: '' }).get('/', () => ({
  message: 'Analy API 2',
  version: '1.0.0',
  environment: env.NODE_ENV,
  timestamp: new Date().toISOString(),
}));
