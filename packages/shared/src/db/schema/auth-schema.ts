import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { AUTH_PROVIDERS, SYSTEM_ROLES } from "@/constants/auth-constants";

export const systemRoleEnum = pgEnum("system_role", SYSTEM_ROLES);

export const authProviderEnum = pgEnum("auth_provider", AUTH_PROVIDERS);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    name: text("name"),
    avatarUrl: text("avatar_url"),
    passwordHash: text("password_hash"),
    emailVerified: boolean("email_verified").notNull().default(false),
    systemRole: systemRoleEnum("system_role").notNull().default("regular"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("users_email_unique_idx").on(table.email)],
);

export const userAccounts = pgTable(
  "user_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: authProviderEnum("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    providerEmail: text("provider_email"),
    providerEmailVerified: boolean("provider_email_verified")
      .notNull()
      .default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("user_accounts_user_id_idx").on(table.userId),
    uniqueIndex("user_accounts_provider_account_unique_idx").on(
      table.provider,
      table.providerAccountId,
    ),
  ],
);

export const refreshSessions = pgTable(
  "refresh_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    redisKey: text("redis_key").notNull(),
    userAgent: text("user_agent"),
    ipHash: text("ip_hash"),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastRotatedAt: timestamp("last_rotated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("refresh_sessions_user_id_idx").on(table.userId),
    uniqueIndex("refresh_sessions_redis_key_unique_idx").on(table.redisKey),
  ],
);
