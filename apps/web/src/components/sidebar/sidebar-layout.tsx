import type { AuthUser } from "@repo/shared";
import type { CSSProperties, ReactNode } from "react";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarPageHeader } from "@/components/sidebar/sidebar-page-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type SidebarLayoutProps = {
  children: ReactNode;
  isLoggingOut?: boolean;
  onLogout: () => void;
  title: string;
  user: AuthUser;
};

export function SidebarLayout({
  children,
  isLoggingOut = false,
  onLogout,
  title,
  user,
}: SidebarLayoutProps) {
  return (
    <SidebarProvider
      style={
        {
          "--header-height": "calc(var(--spacing) * 12)",
          "--sidebar-width": "calc(var(--spacing) * 72)",
        } as CSSProperties
      }
    >
      <AppSidebar
        isLoggingOut={isLoggingOut}
        onLogout={onLogout}
        user={user}
        variant="inset"
      />
      <SidebarInset>
        <SidebarPageHeader title={title} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
