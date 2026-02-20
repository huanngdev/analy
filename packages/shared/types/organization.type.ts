import type { SelectOrganization } from '../db_schema'
import type { Response } from './index'

export type CreateOrganizationResponse = Response<{
  organization: SelectOrganization
}>

export type GetOrganizationsResponse = Response<{
  organizations: SelectOrganization[]
  total: number
  page: number
  limit: number
}>

export type GetOrganizationResponse = Response<{
  organization: SelectOrganization
}>
