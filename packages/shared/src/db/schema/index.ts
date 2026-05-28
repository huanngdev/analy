export * from "@/db/schema/auth-schema";

import { refreshSessions, userAccounts, users } from "@/db/schema/auth-schema";

export const dbSchema = {
  refreshSessions,
  userAccounts,
  users,
};
