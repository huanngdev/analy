import { useSearchParams } from "react-router-dom";

import { usePostgresInstances } from "@/features/postgres/hooks/use-postgres";
import { useDebounce } from "@/hooks/use-debounce";

export function usePostgresListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInput = searchParams.get("search") ?? "";
  const search = useDebounce(searchInput).trim();
  const instancesQuery = usePostgresInstances({
    search: search || undefined,
  });

  function setSearchInput(value: string) {
    const nextSearchParams = new URLSearchParams(searchParams);
    const nextSearch = value.trim();

    if (nextSearch) {
      nextSearchParams.set("search", nextSearch);
    } else {
      nextSearchParams.delete("search");
    }

    setSearchParams(nextSearchParams, { replace: true });
  }

  return {
    instancesQuery,
    search,
    searchInput,
    setSearchInput,
  };
}
