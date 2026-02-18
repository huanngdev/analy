import type { SelectUser } from '../db_schema'
import type { Response } from './index'

export type SignUpResponse = Response<{
  accessToken: string
  user: SelectUser
}>
export type SignInResponse = Response<{
  accessToken: string
  user: SelectUser
}>
export type SignOutResponse = Response<{
  message: string
}>
export type RotateAccessTokenResponse = Response<{
  accessToken: string
}>
export type GetMeResponse = Response<{
  user: SelectUser
}>
