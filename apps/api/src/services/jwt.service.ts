import { SignJWT, jwtVerify } from 'jose'
import env from '../config/env'
import type { JwtPayload } from '@repo/shared'
import { randomBytes } from 'crypto'
import { BadRequestError } from '../errors'
import { redis } from '../infrastructure'
import { userService } from './user.service'
import { ttlUtil } from '../utils/ttl.util'

export const jwtService = {
  generateAccessToken: async (payload: JwtPayload) => {
    const secretKey = new TextEncoder().encode(env.JWT_SECRET)

    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(env.JWT_EXPIRES_IN)
      .sign(secretKey)

    return jwt
  },
  verifyAccessToken: async (token: string): Promise<JwtPayload | undefined> => {
    const secretKey = new TextEncoder().encode(env.JWT_SECRET)

    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
    })

    return payload as JwtPayload
  },
  generateRefreshToken: async () => {
    return `rf_${randomBytes(32).toString('hex')}`
  },
  generateAndSaveRefreshToken: async (userId: string) => {
    if (!userId) {
      throw new BadRequestError('User ID is required')
    }
    const refreshToken = await jwtService.generateRefreshToken()
    await redis.set(
      refreshToken,
      userId,
      'EX',
      ttlUtil.fromTtlStringToSeconds(env.REFRESH_TOKEN_EXPIRES_IN),
    )
    return refreshToken
  },
  verifyAndRotateAccessToken: async (refreshToken: string) => {
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required')
    }

    const [userId, remainingTtl] = await Promise.all([
      redis.get(refreshToken),
      redis.ttl(refreshToken),
    ])

    if (!userId || remainingTtl <= 0) {
      throw new BadRequestError('Invalid refresh token')
    }

    const user = await userService.getUserById(userId)
    if (!user) {
      throw new BadRequestError('User is not active')
    }

    const newAccessToken = await jwtService.generateAccessToken({
      id: userId,
      role: user.role,
    })

    const newRefreshToken = await jwtService.generateRefreshToken()
    await Promise.all([
      redis.del(refreshToken),
      redis.set(newRefreshToken, userId, 'EX', remainingTtl),
    ])

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }
  },
  deleteSavedRefreshToken: async (refreshToken: string) => {
    await redis.del(refreshToken)
  },
}
