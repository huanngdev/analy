import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockEnv = vi.hoisted(() => ({
  JWT_SECRET: 'test-jwt-secret-key-that-is-at-least-32-chars!',
  JWT_EXPIRES_IN: '15m',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
}))

const mockRedis = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  ttl: vi.fn(),
}))

const mockUserService = vi.hoisted(() => ({
  getUserById: vi.fn(),
}))

vi.mock('../../config/env', () => ({ default: mockEnv }))
vi.mock('../../infrastructure', () => ({ redis: mockRedis }))
vi.mock('../../services/user.service', () => ({ userService: mockUserService }))

import { jwtService } from '../../services/jwt.service'
import { BadRequestError } from '../../errors'

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'REGULAR' as const,
  isActive: true,
  slug: 'test-user',
  avatar_url: '',
  password: 'hashed-password',
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('jwtService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateAccessToken', () => {
    it('returns a JWT string with three parts', async () => {
      const token = await jwtService.generateAccessToken({
        id: 'user-1',
        role: 'REGULAR',
      })
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3)
    })

    it('includes the payload in the token', async () => {
      const token = await jwtService.generateAccessToken({
        id: 'user-1',
        role: 'ADMIN',
      })
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64url').toString('utf-8'),
      )
      expect(payload.id).toBe('user-1')
      expect(payload.role).toBe('ADMIN')
    })
  })

  describe('verifyAccessToken', () => {
    it('returns the payload for a valid token', async () => {
      const token = await jwtService.generateAccessToken({
        id: 'user-1',
        role: 'REGULAR',
      })
      const payload = await jwtService.verifyAccessToken(token)
      expect(payload?.id).toBe('user-1')
      expect(payload?.role).toBe('REGULAR')
    })

    it('throws for an invalid token string', async () => {
      await expect(
        jwtService.verifyAccessToken('invalid.token.here'),
      ).rejects.toThrow()
    })

    it('throws for a token signed with a different secret', async () => {
      const { SignJWT } = await import('jose')
      const wrongKey = new TextEncoder().encode(
        'wrong-secret-key-that-is-32-chars-!!!',
      )
      const token = await new SignJWT({ id: 'user-1', role: 'REGULAR' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('15m')
        .sign(wrongKey)
      await expect(jwtService.verifyAccessToken(token)).rejects.toThrow()
    })
  })

  describe('generateRefreshToken', () => {
    it('returns a string starting with "rf_"', async () => {
      const token = await jwtService.generateRefreshToken()
      expect(token).toMatch(/^rf_/)
    })

    it('generates unique tokens on each call', async () => {
      const t1 = await jwtService.generateRefreshToken()
      const t2 = await jwtService.generateRefreshToken()
      expect(t1).not.toBe(t2)
    })
  })

  describe('generateAndSaveRefreshToken', () => {
    it('saves the token to redis with the correct TTL and returns it', async () => {
      mockRedis.set.mockResolvedValue('OK')
      const token = await jwtService.generateAndSaveRefreshToken('user-1')
      expect(token).toMatch(/^rf_/)
      expect(mockRedis.set).toHaveBeenCalledWith(
        token,
        'user-1',
        'EX',
        expect.any(Number),
      )
    })

    it('throws BadRequestError when userId is empty', async () => {
      await expect(
        jwtService.generateAndSaveRefreshToken(''),
      ).rejects.toBeInstanceOf(BadRequestError)
    })
  })

  describe('verifyAndRotateAccessToken', () => {
    it('throws BadRequestError when refreshToken is empty', async () => {
      await expect(
        jwtService.verifyAndRotateAccessToken(''),
      ).rejects.toBeInstanceOf(BadRequestError)
    })

    it('throws BadRequestError when token is not found in redis', async () => {
      mockRedis.get.mockResolvedValue(null)
      mockRedis.ttl.mockResolvedValue(-2)
      await expect(
        jwtService.verifyAndRotateAccessToken('rf_invalid'),
      ).rejects.toBeInstanceOf(BadRequestError)
    })

    it('throws BadRequestError when TTL is expired (0 or negative)', async () => {
      mockRedis.get.mockResolvedValue('user-1')
      mockRedis.ttl.mockResolvedValue(0)
      await expect(
        jwtService.verifyAndRotateAccessToken('rf_expired'),
      ).rejects.toBeInstanceOf(BadRequestError)
    })

    it('throws BadRequestError when user is not found', async () => {
      mockRedis.get.mockResolvedValue('user-1')
      mockRedis.ttl.mockResolvedValue(3600)
      mockUserService.getUserById.mockResolvedValue(undefined)
      await expect(
        jwtService.verifyAndRotateAccessToken('rf_token'),
      ).rejects.toBeInstanceOf(BadRequestError)
    })

    it('rotates tokens and preserves the remaining TTL', async () => {
      const remainingTtl = 1800
      mockRedis.get.mockResolvedValue('user-1')
      mockRedis.ttl.mockResolvedValue(remainingTtl)
      mockUserService.getUserById.mockResolvedValue(mockUser)
      mockRedis.del.mockResolvedValue(1)
      mockRedis.set.mockResolvedValue('OK')

      const result = await jwtService.verifyAndRotateAccessToken('rf_old-token')

      expect(result.accessToken).toBeTruthy()
      expect(result.refreshToken).toMatch(/^rf_/)
      expect(result.refreshToken).not.toBe('rf_old-token')
      expect(mockRedis.del).toHaveBeenCalledWith('rf_old-token')
      expect(mockRedis.set).toHaveBeenCalledWith(
        result.refreshToken,
        'user-1',
        'EX',
        remainingTtl,
      )
    })

    it('returns a valid access token in the result', async () => {
      mockRedis.get.mockResolvedValue('user-1')
      mockRedis.ttl.mockResolvedValue(3600)
      mockUserService.getUserById.mockResolvedValue(mockUser)
      mockRedis.del.mockResolvedValue(1)
      mockRedis.set.mockResolvedValue('OK')

      const result = await jwtService.verifyAndRotateAccessToken('rf_token')

      const payload = await jwtService.verifyAccessToken(result.accessToken)
      expect(payload?.id).toBe('user-1')
      expect(payload?.role).toBe('REGULAR')
    })
  })

  describe('deleteSavedRefreshToken', () => {
    it('calls redis.del with the given token', async () => {
      mockRedis.del.mockResolvedValue(1)
      await jwtService.deleteSavedRefreshToken('rf_token')
      expect(mockRedis.del).toHaveBeenCalledWith('rf_token')
    })
  })
})
