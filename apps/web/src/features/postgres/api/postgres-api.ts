import type {
  PostgresCreateRequest,
  PostgresCreateResponse,
  PostgresDetailResponse,
  PostgresListQuery,
  PostgresListResponse,
  PostgresMetaResponse,
} from "@repo/shared";

import { apiClient } from "@/lib/api-client";

export async function getPostgresMeta(): Promise<PostgresMetaResponse> {
  const response = await apiClient.get<PostgresMetaResponse>("/postgres/meta");

  return response.data;
}

export async function listPostgresInstances(
  query: PostgresListQuery = {},
): Promise<PostgresListResponse> {
  const response = await apiClient.get<PostgresListResponse>("/postgres", {
    params: query,
  });

  return response.data;
}

export async function createPostgresInstance(
  input: PostgresCreateRequest,
): Promise<PostgresCreateResponse> {
  const response = await apiClient.post<PostgresCreateResponse>(
    "/postgres",
    input,
  );

  return response.data;
}

export async function getPostgresInstance(
  serviceId: string,
): Promise<PostgresDetailResponse> {
  const response = await apiClient.get<PostgresDetailResponse>(
    `/postgres/${serviceId}`,
  );

  return response.data;
}

export async function stopPostgresInstance(
  serviceId: string,
): Promise<PostgresDetailResponse> {
  const response = await apiClient.post<PostgresDetailResponse>(
    `/postgres/${serviceId}/stop`,
  );

  return response.data;
}
