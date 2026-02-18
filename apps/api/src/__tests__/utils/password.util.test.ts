import { describe, expect, it } from 'vitest'
import { password } from '../../utils/password.util'

describe('password', () => {
  const plain = 'SuperSecret123!'

  describe('hash', () => {
    it('returns a hashed string', async () => {
      const hash = await password.hash(plain)
      expect(typeof hash).toBe('string')
      expect(hash.length).toBeGreaterThan(0)
    })

    it('does not return the plain-text password', async () => {
      const hash = await password.hash(plain)
      expect(hash).not.toBe(plain)
    })

    it('produces an argon2 hash', async () => {
      const hash = await password.hash(plain)
      expect(hash).toMatch(/^\$argon2/)
    })

    it('produces different hashes for the same input (salted)', async () => {
      const h1 = await password.hash(plain)
      const h2 = await password.hash(plain)
      expect(h1).not.toBe(h2)
    })
  })

  describe('verify', () => {
    it('returns true for the correct password', async () => {
      const hash = await password.hash(plain)
      expect(await password.verify(plain, hash)).toBe(true)
    })

    it('returns false for an incorrect password', async () => {
      const hash = await password.hash(plain)
      expect(await password.verify('WrongPassword!', hash)).toBe(false)
    })

    it('returns false for an empty password', async () => {
      const hash = await password.hash(plain)
      expect(await password.verify('', hash)).toBe(false)
    })
  })
})
