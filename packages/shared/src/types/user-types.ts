import type { z } from "zod";

import type { userSchema } from "@/validation/user-validation";

export type UserResponse = z.infer<typeof userSchema>;
