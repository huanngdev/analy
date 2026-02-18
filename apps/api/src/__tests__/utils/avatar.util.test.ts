import { describe, expect, it } from 'vitest'
import { getAvatarUrl } from '../../utils/avatar.util'

describe('getAvatarUrl', () => {
  it('returns a dicebear glass SVG URL', () => {
    expect(getAvatarUrl('johndoe')).toBe(
      'https://api.dicebear.com/9.x/glass/svg?seed=johndoe',
    )
  })

  it('embeds the seed in the URL', () => {
    expect(getAvatarUrl('myseed')).toContain('seed=myseed')
  })

  it('uses different seeds for different strings', () => {
    expect(getAvatarUrl('alice')).not.toBe(getAvatarUrl('bob'))
  })

  it('handles an empty seed', () => {
    expect(getAvatarUrl('')).toBe(
      'https://api.dicebear.com/9.x/glass/svg?seed=',
    )
  })
})
