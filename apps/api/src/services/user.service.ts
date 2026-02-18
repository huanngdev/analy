import { usersTable, type InsertUser, type SelectUser } from '@repo/shared'
import { eq } from 'drizzle-orm'
import { db } from '../infrastructure/db'
import { password } from '../utils/password.util'

export const userService = {
  removePassword: (user: SelectUser): SelectUser => {
    const userWithoutPassword = { ...user }
    delete (userWithoutPassword as Record<string, unknown>).password
    return userWithoutPassword as SelectUser
  },
  checkEmailExists: async (email: string): Promise<boolean> => {
    const user = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .then(([user]) => user)
    return user !== undefined
  },
  createUser: async (user: InsertUser): Promise<SelectUser | undefined> => {
    const hashedPassword = await password.hash(user.password)
    const newUser = await db
      .insert(usersTable)
      .values({ ...user, password: hashedPassword })
      .returning()
      .then(([user]) => user)

    if (!newUser) {
      return undefined
    }

    return userService.removePassword(newUser)
  },
  getUserByEmail: async (email: string): Promise<SelectUser | undefined> => {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .then(([user]) => user)
    return user ?? undefined
  },
  getUserById: async (id: string): Promise<SelectUser | undefined> => {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .then(([user]) => user)
    return user ?? undefined
  },
  updateUser: async (id: string, user: Partial<InsertUser>): Promise<SelectUser | undefined> => {
    const updatedUser = await db
      .update(usersTable)
      .set(user)
      .where(eq(usersTable.id, id))
      .returning()
      .then(([user]) => user)
    return updatedUser ?? undefined
  },
  deleteUser: async (id: string): Promise<boolean> => {
    const result = await db
      .delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning()
      .then(([user]) => user)
    return result !== undefined
  },
}
