import { organizationApi } from "@/api";
import { useQuery } from "@tanstack/react-query";

export const organizationKeys = {
  all: ["organizations"] as const,
  list: (params?: { search?: string; page?: number; limit?: number }) =>
    [...organizationKeys.all, "list", params] as const,
  detail: (slug: string) => [...organizationKeys.all, "detail", slug] as const,
};

export function useGetOrganizations(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: organizationKeys.list(params),
    queryFn: () => organizationApi.getOrganizations(params),
  });
}
