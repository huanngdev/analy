import type { AuthUser } from "@repo/shared";
import type { ComponentProps } from "react";
import {
  CircleHelpIcon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  Link2Icon,
  MousePointerClickIcon,
  NewspaperIcon,
  SearchIcon,
  SettingsIcon,
} from "lucide-react";

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
      icon: LayoutDashboardIcon,
    },
  ],
  analytics: [
    {
      name: "Links",
      href: "/dashboard/links",
      icon: Link2Icon,
    },
    {
      name: "Blogs",
      href: "/dashboard/blogs",
      icon: NewspaperIcon,
    },
    {
      name: "Forms",
      href: "/dashboard/forms",
      icon: ClipboardListIcon,
    },
    {
      name: "Events",
      href: "/dashboard/events",
      icon: MousePointerClickIcon,
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
