import { PostgresDetailOverview } from "@/features/postgres/components/postgres-detail-overview";
import { PostgresDetailSkeleton } from "@/features/postgres/components/postgres-detail-skeleton";
import { PostgresNotFound } from "@/features/postgres/components/postgres-not-found";
import { usePostgresDetailPage } from "@/features/postgres/hooks/use-postgres-detail-page";

export function PostgresDetailPage() {
  const { instance, instanceQuery, isStopping, stopInstance } =
    usePostgresDetailPage();

  if (instanceQuery.isLoading) {
    return <PostgresDetailSkeleton />;
  }

  if (!instance) {
    return <PostgresNotFound />;
  }

  return (
    <PostgresDetailOverview
      instance={instance}
      isStopping={isStopping}
      onStop={stopInstance}
    />
  );
}
