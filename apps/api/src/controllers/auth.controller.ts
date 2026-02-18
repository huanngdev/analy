import { slugify, type SignUpResponse, type SignUpSchema } from '@repo/shared'
import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { logger } from '../config/pino'
import { userService } from '../services/user.service'
import { getAvatarUrl } from '../utils/avatar.util'
import { getEmailPrefix } from '../utils/email.util'

export const authController = {
  signUp: async (c: Context) => {
    try {
      const { email, name, password } = c.req.valid('json' as never) as unknown as SignUpSchema

      const isEmailExists = await userService.checkEmailExists(email)

      if (isEmailExists) {
        throw new HTTPException(400, { message: 'Email already exists' })
      }

      const user = await userService.createUser({
        email,
        name,
        password,
        slug: slugify(getEmailPrefix(email)),
        avatar_url: getAvatarUrl(getEmailPrefix(email)),
      })

      if (!user) {
        throw new HTTPException(500, { message: 'Failed to create user' })
      }

      return c.json<SignUpResponse>(
        {
          success: true,
          data: user,
        },
        201,
      )
    } catch (error: unknown) {
      logger.error(error)
      throw new HTTPException(500, { message: 'Internal server error' })
    }
  },
  // signIn: async (c: Context) => {},
  // signOut: async (c: Context) => {},
  // me: async (c: Context) => {},
  // rotateRefreshToken: async (c: Context) => {},
}
