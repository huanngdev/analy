import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../services/jwt.service', () => ({
  jwtService: {
    verifyAccessToken: vi.fn(),
  },
}))

vi.mock('../../services/user.service', () => ({
  userService: {
    getUserById: vi.fn(),
  },
}))

vi.mock('../../config/pino', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

import { Hono } from 'hono'
import { jwtService } from '../../services/jwt.service'
import { userService } from '../../services/user.service'
import { authMiddleware } from '../../middlewares/auth.middleware'
import { errorHandler } from '../../middlewares/error.middleware'

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

function buildApp() {
  const app = new Hono()
  app.use('/protected', authMiddleware)
  app.get('/protected', (c) =>
    c.json({ success: true, userId: c.get('user').id }),
  )
  app.onError(errorHandler)
  return app
}

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when Authorization header is missing', async () => {
    const res = await buildApp().request('/protected')
    expect(res.status).toBe(401)
    expect((await res.json()).message).toBe('Access token is required')
  })

  it('returns 401 when Authorization header does not start with "Bearer "', async () => {
    const res = await buildApp().request('/protected', {
      headers: { Authorization: 'Basic abc123' },
    })
    expect(res.status).toBe(401)
    expect((await res.json()).message).toBe('Access token is required')
  })

  it('returns 401 when token verification fails', async () => {
    vi.mocked(jwtService.verifyAccessToken).mockRejectedValue(
      new Error('Invalid token'),
    )
    const res = await buildApp().request('/protected', {
      headers: { Authorization: 'Bearer invalid-token' },
    })
    expect(res.status).toBe(401)
    expect((await res.json()).message).toBe('Invalid or expired access token')
  })

  it('returns 401 when user is not found', async () => {
    vi.mocked(jwtService.verifyAccessToken).mockResolvedValue({
      id: 'user-1',
      role: 'REGULAR',
    })
    vi.mocked(userService.getUserById).mockResolvedValue(undefined)
    const res = await buildApp().request('/protected', {
      headers: { Authorization: 'Bearer valid-token' },
    })
    expect(res.status).toBe(401)
    expect((await res.json()).message).toBe('User not found')
  })

  it('returns 403 when user account is not active', async () => {
    vi.mocked(jwtService.verifyAccessToken).mockResolvedValue({
      id: 'user-1',
      role: 'REGULAR',
    })
    vi.mocked(userService.getUserById).mockResolvedValue({
      ...mockUser,
      isActive: false,
    })
    const res = await buildApp().request('/protected', {
      headers: { Authorization: 'Bearer valid-token' },
    })
    expect(res.status).toBe(403)
    expect((await res.json()).message).toBe('Account is not active')
  })

  it('calls next and sets user on context when token is valid', async () => {
    vi.mocked(jwtService.verifyAccessToken).mockResolvedValue({
      id: 'user-1',
      role: 'REGULAR',
    })
    vi.mocked(userService.getUserById).mockResolvedValue(mockUser)
    const res = await buildApp().request('/protected', {
      headers: { Authorization: 'Bearer valid-token' },
    })
    expect(res.status).toBe(200)
    expect((await res.json()).userId).toBe('user-1')
  })
})
