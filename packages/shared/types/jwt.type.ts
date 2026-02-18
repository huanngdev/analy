import type { UserRole } from '..'

export type JwtPayload = {
  id: string
  role: UserRole
}
