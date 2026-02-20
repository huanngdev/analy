import type {
  CreateOrganizationSchema,
  CreateOrganizationResponse,
  GetOrganizationsSchema,
  GetOrganizationsResponse,
  GetOrganizationResponse,
  SelectUserWithPassword,
} from '@repo/shared'
import type { Context } from 'hono'
import { logger } from '../config/pino'
import { InternalServerError, NotFoundError } from '../errors'
import { organizationService } from '../services/organization.service'

export const organizationController = {
  create: async (c: Context) => {
    const { name, type } = c.req.valid(
      'json' as never,
    ) as unknown as CreateOrganizationSchema

    const user = c.get('user') as SelectUserWithPassword

    const organization = await organizationService.createOrganization(
      { name, type },
      user.id,
    )

    if (!organization) {
      logger.error('Failed to create organization')
      throw new InternalServerError('Failed to create organization')
    }

    return c.json<CreateOrganizationResponse>(
      { success: true, data: { organization } },
      201,
    )
  },

  getBySlug: async (c: Context) => {
    const slug = c.req.param('slug')
    const user = c.get('user') as SelectUserWithPassword

    const organization = await organizationService.getOrganizationBySlug(
      slug,
      user.id,
    )

    if (!organization) {
      throw new NotFoundError('Organization not found')
    }

    return c.json<GetOrganizationResponse>(
      { success: true, data: { organization } },
      200,
    )
  },

  getAll: async (c: Context) => {
    const { search, limit, page } = c.req.valid(
      'query' as never,
    ) as unknown as GetOrganizationsSchema

    const user = c.get('user') as SelectUserWithPassword

    const { organizations, total } = await organizationService.getOrganizations(
      {
        userId: user.id,
        search,
        limit,
        page,
      },
    )

    return c.json<GetOrganizationsResponse>(
      {
        success: true,
        data: { organizations, total, page, limit },
      },
      200,
    )
  },
}
