import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../services/user.service', () => ({
  userService: {
    checkEmailExists: vi.fn(),
    createUser: vi.fn(),
    getUserByEmail: vi.fn(),
    getUserById: vi.fn(),
    removePassword: vi.fn((user: Record<string, unknown>) => {
      const { password: _pw, ...rest } = user
      return rest
    }),
  },
}))

vi.mock('../../services/jwt.service', () => ({
  jwtService: {
    generateAccessToken: vi.fn().mockResolvedValue('access-token'),
    generateAndSaveRefreshToken: vi.fn().mockResolvedValue('rf_refresh-token'),
    verifyAccessToken: vi.fn(),
    verifyAndRotateAccessToken: vi.fn(),
    deleteSavedRefreshToken: vi.fn(),
  },
}))

vi.mock('../../utils/cookie.util', () => ({
  cookieUtil: {
    setRefreshTokenCookie: vi.fn(),
    getRefreshTokenCookie: vi.fn(),
    deleteRefreshTokenCookie: vi.fn(),
  },
}))

vi.mock('../../utils/password.util', () => ({
  password: {
    hash: vi.fn().mockResolvedValue('hashed-password'),
    verify: vi.fn(),
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
import { userService } from '../../services/user.service'
import { jwtService } from '../../services/jwt.service'
import { cookieUtil } from '../../utils/cookie.util'
import { password as passwordUtil } from '../../utils/password.util'
import authRoute from '../../routes/auth.route'
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

const validSignUpBody = {
  email: 'test@example.com',
  name: 'Test User',
  password: 'SecurePass123!',
  confirmPassword: 'SecurePass123!',
}

const validSignInBody = {
  email: 'test@example.com',
  password: 'SecurePass123!',
}

function buildApp() {
  const app = new Hono()
  app.route('/auth', authRoute)
  app.onError(errorHandler)
  return app
}

describe('POST /auth/sign-up', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 201 with user and accessToken on success', async () => {
    vi.mocked(userService.checkEmailExists).mockResolvedValue(false)
    vi.mocked(userService.createUser).mockResolvedValue({ ...mockUser })
    vi.mocked(jwtService.generateAccessToken).mockResolvedValue('access-token')
    vi.mocked(jwtService.generateAndSaveRefreshToken).mockResolvedValue(
      'rf_refresh-token',
    )

    const res = await buildApp().request('/auth/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validSignUpBody),
    })

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.accessToken).toBe('access-token')
    expect(body.data.user).toBeDefined()
    expect(cookieUtil.setRefreshTokenCookie).toHaveBeenCalled()
  })

  it('returns 409 when email already exists', async () => {
    vi.mocked(userService.checkEmailExists).mockResolvedValue(true)

    const res = await buildApp().request('/auth/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validSignUpBody),
    })

    expect(res.status).toBe(409)
    expect((await res.json()).message).toBe('Email already exists')
  })

  it('returns 500 when user creation fails', async () => {
    vi.mocked(userService.checkEmailExists).mockResolvedValue(false)
    vi.mocked(userService.createUser).mockResolvedValue(undefined)

    const res = await buildApp().request('/auth/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validSignUpBody),
    })

    expect(res.status).toBe(500)
  })

  it('returns 400 for invalid email format', async () => {
    const res = await buildApp().request('/auth/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validSignUpBody, email: 'not-an-email' }),
    })
    expect(res.status).toBe(400)
  })

  it('returns 400 when passwords do not match', async () => {
    const res = await buildApp().request('/auth/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...validSignUpBody,
        confirmPassword: 'DifferentPass!',
      }),
    })
    expect(res.status).toBe(400)
  })

  it('returns 400 when required fields are missing', async () => {
    const res = await buildApp().request('/auth/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    })
    expect(res.status).toBe(400)
  })
})

describe('POST /auth/sign-in', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with accessToken on success', async () => {
    vi.mocked(userService.getUserByEmail).mockResolvedValue(mockUser)
    vi.mocked(passwordUtil.verify).mockResolvedValue(true)
    vi.mocked(jwtService.generateAccessToken).mockResolvedValue('access-token')
    vi.mocked(jwtService.generateAndSaveRefreshToken).mockResolvedValue(
      'rf_token',
    )

    const res = await buildApp().request('/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validSignInBody),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.accessToken).toBe('access-token')
    expect(body.data.user).toBeDefined()
    expect(cookieUtil.setRefreshTokenCookie).toHaveBeenCalled()
  })

  it('returns 400 when user is not found', async () => {
    vi.mocked(userService.getUserByEmail).mockResolvedValue(undefined)

    const res = await buildApp().request('/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validSignInBody),
    })

    expect(res.status).toBe(400)
    expect((await res.json()).message).toBe('Invalid credentials')
  })

  it('returns 400 when password is incorrect', async () => {
    vi.mocked(userService.getUserByEmail).mockResolvedValue(mockUser)
    vi.mocked(passwordUtil.verify).mockResolvedValue(false)

    const res = await buildApp().request('/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validSignInBody),
    })

    expect(res.status).toBe(400)
    expect((await res.json()).message).toBe('Invalid credentials')
  })

  it('returns 400 for invalid input', async () => {
    const res = await buildApp().request('/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bad-email' }),
    })
    expect(res.status).toBe(400)
  })
})

describe('POST /auth/sign-out', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 on successful sign-out', async () => {
    vi.mocked(jwtService.verifyAccessToken).mockResolvedValue({
      id: 'user-1',
      role: 'REGULAR',
    })
    vi.mocked(userService.getUserById).mockResolvedValue(mockUser)
    vi.mocked(cookieUtil.getRefreshTokenCookie).mockResolvedValue('rf_token')
    vi.mocked(jwtService.deleteSavedRefreshToken).mockResolvedValue()

    const res = await buildApp().request('/auth/sign-out', {
      method: 'POST',
      headers: { Authorization: 'Bearer access-token' },
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.message).toBe('Signed out successfully')
    expect(jwtService.deleteSavedRefreshToken).toHaveBeenCalledWith('rf_token')
  })

  it('returns 400 when no refresh token cookie is set', async () => {
    vi.mocked(jwtService.verifyAccessToken).mockResolvedValue({
      id: 'user-1',
      role: 'REGULAR',
    })
    vi.mocked(userService.getUserById).mockResolvedValue(mockUser)
    vi.mocked(cookieUtil.getRefreshTokenCookie).mockResolvedValue(undefined)

    const res = await buildApp().request('/auth/sign-out', {
      method: 'POST',
      headers: { Authorization: 'Bearer access-token' },
    })

    expect(res.status).toBe(400)
  })

  it('returns 401 without an Authorization header', async () => {
    const res = await buildApp().request('/auth/sign-out', { method: 'POST' })
    expect(res.status).toBe(401)
  })
})

describe('GET /auth/me', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with the current user', async () => {
    vi.mocked(jwtService.verifyAccessToken).mockResolvedValue({
      id: 'user-1',
      role: 'REGULAR',
    })
    vi.mocked(userService.getUserById).mockResolvedValue(mockUser)

    const res = await buildApp().request('/auth/me', {
      headers: { Authorization: 'Bearer access-token' },
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.user).toBeDefined()
    expect(body.data.user.id).toBe('user-1')
  })

  it('returns 401 without an Authorization header', async () => {
    const res = await buildApp().request('/auth/me')
    expect(res.status).toBe(401)
  })
})

describe('POST /auth/rotate-access-token', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with a new access token', async () => {
    vi.mocked(jwtService.verifyAccessToken).mockResolvedValue({
      id: 'user-1',
      role: 'REGULAR',
    })
    vi.mocked(userService.getUserById).mockResolvedValue(mockUser)
    vi.mocked(cookieUtil.getRefreshTokenCookie).mockResolvedValue(
      'rf_old-token',
    )
    vi.mocked(jwtService.verifyAndRotateAccessToken).mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'rf_new-token',
    })

    const res = await buildApp().request('/auth/rotate-access-token', {
      method: 'POST',
      headers: { Authorization: 'Bearer access-token' },
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data.accessToken).toBe('new-access-token')
    expect(cookieUtil.setRefreshTokenCookie).toHaveBeenCalled()
  })

  it('returns 400 when no refresh token cookie is set', async () => {
    vi.mocked(jwtService.verifyAccessToken).mockResolvedValue({
      id: 'user-1',
      role: 'REGULAR',
    })
    vi.mocked(userService.getUserById).mockResolvedValue(mockUser)
    vi.mocked(cookieUtil.getRefreshTokenCookie).mockResolvedValue(undefined)

    const res = await buildApp().request('/auth/rotate-access-token', {
      method: 'POST',
      headers: { Authorization: 'Bearer access-token' },
    })

    expect(res.status).toBe(400)
  })

  it('returns 401 without an Authorization header', async () => {
    const res = await buildApp().request('/auth/rotate-access-token', {
      method: 'POST',
    })
    expect(res.status).toBe(401)
  })
})
