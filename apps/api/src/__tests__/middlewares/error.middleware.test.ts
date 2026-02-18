import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../config/pino', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { errorHandler } from '../../middlewares/error.middleware'
import {
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from '../../errors'

function buildApp(err: Error) {
  const app = new Hono()
  app.get('/test', () => {
    throw err
  })
  app.onError(errorHandler)
  return app
}

describe('errorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 for BadRequestError', async () => {
    const res = await buildApp(new BadRequestError('Bad input')).request(
      '/test',
    )
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ success: false, message: 'Bad input' })
  })

  it('returns 401 for UnauthorizedError', async () => {
    const res = await buildApp(new UnauthorizedError('Not allowed')).request(
      '/test',
    )
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ success: false, message: 'Not allowed' })
  })

  it('returns 403 for ForbiddenError', async () => {
    const res = await buildApp(new ForbiddenError()).request('/test')
    expect(res.status).toBe(403)
    expect((await res.json()).message).toBe('Forbidden')
  })

  it('returns 404 for NotFoundError', async () => {
    const res = await buildApp(new NotFoundError('Not found')).request('/test')
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ success: false, message: 'Not found' })
  })

  it('returns 500 for InternalServerError', async () => {
    const res = await buildApp(new InternalServerError()).request('/test')
    expect(res.status).toBe(500)
    expect((await res.json()).message).toBe('Internal server error')
  })

  it('handles HTTPException with its status and message', async () => {
    const res = await buildApp(
      new HTTPException(403, { message: 'Forbidden by HTTP' }),
    ).request('/test')
    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({
      success: false,
      message: 'Forbidden by HTTP',
    })
  })

  it('returns 500 for unknown errors', async () => {
    const res = await buildApp(new Error('Something unexpected')).request(
      '/test',
    )
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({
      success: false,
      message: 'Internal server error',
    })
  })

  it('logs unknown errors', async () => {
    const { logger } = await import('../../config/pino')
    await buildApp(new Error('Unexpected!')).request('/test')
    expect(logger.error).toHaveBeenCalled()
  })
})
