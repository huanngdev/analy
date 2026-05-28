import type { AUTH_PROVIDERS, SYSTEM_ROLES } from "../constants/auth-constants";
import type { refreshSessions, userAccounts, users } from "../db/schema";

export type SystemRole = (typeof SYSTEM_ROLES)[number];

export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export type User = typeof users.$inferSelect;

export type NewUser = typeof users.$inferInsert;

export type UserAccount = typeof userAccounts.$inferSelect;

export type NewUserAccount = typeof userAccounts.$inferInsert;

export type RefreshSession = typeof refreshSessions.$inferSelect;

export type NewRefreshSession = typeof refreshSessions.$inferInsert;
