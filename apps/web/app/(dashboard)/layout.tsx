import { DashboardHeader } from "@/components/shared/dashboard/dashboard-header";
import DashboardLayout from "@/components/shared/dashboard/dashboard-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DashboardHeader />
      <DashboardLayout>{children}</DashboardLayout>
    </>
  );
}
