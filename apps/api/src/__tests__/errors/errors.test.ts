import { describe, expect, it } from 'vitest'
import {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  UnprocessableEntityError,
} from '../../errors'

describe('AppError', () => {
  it('sets statusCode and message', () => {
    const err = new AppError(418, "I'm a teapot")
    expect(err.statusCode).toBe(418)
    expect(err.message).toBe("I'm a teapot")
  })

  it('is an instance of Error', () => {
    expect(new AppError(500, 'error')).toBeInstanceOf(Error)
  })

  it('sets name to constructor name', () => {
    const err = new AppError(500, 'error')
    expect(err.name).toBe('AppError')
  })
})

const cases = [
  {
    name: 'BadRequestError',
    Cls: BadRequestError,
    code: 400,
    defaultMsg: 'Bad request',
  },
  {
    name: 'UnauthorizedError',
    Cls: UnauthorizedError,
    code: 401,
    defaultMsg: 'Unauthorized',
  },
  {
    name: 'ForbiddenError',
    Cls: ForbiddenError,
    code: 403,
    defaultMsg: 'Forbidden',
  },
  {
    name: 'NotFoundError',
    Cls: NotFoundError,
    code: 404,
    defaultMsg: 'Not found',
  },
  {
    name: 'ConflictError',
    Cls: ConflictError,
    code: 409,
    defaultMsg: 'Conflict',
  },
  {
    name: 'UnprocessableEntityError',
    Cls: UnprocessableEntityError,
    code: 422,
    defaultMsg: 'Unprocessable entity',
  },
  {
    name: 'InternalServerError',
    Cls: InternalServerError,
    code: 500,
    defaultMsg: 'Internal server error',
  },
] as const

describe.each(cases)('$name', ({ Cls, code, defaultMsg }) => {
  it('has the correct status code', () => {
    expect(new Cls().statusCode).toBe(code)
  })

  it('uses the default message', () => {
    expect(new Cls().message).toBe(defaultMsg)
  })

  it('accepts a custom message', () => {
    expect(new Cls('Custom message').message).toBe('Custom message')
  })

  it('is instanceof AppError and Error', () => {
    expect(new Cls()).toBeInstanceOf(AppError)
    expect(new Cls()).toBeInstanceOf(Error)
  })

  it('sets name to the class name', () => {
    expect(new Cls().name).toBe(Cls.name)
  })
})
