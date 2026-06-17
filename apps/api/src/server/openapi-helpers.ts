/**
 * Default validation hook for every OpenAPIHono instance. On a failed request
 * validation it re-throws the ZodError so the global error handler maps it to
 * the standard `{ ok: false, error: { code, message, requestId } }` shape,
 * instead of letting the library emit its own ad-hoc 400 body.
 */
export const openApiDefaultHook = (result: {
  success: boolean;
  error?: unknown;
}) => {
  if (!result.success) {
    throw result.error;
  }
};

export const jsonContent = <TSchema>(schema: TSchema, description: string) => ({
  content: {
    "application/json": {
      schema,
    },
  },
  description,
});

export const jsonRequestBody = <TSchema>(
  schema: TSchema,
  description: string,
) => ({
  content: {
    "application/json": {
      schema,
    },
  },
  description,
  required: true,
});
