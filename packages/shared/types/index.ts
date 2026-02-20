export * from './heath.type'
export * from './auth.type'
export * from './jwt.type'
export * from './organization.type'

export type ErrorResponse<T = undefined> = {
  success: false
  message: string
  errors?: T
}

export type Response<T> = {
  success: boolean
  message?: string
  data: T
}
