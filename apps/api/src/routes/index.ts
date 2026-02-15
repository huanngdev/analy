import { Elysia } from 'elysia';
import { rootRoute } from './root.route';
import { healthRoute } from './health.route';

export const routes = new Elysia().use(rootRoute).use(healthRoute);

export { rootRoute, healthRoute };
