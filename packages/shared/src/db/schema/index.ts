export * from "./auth-schema";
export * from "./service-schema";

import { refreshSessions, userAccounts, users } from "./auth-schema";
import { postgresInstances, projects, services } from "./service-schema";

export const dbSchema = {
  postgresInstances,
  projects,
  refreshSessions,
  services,
  userAccounts,
  users,
};
