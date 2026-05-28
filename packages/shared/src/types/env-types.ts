import type { z } from "zod";

import type {
  apiEnvSchema,
  databaseEnvSchema,
} from "@/validation/env-validation";

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;
