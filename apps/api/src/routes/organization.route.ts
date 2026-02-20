import { Hono } from 'hono'
import { organizationController } from '../controllers/organization.controller'
import { authMiddleware, validate } from '../middlewares'
import { createOrganizationSchema, getOrganizationsSchema } from '@repo/shared'

const organizationRoute = new Hono()

organizationRoute.use(authMiddleware)

organizationRoute.post(
  '/',
  validate('json', createOrganizationSchema),
  organizationController.create,
)

organizationRoute.get(
  '/',
  validate('query', getOrganizationsSchema),
  organizationController.getAll,
)

organizationRoute.get('/:slug', organizationController.getBySlug)

export default organizationRoute
