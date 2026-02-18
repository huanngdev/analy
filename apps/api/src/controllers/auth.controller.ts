import { slugify, type SignUpResponse, type SignUpSchema } from '@repo/shared'
import type { Context } from 'hono'
import { logger } from '../config/pino'
import { ConflictError, InternalServerError } from '../errors'
import { userService } from '../services/user.service'
import { getAvatarUrl } from '../utils/avatar.util'
import { getEmailPrefix } from '../utils/email.util'

export const authController = {
  signUp: async (c: Context) => {
    const { email, name, password } = c.req.valid('json' as never) as unknown as SignUpSchema

    const isEmailExists = await userService.checkEmailExists(email)

    if (isEmailExists) {
      throw new ConflictError('Email already exists')
    }

    const user = await userService.createUser({
      email,
      name,
      password,
      slug: slugify(getEmailPrefix(email)),
      avatar_url: getAvatarUrl(getEmailPrefix(email)),
    })

    if (!user) {
      logger.error('Failed to create user')
      throw new InternalServerError('Failed to create user')
    }

    return c.json<SignUpResponse>({ success: true, data: user }, 201)
  },
  // signIn: async (c: Context) => {},
  // signOut: async (c: Context) => {},
  // me: async (c: Context) => {},
  // rotateRefreshToken: async (c: Context) => {},
}
