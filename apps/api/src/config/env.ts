import { apiEnvSchema } from "@repo/shared";

export const env = apiEnvSchema.parse(process.env);
