import { DashboardTitle } from "@/features/dashboard/components/dashboard-title";
import { useDocumentTitle } from "@/hooks/use-document-title";

export function DashboardIndexPage() {
  useDocumentTitle("Dashboard | Analy");

  return (
    <div className="relative z-10 flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <DashboardTitle
            title="Analytics overview"
            description="Track and understand your shortened links, blogs, forms, events, and anything else worth measuring — all from one place."
          >
            <div className="text-muted-foreground flex min-h-60 flex-1 items-center justify-center rounded-2xl border border-dashed p-8 text-center text-sm">
              Pick a source from the sidebar to start collecting analytics.
            </div>
          </DashboardTitle>
        </div>
      </div>
    </div>
  );
}
