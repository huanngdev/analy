import { webEnvSchema } from "@repo/shared";

export const env = webEnvSchema.parse(import.meta.env);
