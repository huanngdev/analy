import type { SidebarBreadcrumbItem } from "@/components/sidebar/sidebar-page-header";

export const dashboardPlaceholderRoutes = [
  {
    label: "Links",
    path: "links",
    fullPath: "/dashboard/links",
  },
  {
    label: "Blogs",
    path: "blogs",
    fullPath: "/dashboard/blogs",
  },
  {
    label: "Forms",
    path: "forms",
    fullPath: "/dashboard/forms",
  },
  {
    label: "Events",
    path: "events",
    fullPath: "/dashboard/events",
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
