import { describe, expect, it } from 'vitest'
import { getEmailPrefix } from '../../utils/email.util'

describe('getEmailPrefix', () => {
  it('returns the local part before @', () => {
    expect(getEmailPrefix('user@example.com')).toBe('user')
  })

  it('handles subdomains correctly', () => {
    expect(getEmailPrefix('user@sub.domain.com')).toBe('user')
  })

  it('handles plus-tagged addresses', () => {
    expect(getEmailPrefix('user+tag@example.com')).toBe('user+tag')
  })

  it('returns the whole string when there is no @', () => {
    expect(getEmailPrefix('notanemail')).toBe('notanemail')
  })

  it('returns the first segment when there are multiple @ signs', () => {
    expect(getEmailPrefix('a@b@c.com')).toBe('a')
  })

  it('returns an empty string for an empty input', () => {
    expect(getEmailPrefix('')).toBe('')
  })
})
