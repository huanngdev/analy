import type { PostgresCreateRequest } from "@repo/shared";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  postgresKeys,
  useCreatePostgresInstance,
  usePostgresMeta,
} from "@/features/postgres/hooks/use-postgres";
import { getApiErrorMessage } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export function usePostgresCreatePage() {
  const navigate = useNavigate();
  const metaQuery = usePostgresMeta();
  const createMutation = useCreatePostgresInstance();

  function createInstance(input: PostgresCreateRequest) {
    createMutation.mutate(input, {
      onError: (error) => {
        toast.error(getApiErrorMessage(error));
      },
      onSuccess: async (response) => {
        await queryClient.invalidateQueries({
          queryKey: postgresKeys.list(),
        });
        queryClient.setQueryData(postgresKeys.detail(response.instance.id), {
          instance: response.instance,
          ok: true,
        });
        toast.success("PostgreSQL instance is ready");
        navigate(`/dashboard/services/postgresql/${response.instance.id}`);
      },
    });
  }

  return {
    createInstance,
    createMutation,
    metaQuery,
  };
}
