import { useMemo } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { SidebarLayout } from "@/components/sidebar/sidebar-layout";
import type { SidebarBreadcrumbItem } from "@/components/sidebar/sidebar-page-header";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { DashboardTitle } from "@/features/dashboard/components/dashboard-title";
import { ServiceOverview } from "@/features/dashboard/components/service-overview";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { PostgresDetailPage, PostgresPage } from "@/pages/postgres-page";
import { useAuthStore } from "@/stores/auth-store";

function DashboardIndexPage() {
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

export function DashboardPage() {
  const auth = useAuthStore((state) => state.auth);
  const { pathname } = useLocation();
  const logoutMutation = useLogout();
  const breadcrumbs = useMemo(
    () => getDashboardBreadcrumbs(pathname),
    [pathname],
  );

  if (!auth?.user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarLayout
      breadcrumbs={breadcrumbs}
      isLoggingOut={logoutMutation.isPending}
      onLogout={() => logoutMutation.mutate()}
      user={auth.user}
    >
      <Routes>
        <Route index element={<DashboardIndexPage />} />
        <Route path="services/postgresql" element={<PostgresPage />} />
        <Route
          path="services/postgresql/:serviceId"
          element={<PostgresDetailPage />}
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </SidebarLayout>
  );
}

function getDashboardBreadcrumbs(pathname: string): SidebarBreadcrumbItem[] {
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return [{ label: "Dashboard" }];
  }

  if (pathname.startsWith("/dashboard/services/postgresql/")) {
    return [{ label: "Dashboard", to: "/dashboard" }, { label: "PostgreSQL" }];
  }

  if (pathname.startsWith("/dashboard/services/postgresql")) {
    return [{ label: "Dashboard", to: "/dashboard" }, { label: "PostgreSQL" }];
  }

  return [{ label: "Dashboard" }];
}
