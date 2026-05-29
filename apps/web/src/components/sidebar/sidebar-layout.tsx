import type { AuthUser } from "@repo/shared";
import type { CSSProperties, ReactNode } from "react";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarPageHeader } from "@/components/sidebar/sidebar-page-header";
import { ScrollArea } from "@/components/ui/scroll-area";
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
      className="h-dvh overflow-hidden"
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
      <SidebarInset className="h-dvh overflow-hidden">
        <SidebarPageHeader title={title} />
        <ScrollArea className="h-[calc(100dvh-var(--header-height))]">
          {children}
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}
