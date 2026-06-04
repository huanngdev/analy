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
