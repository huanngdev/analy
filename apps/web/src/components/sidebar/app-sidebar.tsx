import type { AuthUser } from "@repo/shared";
import type { ComponentProps } from "react";

import { BookTextIcon } from "@/components/icons/book-text";
import { CircleHelpIcon } from "@/components/icons/circle-help";
import { ClipboardCheckIcon } from "@/components/icons/clipboard-check";
import { CursorClickIcon } from "@/components/icons/cursor-click";
import { LayoutGridIcon } from "@/components/icons/layout-grid";
import { LinkIcon } from "@/components/icons/link";
import { SearchIcon } from "@/components/icons/search";
import { SettingsIcon } from "@/components/icons/settings";
import { AppSidebarBrand } from "@/components/sidebar/app-sidebar-brand";
import { NavDocuments } from "@/components/sidebar/nav-documents";
import { NavMain } from "@/components/sidebar/nav-main";
import { NavSecondary } from "@/components/sidebar/nav-secondary";
import { UserMenu } from "@/components/sidebar/user-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const sidebarData = {
  navMain: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutGridIcon,
    },
  ],
  analytics: [
    {
      name: "Links",
      href: "/dashboard/links",
      icon: LinkIcon,
    },
    {
      name: "Blogs",
      href: "/dashboard/blogs",
      icon: BookTextIcon,
    },
    {
      name: "Forms",
      href: "/dashboard/forms",
      icon: ClipboardCheckIcon,
    },
    {
      name: "Events",
      href: "/dashboard/events",
      icon: CursorClickIcon,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      href: "/dashboard/help",
      icon: CircleHelpIcon,
    },
    {
      title: "Search",
      href: "/dashboard/search",
      icon: SearchIcon,
    },
  ],
};

type AppSidebarProps = {
  isLoggingOut?: boolean;
  onLogout: () => void;
  user: AuthUser;
} & ComponentProps<typeof Sidebar>;

export function AppSidebar({
  isLoggingOut = false,
  onLogout,
  user,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <AppSidebarBrand />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
        <NavDocuments items={sidebarData.analytics} />
        <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <UserMenu isLoggingOut={isLoggingOut} onLogout={onLogout} user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
