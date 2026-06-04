import { DashboardTitle } from "@/features/dashboard/components/dashboard-title";
import { ServiceOverview } from "@/features/dashboard/components/service-overview";
import { useDocumentTitle } from "@/hooks/use-document-title";

export function DashboardIndexPage() {
  useDocumentTitle("Dashboard | Analy");

  return (
    <div className="relative z-10 flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <DashboardTitle
              title="Unified database cloud"
              description="Quickly understand service health, capacity, credentials, backups, and usage across your backend infrastructure."
            >
              <ServiceOverview />
            </DashboardTitle>
          </div>
        </div>
      </div>
    </div>
  );
}
