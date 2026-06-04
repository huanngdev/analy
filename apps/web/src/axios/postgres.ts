import type {
  PostgresCreateRequest,
  PostgresCreateResponse,
  PostgresDetailResponse,
  PostgresListResponse,
  PostgresMetaResponse,
} from "@repo/shared";

import { apiClient } from "@/axios";

export async function getPostgresMeta() {
  const response = await apiClient.get<PostgresMetaResponse>("/postgres/meta");

  return response.data;
}

export async function listPostgresInstances() {
  const response = await apiClient.get<PostgresListResponse>("/postgres");

  return response.data;
}

export async function createPostgresInstance(input: PostgresCreateRequest) {
  const response = await apiClient.post<PostgresCreateResponse>(
    "/postgres",
    input,
  );

  return response.data;
}

export async function getPostgresInstance(serviceId: string) {
  const response = await apiClient.get<PostgresDetailResponse>(
    `/postgres/${serviceId}`,
  );

  return response.data;
}

export async function stopPostgresInstance(serviceId: string) {
  const response = await apiClient.post<PostgresDetailResponse>(
    `/postgres/${serviceId}/stop`,
  );

  return response.data;
}
