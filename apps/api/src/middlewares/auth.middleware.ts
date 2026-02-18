import type { MiddlewareHandler } from 'hono'
import { ForbiddenError, UnauthorizedError } from '../errors'
import { jwtService } from '../services/jwt.service'
import { userService } from '../services/user.service'

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authorization = c.req.header('Authorization')

  if (!authorization?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Access token is required')
  }

  const token = authorization.split(' ')[1]

  let payload
  try {
    payload = await jwtService.verifyAccessToken(token)
  } catch {
    throw new UnauthorizedError('Invalid or expired access token')
  }

  if (!payload) {
    throw new UnauthorizedError('Invalid access token')
  }

  const user = await userService.getUserById(payload.id)

  if (!user) {
    throw new UnauthorizedError('User not found')
  }

  if (!user.isActive) {
    throw new ForbiddenError('Account is not active')
  }

  c.set('user', user)

  await next()
}
