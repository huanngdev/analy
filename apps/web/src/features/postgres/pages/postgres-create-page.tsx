import { motion } from "framer-motion";

import { PageTitle } from "@/components/typography/page-title";
import { Skeleton } from "@/components/ui/skeleton";
import { PostgresCreateForm } from "@/features/postgres/components/postgres-create-form";
import { usePostgresCreatePage } from "@/features/postgres/hooks/use-postgres-create-page";
import { useDocumentTitle } from "@/hooks/use-document-title";

export function PostgresCreatePage() {
  useDocumentTitle("Create PostgreSQL | Analy");

  const { createInstance, createMutation, metaQuery } = usePostgresCreatePage();

  return (
    <motion.div
      className="relative z-10 flex flex-1 flex-col"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-4 md:py-6 lg:px-6">
          <header className="flex w-full items-center text-center">
            <PageTitle size="compact">Create PostgreSQL</PageTitle>
          </header>

          <div className="w-full">
            {metaQuery.data ? (
              <PostgresCreateForm
                hardwareProfiles={metaQuery.data.hardwareProfiles}
                isPending={createMutation.isPending}
                versions={metaQuery.data.versions}
                onSubmit={createInstance}
              />
            ) : (
              <PostgresCreateSkeleton />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PostgresCreateSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-36 rounded-xl" />
      <Skeleton className="h-56 rounded-xl" />
      <Skeleton className="h-20 rounded-xl" />
    </div>
  );
}
