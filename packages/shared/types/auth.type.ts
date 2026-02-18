import type { SelectUser } from '../db_schema'
import type { Response } from './index'

export type SignUpResponse = Response<SelectUser>
