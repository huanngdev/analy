import { z } from "zod";

import { API_ERROR_CODES } from "@/types/api-error-types";

export const apiRootResponseSchema = z.object({
  message: z.string(),
});

export const apiErrorResponseSchema = z.object({
  error: z.object({
    code: z.enum(API_ERROR_CODES),
    message: z.string(),
    requestId: z.uuid(),
  }),
  ok: z.literal(false),
});
