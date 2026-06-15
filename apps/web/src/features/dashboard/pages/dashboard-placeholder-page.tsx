import { DashboardTitle } from "@/features/dashboard/components/dashboard-title";
import { useDocumentTitle } from "@/hooks/use-document-title";

type DashboardPlaceholderPageProps = {
  title: string;
};

export function DashboardPlaceholderPage({
  title,
}: DashboardPlaceholderPageProps) {
  useDocumentTitle(`${title} | Analy`);

  return (
    <div className="relative z-10 flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <DashboardTitle title={title}>
              <div className="text-muted-foreground flex min-h-60 flex-1 items-center justify-center rounded-2xl border border-dashed p-8 text-center text-sm">
                This section is coming soon.
              </div>
            </DashboardTitle>
          </div>
        </div>
      </div>
    </div>
  );
}
