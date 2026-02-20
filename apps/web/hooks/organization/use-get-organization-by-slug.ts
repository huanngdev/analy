import { organizationApi } from "@/api";
import { useQuery } from "@tanstack/react-query";
import { organizationKeys } from "./use-get-organizations";

export function useGetOrganizationBySlug(slug: string) {
  return useQuery({
    queryKey: organizationKeys.detail(slug),
    queryFn: () => organizationApi.getOrganizationBySlug(slug),
    enabled: !!slug,
  });
}
