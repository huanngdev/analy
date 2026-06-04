import { motion } from "framer-motion";

import { DashboardTitle } from "@/features/dashboard/components/dashboard-title";
import { PostgresInstanceList } from "@/features/postgres/components/postgres-instance-list";
import { PostgresListToolbar } from "@/features/postgres/components/postgres-list-toolbar";
import { usePostgresListPage } from "@/features/postgres/hooks/use-postgres-list-page";
import { useDocumentTitle } from "@/hooks/use-document-title";

export function PostgresListPage() {
  useDocumentTitle("PostgreSQL | Analy");

  const { instancesQuery, search, searchInput, setSearchInput } =
    usePostgresListPage();
  const instances = instancesQuery.data?.instances ?? [];

  return (
    <motion.div
      className="relative z-10 flex flex-1 flex-col"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <DashboardTitle
              title="PostgreSQL"
              description="User-owned PostgreSQL services with connection, capacity, and runtime status."
            >
              <PostgresListToolbar
                onSearchChange={setSearchInput}
                resultCount={instances.length}
                searchInput={searchInput}
              />
              <PostgresInstanceList
                instances={instances}
                isLoading={instancesQuery.isLoading}
                search={search}
              />
            </DashboardTitle>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
