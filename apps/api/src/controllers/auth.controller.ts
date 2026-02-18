import {
  slugify,
  type SignUpResponse,
  type SignUpSchema,
  type SignInSchema,
  type SignInResponse,
  type SignOutResponse,
  type RotateAccessTokenResponse,
  type SelectUserWithPassword,
  type GetMeResponse,
} from '@repo/shared'
import type { Context } from 'hono'
import { logger } from '../config/pino'
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  UnauthorizedError,
} from '../errors'
import { userService } from '../services/user.service'
import { getAvatarUrl } from '../utils/avatar.util'
import { getEmailPrefix } from '../utils/email.util'
import { password as passwordUtil } from '../utils/password.util'
import { jwtService } from '../services/jwt.service'
import { cookieUtil } from '../utils/cookie.util'

export const authController = {
  signUp: async (c: Context) => {
    const { email, name, password } = c.req.valid(
      'json' as never,
    ) as unknown as SignUpSchema

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

    const [accessToken, refreshToken] = await Promise.all([
      jwtService.generateAccessToken({
        id: user.id,
        role: user.role,
        isActive: user.isActive,
      }),
      jwtService.generateAndSaveRefreshToken(user.id),
    ])
    await cookieUtil.setRefreshTokenCookie(c, refreshToken)
    return c.json<SignUpResponse>(
      {
        success: true,
        data: {
          accessToken,
          user,
        },
      },
      201,
    )
  },
  signIn: async (c: Context) => {
    const { email, password } = c.req.valid(
      'json' as never,
    ) as unknown as SignInSchema

    const user = await userService.getUserByEmail(email)

    if (!user) {
      throw new BadRequestError('Invalid credentials')
    }

    const isPasswordValid = await passwordUtil.verify(password, user.password)

    if (!isPasswordValid) {
      throw new BadRequestError('Invalid credentials')
    }

    const [accessToken, refreshToken] = await Promise.all([
      jwtService.generateAccessToken({
        id: user.id,
        role: user.role,
        isActive: user.isActive,
      }),
      jwtService.generateAndSaveRefreshToken(user.id),
    ])
    await cookieUtil.setRefreshTokenCookie(c, refreshToken)

    return c.json<SignInResponse>(
      {
        success: true,
        data: {
          accessToken,
          user: userService.removePassword(user),
        },
      },
      200,
    )
  },
  signOut: async (c: Context) => {
    const refreshToken = await cookieUtil.getRefreshTokenCookie(c)
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required')
    }
    await jwtService.deleteSavedRefreshToken(refreshToken)
    await cookieUtil.deleteRefreshTokenCookie(c)
    return c.json<SignOutResponse>(
      { success: true, data: { message: 'Signed out successfully' } },
      200,
    )
  },
  me: async (c: Context) => {
    const user = c.get('user') as SelectUserWithPassword
    if (!user) {
      throw new UnauthorizedError('Unauthorized')
    }
    return c.json<GetMeResponse>(
      { success: true, data: { user: userService.removePassword(user) } },
      200,
    )
  },
  rotateAccessToken: async (c: Context) => {
    const refreshToken = await cookieUtil.getRefreshTokenCookie(c)
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required')
    }
    const { accessToken, refreshToken: newRefreshToken } =
      await jwtService.verifyAndRotateAccessToken(refreshToken)
    await cookieUtil.setRefreshTokenCookie(c, newRefreshToken)
    return c.json<RotateAccessTokenResponse>(
      { success: true, data: { accessToken } },
      200,
    )
  },
}
