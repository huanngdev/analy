import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { usersTable } from '.'

export const organizationType = pgEnum('organization_type', [
  'PERSONAL',
  'COMPANY',
  'TEAM',
  'EDUCATION',
  'OTHER',
])

export const organizationTier = pgEnum('organization_tier', [
  'FREE',
  'PRO',
  'ENTERPRISE',
])

export const organizationMemberRole = pgEnum('organization_member_role', [
  'OWNER',
  'MEMBER',
])

export const organizationInvitationStatus = pgEnum(
  'organization_invitation_status',
  ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
)

export const organizationsTable = pgTable(
  'organizations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    type: organizationType('type').notNull().default('PERSONAL'),
    slug: text('slug').notNull().unique(),
    tier: organizationTier('tier').notNull().default('FREE'),
    isActive: boolean('is_active').notNull().default(true),
    ownerId: uuid('owner_id')
      .references(() => usersTable.id)
      .notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    // get all orgs owned by a user
    index('idx_organizations_owner_id').on(table.ownerId),
    // filter by type or tier
    index('idx_organizations_type').on(table.type),
    index('idx_organizations_tier').on(table.tier),
    // filter active orgs
    index('idx_organizations_is_active').on(table.isActive),
    // pagination / sorting
    index('idx_organizations_created_at').on(table.createdAt),
  ],
)

export type OrganizationType = (typeof organizationType.enumValues)[number]
export type OrganizationTier = (typeof organizationTier.enumValues)[number]
export type SelectOrganization = typeof organizationsTable.$inferSelect
export type InsertOrganization = typeof organizationsTable.$inferInsert

export const organizationMembersTable = pgTable(
  'organization_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => organizationsTable.id)
      .notNull(),
    userId: uuid('user_id')
      .references(() => usersTable.id)
      .notNull(),
    role: organizationMemberRole('role').notNull().default('MEMBER'),
  },
  (table) => [
    // prevents duplicate membership
    uniqueIndex('unique_org_member').on(table.organizationId, table.userId),
    // get all orgs a user belongs to
    index('idx_org_members_user_id').on(table.userId),
    // filter members by role within an org
    index('idx_org_members_role').on(table.role),
  ],
)

export type SelectOrganizationMember =
  typeof organizationMembersTable.$inferSelect
export type InsertOrganizationMember =
  typeof organizationMembersTable.$inferInsert

export const organizationInvitationsTable = pgTable(
  'organization_invitations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => organizationsTable.id)
      .notNull(),
    email: text('email').notNull(),
    role: organizationMemberRole('role').notNull().default('MEMBER'),
    status: organizationInvitationStatus('status').notNull().default('PENDING'),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    // prevents duplicate pending invites for same org+email
    uniqueIndex('unique_pending_invitation')
      .on(table.organizationId, table.email)
      .where(sql`${table.status} = 'PENDING'`),
    // check pending invites for an email on sign-up
    index('idx_invitations_email').on(table.email),
    // list all invitations for an org
    index('idx_invitations_org_id').on(table.organizationId),
    // filter by status
    index('idx_invitations_status').on(table.status),
    // cleanup job for expired invitations
    index('idx_invitations_expires_at').on(table.expiresAt),
  ],
)

export type SelectOrganizationInvitation =
  typeof organizationInvitationsTable.$inferSelect
export type InsertOrganizationInvitation =
  typeof organizationInvitationsTable.$inferInsert
