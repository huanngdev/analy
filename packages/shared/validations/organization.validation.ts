import z from 'zod'
import { organizationType } from '../db_schema'

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  type: z.enum(organizationType.enumValues),
})

export type CreateOrganizationSchema = z.infer<typeof createOrganizationSchema>

export const getOrganizationsSchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  page: z.coerce.number().min(1).default(1),
})

export type GetOrganizationsSchema = z.infer<typeof getOrganizationsSchema>
