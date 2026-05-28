export * from "./auth-schema";

import { refreshSessions, userAccounts, users } from "./auth-schema";

export const dbSchema = {
  refreshSessions,
  userAccounts,
  users,
};
