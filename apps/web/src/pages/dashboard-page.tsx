import { Navigate } from "react-router-dom";

import { DotPattern } from "@/components/patterns/dot-pattern";
import { SidebarLayout } from "@/components/sidebar/sidebar-layout";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { DashboardTitle } from "@/features/dashboard/components/dashboard-title";
import { ServiceOverview } from "@/features/dashboard/components/service-overview";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useAuthStore } from "@/stores/auth-store";

export function DashboardPage() {
  const auth = useAuthStore((state) => state.auth);
  const logoutMutation = useLogout();
  useDocumentTitle("Dashboard | Analy");

  if (!auth?.user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarLayout
      isLoggingOut={logoutMutation.isPending}
      onLogout={() => logoutMutation.mutate()}
      title="Dashboard"
      user={auth.user}
    >
      <DotPattern className="text-primary/60" gap={28} dotOpacity={0.16} />
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
    </SidebarLayout>
  );
}
