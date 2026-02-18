import {
  usersTable,
  type InsertUser,
  type SelectUser,
  type SelectUserWithPassword,
} from '@repo/shared'
import { and, eq } from 'drizzle-orm'
import { db } from '../infrastructure/db'
import { password } from '../utils/password.util'

export const userService = {
  checkUserActive: async (id: string): Promise<boolean> => {
    const user = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(and(eq(usersTable.id, id), eq(usersTable.isActive, true)))
      .then(([user]) => user)
    return user !== undefined
  },
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
  getUserByEmail: async (email: string): Promise<SelectUserWithPassword | undefined> => {
    const user = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.email, email), eq(usersTable.isActive, true)))
      .then(([user]) => user)
    return user ?? undefined
  },
  getUserById: async (id: string): Promise<SelectUserWithPassword | undefined> => {
    const user = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.id, id), eq(usersTable.isActive, true)))
      .then(([user]) => user)
    return user ?? undefined
  },
  updateUser: async (id: string, user: Partial<InsertUser>): Promise<SelectUser | undefined> => {
    const updatedUser = await db
      .update(usersTable)
      .set(user)
      .where(and(eq(usersTable.id, id), eq(usersTable.isActive, true)))
      .returning()
      .then(([user]) => user)
    return updatedUser ?? undefined
  },
  deleteUser: async (id: string): Promise<boolean> => {
    return await db
      .update(usersTable)
      .set({ isActive: false })
      .where(and(eq(usersTable.id, id), eq(usersTable.isActive, true)))
      .returning()
      .then(([user]) => user !== undefined)
  },
}
