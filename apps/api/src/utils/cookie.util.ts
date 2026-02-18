import type { Context } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import env from '../config/env'
import { ttlUtil } from './ttl.util'

export const cookieUtil = {
  setRefreshTokenCookie: async (c: Context, refreshToken: string) => {
    setCookie(c, 'refreshToken', refreshToken, {
      httpOnly: true,
      path: '/',
      maxAge: ttlUtil.fromTtlStringToSeconds(env.REFRESH_TOKEN_EXPIRES_IN),
    })
  },
  getRefreshTokenCookie: async (c: Context) => {
    return getCookie(c, 'refreshToken')
  },
  deleteRefreshTokenCookie: async (c: Context) => {
    deleteCookie(c, 'refreshToken')
  },
}
