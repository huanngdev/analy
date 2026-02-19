import { validator } from 'hono/validator'
import { z } from 'zod'
import type { ValidationTargets } from 'hono'
import type { ErrorResponse } from '@repo/shared'

export const validate = <
  T extends z.ZodSchema,
  Target extends keyof ValidationTargets,
>(
  target: Target,
  schema: T,
) => {
  return validator(target, (value, c) => {
    console.log(value)
    const parsed = schema.safeParse(value)

    if (!parsed.success) {
      return c.json<ErrorResponse<z.ZodFlattenedError<z.infer<T>, string>>>(
        {
          success: false,
          message: 'Invalid input',
          errors: z.flattenError(parsed.error),
        },
        400,
      )
    }

    return parsed.data as z.infer<T>
  })
}
