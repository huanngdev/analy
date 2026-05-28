import { z } from "zod";

export const userSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().min(1),
  createdAt: z.iso.datetime(),
});
