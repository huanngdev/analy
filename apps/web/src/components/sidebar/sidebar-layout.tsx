import type { AuthUser } from "@repo/shared";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
  SidebarPageHeader,
  type SidebarBreadcrumbItem,
} from "@/components/sidebar/sidebar-page-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type SidebarLayoutProps = {
  breadcrumbs?: SidebarBreadcrumbItem[];
  children: ReactNode;
  isLoggingOut?: boolean;
  onLogout: () => void;
  title?: string;
  user: AuthUser;
};

type SidebarLayoutContextValue = {
  setBreadcrumbs: (breadcrumbs: SidebarBreadcrumbItem[] | null) => void;
};

const SidebarLayoutContext = createContext<SidebarLayoutContextValue | null>(
  null,
);

export function SidebarLayout({
  breadcrumbs,
  children,
  isLoggingOut = false,
  onLogout,
  title,
  user,
}: SidebarLayoutProps) {
  const [breadcrumbOverride, setBreadcrumbOverride] = useState<
    SidebarBreadcrumbItem[] | null
  >(null);
  const currentBreadcrumbs = breadcrumbOverride ?? breadcrumbs ?? [];

  const contextValue = useMemo(
    () => ({ setBreadcrumbs: setBreadcrumbOverride }),
    [],
  );

  return (
    <SidebarLayoutContext.Provider value={contextValue}>
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
          <SidebarPageHeader breadcrumbs={currentBreadcrumbs} title={title} />
          <ScrollArea className="h-[calc(100dvh-var(--header-height))]">
            {children}
          </ScrollArea>
        </SidebarInset>
      </SidebarProvider>
    </SidebarLayoutContext.Provider>
  );
}

export function useSidebarLayout() {
  const context = useContext(SidebarLayoutContext);

  if (!context) {
    throw new Error("useSidebarLayout must be used within SidebarLayout");
  }

  return context;
}
