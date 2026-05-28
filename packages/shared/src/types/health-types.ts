import type { z } from "zod";

import type { healthResponseSchema } from "@/validation/health-validation";

export type HealthResponse = z.infer<typeof healthResponseSchema>;
