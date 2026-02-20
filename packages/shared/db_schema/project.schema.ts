import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core'
import { organizationsTable } from '.'

export const projectsTable = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => organizationsTable.id)
      .notNull(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_projects_organization_id').on(table.organizationId),
    index('idx_projects_slug').on(table.slug),
    index('idx_projects_created_at').on(table.createdAt),
    index('idx_projects_updated_at').on(table.updatedAt),
  ],
)

export type SelectProject = typeof projectsTable.$inferSelect
export type InsertProject = typeof projectsTable.$inferInsert
