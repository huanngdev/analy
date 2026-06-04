import type { z } from "zod";

import type {
  postgresCreateRequestSchema,
  postgresCreateResponseSchema,
  postgresDetailResponseSchema,
  postgresInstanceSchema,
  postgresListItemSchema,
  postgresListQuerySchema,
  postgresListResponseSchema,
  postgresMetaResponseSchema,
} from "@/validation/postgres-validation";

export type PostgresCreateRequest = z.infer<typeof postgresCreateRequestSchema>;

export type PostgresInstance = z.infer<typeof postgresInstanceSchema>;

export type PostgresListItem = z.infer<typeof postgresListItemSchema>;

export type PostgresListQuery = z.infer<typeof postgresListQuerySchema>;

export type PostgresListResponse = z.infer<typeof postgresListResponseSchema>;

export type PostgresCreateResponse = z.infer<
  typeof postgresCreateResponseSchema
>;

export type PostgresDetailResponse = z.infer<
  typeof postgresDetailResponseSchema
>;

export type PostgresMetaResponse = z.infer<typeof postgresMetaResponseSchema>;
