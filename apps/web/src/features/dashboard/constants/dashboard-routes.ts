import type { SidebarBreadcrumbItem } from "@/components/sidebar/sidebar-page-header";

export const dashboardPlaceholderRoutes = [
  {
    label: "Redis",
    path: "services/redis",
    fullPath: "/dashboard/services/redis",
  },
  {
    label: "ClickHouse",
    path: "services/clickhouse",
    fullPath: "/dashboard/services/clickhouse",
  },
  {
    label: "Object Storage",
    path: "services/object-storage",
    fullPath: "/dashboard/services/object-storage",
  },
  {
    label: "Queues",
    path: "services/queues",
    fullPath: "/dashboard/services/queues",
  },
  {
    label: "Settings",
    path: "settings",
    fullPath: "/dashboard/settings",
  },
  {
    label: "Get Help",
    path: "help",
    fullPath: "/dashboard/help",
  },
  {
    label: "Search",
    path: "search",
    fullPath: "/dashboard/search",
  },
];

export function getDashboardBreadcrumbs(
  pathname: string,
): SidebarBreadcrumbItem[] {
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return [{ label: "Dashboard" }];
  }

  if (pathname === "/dashboard/services/postgresql/new") {
    return [
      { label: "Dashboard", to: "/dashboard" },
      { label: "PostgreSQL", to: "/dashboard/services/postgresql" },
      { label: "Create" },
    ];
  }

  if (pathname.startsWith("/dashboard/services/postgresql/")) {
    return [{ label: "Dashboard", to: "/dashboard" }, { label: "PostgreSQL" }];
  }

  if (pathname.startsWith("/dashboard/services/postgresql")) {
    return [{ label: "Dashboard", to: "/dashboard" }, { label: "PostgreSQL" }];
  }

  const placeholderRoute = dashboardPlaceholderRoutes.find(
    (route) => pathname === route.fullPath,
  );

  if (placeholderRoute) {
    return [
      { label: "Dashboard", to: "/dashboard" },
      { label: placeholderRoute.label },
    ];
  }

  return [{ label: "Dashboard" }];
}
