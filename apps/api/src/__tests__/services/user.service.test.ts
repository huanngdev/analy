import { beforeEach, describe, expect, it, vi } from 'vitest'

const dbState = vi.hoisted(() => ({ result: [] as unknown[] }))

vi.mock('../../infrastructure/db', () => {
  const chain: Record<string, unknown> = {}
  for (const m of [
    'select',
    'from',
    'where',
    'insert',
    'values',
    'returning',
    'update',
    'set',
  ]) {
    chain[m] = () => chain
  }
  chain.then = (
    resolve: (v: unknown[]) => unknown,
    reject: (e: unknown) => unknown,
  ): Promise<unknown> => Promise.resolve(dbState.result).then(resolve, reject)
  return { db: chain }
})

vi.mock('../../utils/password.util', () => ({
  password: {
    hash: vi.fn().mockResolvedValue('hashed-password'),
    verify: vi.fn().mockResolvedValue(true),
  },
}))

import { userService } from '../../services/user.service'

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'REGULAR' as const,
  isActive: true,
  slug: 'test-user',
  avatar_url: 'https://example.com/avatar',
  password: 'hashed-password',
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('userService', () => {
  beforeEach(() => {
    dbState.result = []
  })

  describe('checkUserActive', () => {
    it('returns true when user is found in the db', async () => {
      dbState.result = [{ id: 'user-1' }]
      expect(await userService.checkUserActive('user-1')).toBe(true)
    })

    it('returns false when user is not found', async () => {
      dbState.result = []
      expect(await userService.checkUserActive('user-1')).toBe(false)
    })
  })

  describe('checkEmailExists', () => {
    it('returns true when email is found', async () => {
      dbState.result = [{ id: 'user-1' }]
      expect(await userService.checkEmailExists('test@example.com')).toBe(true)
    })

    it('returns false when email is not found', async () => {
      dbState.result = []
      expect(await userService.checkEmailExists('none@example.com')).toBe(false)
    })
  })

  describe('removePassword', () => {
    it('removes the password field from a user object', () => {
      const result = userService.removePassword(mockUser)
      expect(result).not.toHaveProperty('password')
    })

    it('keeps all other user fields intact', () => {
      const result = userService.removePassword(mockUser)
      expect(result.id).toBe(mockUser.id)
      expect(result.email).toBe(mockUser.email)
      expect(result.name).toBe(mockUser.name)
      expect(result.role).toBe(mockUser.role)
    })

    it('does not mutate the original user object', () => {
      userService.removePassword(mockUser)
      expect(mockUser.password).toBe('hashed-password')
    })
  })

  describe('createUser', () => {
    it('returns the user without a password field on success', async () => {
      dbState.result = [mockUser]
      const result = await userService.createUser({
        email: 'test@example.com',
        name: 'Test User',
        slug: 'test-user',
        avatar_url: '',
        password: 'plain-password',
        role: 'REGULAR',
      })
      expect(result).toBeDefined()
      expect(result).not.toHaveProperty('password')
      expect(result?.email).toBe('test@example.com')
    })

    it('returns undefined when the db insert returns nothing', async () => {
      dbState.result = []
      const result = await userService.createUser({
        email: 'test@example.com',
        name: 'Test User',
        slug: 'test-user',
        avatar_url: '',
        password: 'plain-password',
        role: 'REGULAR',
      })
      expect(result).toBeUndefined()
    })
  })

  describe('getUserByEmail', () => {
    it('returns the user when found', async () => {
      dbState.result = [mockUser]
      const result = await userService.getUserByEmail('test@example.com')
      expect(result).toEqual(mockUser)
    })

    it('returns undefined when the user is not found', async () => {
      dbState.result = []
      const result = await userService.getUserByEmail('none@example.com')
      expect(result).toBeUndefined()
    })
  })

  describe('getUserById', () => {
    it('returns the user when found', async () => {
      dbState.result = [mockUser]
      const result = await userService.getUserById('user-1')
      expect(result).toEqual(mockUser)
    })

    it('returns undefined when the user is not found', async () => {
      dbState.result = []
      const result = await userService.getUserById('non-existent')
      expect(result).toBeUndefined()
    })
  })

  describe('updateUser', () => {
    it('returns the updated user', async () => {
      dbState.result = [{ ...mockUser, name: 'New Name' }]
      const result = await userService.updateUser('user-1', {
        name: 'New Name',
      })
      expect(result?.name).toBe('New Name')
    })

    it('returns undefined when user is not found', async () => {
      dbState.result = []
      const result = await userService.updateUser('non-existent', {
        name: 'New Name',
      })
      expect(result).toBeUndefined()
    })
  })

  describe('deleteUser', () => {
    it('returns true when user is successfully deactivated', async () => {
      dbState.result = [mockUser]
      expect(await userService.deleteUser('user-1')).toBe(true)
    })

    it('returns false when user is not found', async () => {
      dbState.result = []
      expect(await userService.deleteUser('non-existent')).toBe(false)
    })
  })
})
