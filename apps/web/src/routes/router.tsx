import {
  Navigate,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { ErrorScreen } from "@/components/screens/error-screen";
import { AuthPage } from "@/features/auth/pages/auth-page";
import { dashboardPlaceholderRoutes } from "@/features/dashboard/constants/dashboard-routes";
import { DashboardIndexPage } from "@/features/dashboard/pages/dashboard-index-page";
import { DashboardLayoutPage } from "@/features/dashboard/pages/dashboard-layout-page";
import { DashboardPlaceholderPage } from "@/features/dashboard/pages/dashboard-placeholder-page";
import {
  DesignSystemPage,
  DesignSystemRedirectPage,
} from "@/features/design-system/pages/design-system-page";
import { HomePage } from "@/features/home/pages/home-page";
import { PostgresCreatePage } from "@/features/postgres/pages/postgres-create-page";
import { PostgresDetailPage } from "@/features/postgres/pages/postgres-detail-page";
import { PostgresListPage } from "@/features/postgres/pages/postgres-list-page";

const router = createBrowserRouter([
  {
    element: <HomePage />,
    errorElement: <ErrorScreen />,
    path: "/",
  },
  {
    element: <AuthPage />,
    errorElement: <ErrorScreen />,
    path: "/register",
  },
  {
    element: <AuthPage />,
    errorElement: <ErrorScreen />,
    path: "/login",
  },
  {
    element: <DesignSystemPage />,
    errorElement: <ErrorScreen />,
    path: "/design-system",
  },
  {
    element: <DesignSystemRedirectPage />,
    errorElement: <ErrorScreen />,
    path: "/design system",
  },
  {
    element: <DesignSystemRedirectPage />,
    errorElement: <ErrorScreen />,
    path: "/design%20system",
  },
  {
    element: <DashboardLayoutPage />,
    errorElement: <ErrorScreen />,
    path: "/dashboard",
    children: [
      {
        index: true,
        element: <DashboardIndexPage />,
      },
      {
        element: <PostgresListPage />,
        path: "services/postgresql",
      },
      {
        element: <PostgresCreatePage />,
        path: "services/postgresql/new",
      },
      {
        element: <PostgresDetailPage />,
        path: "services/postgresql/:serviceId",
      },
      ...dashboardPlaceholderRoutes.map((route) => ({
        element: <DashboardPlaceholderPage title={route.label} />,
        path: route.path,
      })),
      {
        element: <Navigate to="/dashboard" replace />,
        path: "*",
      },
    ],
  },
  {
    element: <ErrorScreen title="Page not found" />,
    path: "*",
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
