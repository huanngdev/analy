import type {
  PostgresCreateRequest,
  PostgresDetailResponse,
  PostgresListQuery,
  PostgresListResponse,
  PostgresMetaResponse,
} from "@repo/shared";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  createPostgresInstance,
  getPostgresInstance,
  getPostgresMeta,
  listPostgresInstances,
  stopPostgresInstance,
} from "@/features/postgres/api/postgres-api";

export const postgresKeys = {
  all: ["postgres"] as const,
  detail: (serviceId: string) =>
    [...postgresKeys.all, "detail", serviceId] as const,
  list: () => [...postgresKeys.all, "list"] as const,
  listQuery: (query: PostgresListQuery = {}) =>
    [...postgresKeys.list(), query.search ?? ""] as const,
  meta: () => [...postgresKeys.all, "meta"] as const,
};

export function usePostgresMeta() {
  return useQuery<PostgresMetaResponse>({
    queryFn: getPostgresMeta,
    queryKey: postgresKeys.meta(),
    staleTime: Infinity,
  });
}

export function usePostgresInstances(query: PostgresListQuery = {}) {
  return useQuery<PostgresListResponse>({
    queryFn: () => listPostgresInstances(query),
    queryKey: postgresKeys.listQuery(query),
  });
}

export function usePostgresInstance(serviceId: string | undefined) {
  return useQuery<PostgresDetailResponse>({
    enabled: Boolean(serviceId),
    queryFn: () => getPostgresInstance(serviceId!),
    queryKey: serviceId
      ? postgresKeys.detail(serviceId)
      : postgresKeys.detail(""),
    refetchInterval: 5_000,
  });
}

export function useCreatePostgresInstance() {
  return useMutation({
    mutationFn: (input: PostgresCreateRequest) => createPostgresInstance(input),
  });
}

export function useStopPostgresInstance() {
  return useMutation({
    mutationFn: (serviceId: string) => stopPostgresInstance(serviceId),
  });
}
