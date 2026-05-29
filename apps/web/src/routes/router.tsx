import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ErrorScreen } from "@/components/screens/error-screen";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { DashboardPage } from "@/pages/dashboard-page";
import { HomePage } from "@/pages/home-page";
import { LoginPage } from "@/pages/login-page";
import { RegisterPage } from "@/pages/register-page";

const router = createBrowserRouter([
  {
    element: <HomePage />,
    errorElement: <ErrorScreen />,
    path: "/",
  },
  {
    element: <AuthLayout />,
    errorElement: <ErrorScreen />,
    children: [
      {
        element: <RegisterPage />,
        path: "/register",
      },
      {
        element: <LoginPage />,
        path: "/login",
      },
    ],
  },
  {
    element: <DashboardPage />,
    errorElement: <ErrorScreen />,
    path: "/dashboard/*",
  },
  {
    element: <ErrorScreen title="Page not found" />,
    path: "*",
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
