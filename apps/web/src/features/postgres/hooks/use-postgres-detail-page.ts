import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-client";
import { useSidebarLayout } from "@/components/sidebar/sidebar-layout";
import {
  postgresKeys,
  usePostgresInstance,
  useStopPostgresInstance,
} from "@/features/postgres/hooks/use-postgres";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { queryClient } from "@/lib/query-client";

export function usePostgresDetailPage() {
  const { serviceId } = useParams();
  const { setBreadcrumbs } = useSidebarLayout();
  const instanceQuery = usePostgresInstance(serviceId);
  const stopMutation = useStopPostgresInstance();
  const instance = instanceQuery.data?.instance;

  useDocumentTitle(`${instance?.name ?? "PostgreSQL"} | Analy`);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", to: "/dashboard" },
      { label: "PostgreSQL", to: "/dashboard/services/postgresql" },
      {
        label:
          instance?.name ?? (instanceQuery.isLoading ? "Loading" : "Not found"),
      },
    ]);

    return () => setBreadcrumbs(null);
  }, [instance?.name, instanceQuery.isLoading, setBreadcrumbs]);

  function stopInstance() {
    if (!instance) {
      return;
    }

    stopMutation.mutate(instance.id, {
      onError: (error) => {
        toast.error(getApiErrorMessage(error));
      },
      onSuccess: async (response) => {
        queryClient.setQueryData(postgresKeys.detail(instance.id), response);
        await queryClient.invalidateQueries({
          queryKey: postgresKeys.list(),
        });
        toast.success("PostgreSQL stopped");
      },
    });
  }

  return {
    instance,
    instanceQuery,
    isStopping: stopMutation.isPending,
    stopInstance,
  };
}
