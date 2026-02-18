import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { ErrorResponse } from '@repo/shared'
import { logger } from '../config/pino'
import { AppError } from '../errors'

export const errorHandler = (err: Error, c: Context) => {
  if (err instanceof AppError) {
    return c.json<ErrorResponse>(
      { success: false, message: err.message },
      err.statusCode as ContentfulStatusCode,
    )
  }

  if (err instanceof HTTPException) {
    return c.json<ErrorResponse>(
      { success: false, message: err.message },
      err.status,
    )
  }

  logger.error(err)
  return c.json<ErrorResponse>(
    { success: false, message: 'Internal server error' },
    500,
  )
}
