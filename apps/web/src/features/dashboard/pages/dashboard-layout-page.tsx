import { useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { SidebarLayout } from "@/components/sidebar/sidebar-layout";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { getDashboardBreadcrumbs } from "@/features/dashboard/constants/dashboard-routes";
import { useAuthStore } from "@/stores/auth-store";

export function DashboardLayoutPage() {
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
      <Outlet />
    </SidebarLayout>
  );
}
