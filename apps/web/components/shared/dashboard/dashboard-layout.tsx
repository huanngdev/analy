import { DashboardHeader } from "@/components/shared/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/shared/dashboard/dashboard-sidebar";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <SidebarProvider className="flex flex-col">
        <DashboardHeader />
        <div className="flex flex-1 h-[calc(100svh-var(--header-height))]! relative **:data-[sidebar=sidebar]:bg-background!">
          <DashboardSidebar
            className={cn(
              "mt-(--header-height)! bg-background  border-t border-r",
            )}
          />
          <SidebarInset className="p-8 mt-(--header-height)!">
            {children}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
