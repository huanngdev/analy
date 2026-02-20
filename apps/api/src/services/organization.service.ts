import {
  organizationsTable,
  organizationMembersTable,
  type SelectOrganization,
  type OrganizationType,
} from '@repo/shared'
import { and, count, desc, eq, getTableColumns, ilike } from 'drizzle-orm'
import { db } from '../infrastructure/db'

const generateSlug = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  return Array.from(crypto.getRandomValues(new Uint8Array(20)))
    .map((b) => chars[b % chars.length])
    .join('')
}

export const organizationService = {
  createOrganization: async (
    data: { name: string; type: OrganizationType },
    ownerId: string,
  ): Promise<SelectOrganization | undefined> => {
    return await db.transaction(async (tx) => {
      const [org] = await tx
        .insert(organizationsTable)
        .values({ ...data, slug: generateSlug(), ownerId })
        .returning()

      if (!org) return undefined

      await tx.insert(organizationMembersTable).values({
        organizationId: org.id,
        userId: ownerId,
        role: 'OWNER',
      })

      return org
    })
  },

  getOrganizationBySlug: async (
    slug: string,
    userId: string,
  ): Promise<SelectOrganization | undefined> => {
    const [org] = await db
      .select(getTableColumns(organizationsTable))
      .from(organizationsTable)
      .innerJoin(
        organizationMembersTable,
        eq(organizationMembersTable.organizationId, organizationsTable.id),
      )
      .where(
        and(
          eq(organizationsTable.slug, slug),
          eq(organizationMembersTable.userId, userId),
          eq(organizationsTable.isActive, true),
        ),
      )
    return org ?? undefined
  },

  getOrganizations: async ({
    userId,
    search,
    limit,
    page,
  }: {
    userId: string
    search?: string
    limit: number
    page: number
  }): Promise<{ organizations: SelectOrganization[]; total: number }> => {
    const offset = (page - 1) * limit

    const conditions = and(
      eq(organizationMembersTable.userId, userId),
      eq(organizationsTable.isActive, true),
      search ? ilike(organizationsTable.name, `%${search}%`) : undefined,
    )

    const [organizations, totals] = await Promise.all([
      db
        .select(getTableColumns(organizationsTable))
        .from(organizationsTable)
        .innerJoin(
          organizationMembersTable,
          eq(organizationMembersTable.organizationId, organizationsTable.id),
        )
        .where(conditions)
        .orderBy(desc(organizationsTable.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(organizationsTable)
        .innerJoin(
          organizationMembersTable,
          eq(organizationMembersTable.organizationId, organizationsTable.id),
        )
        .where(conditions),
    ])

    return { organizations, total: totals[0]?.total ?? 0 }
  },
}
