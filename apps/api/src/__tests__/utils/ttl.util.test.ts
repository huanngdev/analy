import { describe, expect, it } from 'vitest'
import { ttlUtil } from '../../utils/ttl.util'

describe('ttlUtil.fromTtlStringToSeconds', () => {
  it('converts seconds', () => {
    expect(ttlUtil.fromTtlStringToSeconds('30s')).toBe(30)
  })

  it('converts minutes', () => {
    expect(ttlUtil.fromTtlStringToSeconds('5m')).toBe(300)
  })

  it('converts hours', () => {
    expect(ttlUtil.fromTtlStringToSeconds('2h')).toBe(7200)
  })

  it('converts days', () => {
    expect(ttlUtil.fromTtlStringToSeconds('7d')).toBe(604800)
  })

  it('is case-insensitive for the unit', () => {
    expect(ttlUtil.fromTtlStringToSeconds('10M')).toBe(600)
    expect(ttlUtil.fromTtlStringToSeconds('3H')).toBe(10800)
    expect(ttlUtil.fromTtlStringToSeconds('1D')).toBe(86400)
    expect(ttlUtil.fromTtlStringToSeconds('60S')).toBe(60)
  })

  it('converts zero correctly', () => {
    expect(ttlUtil.fromTtlStringToSeconds('0s')).toBe(0)
  })

  it('throws on invalid format (no unit)', () => {
    expect(() => ttlUtil.fromTtlStringToSeconds('3600')).toThrow(
      'Invalid TTL format',
    )
  })

  it('throws on unsupported unit', () => {
    expect(() => ttlUtil.fromTtlStringToSeconds('2w')).toThrow(
      'Invalid TTL format',
    )
  })

  it('throws on empty string', () => {
    expect(() => ttlUtil.fromTtlStringToSeconds('')).toThrow(
      'Invalid TTL format',
    )
  })

  it('throws on non-numeric value', () => {
    expect(() => ttlUtil.fromTtlStringToSeconds('abcd')).toThrow(
      'Invalid TTL format',
    )
  })
})
