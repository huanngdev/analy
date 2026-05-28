import type { AuthUser } from "@repo/shared";
import type { ComponentProps } from "react";
import {
  ActivityIcon,
  BarChart3Icon,
  Building2Icon,
  CircleHelpIcon,
  ClipboardListIcon,
  FilesIcon,
  FolderKanbanIcon,
  LayoutDashboardIcon,
  LinkIcon,
  SearchIcon,
  SettingsIcon,
  UsersRoundIcon,
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
    {
      title: "Organizations",
      href: "/dashboard",
      icon: Building2Icon,
    },
    {
      title: "Projects",
      href: "/dashboard",
      icon: FolderKanbanIcon,
    },
    {
      title: "Analytics",
      href: "/dashboard",
      icon: BarChart3Icon,
    },
    {
      title: "Team",
      href: "/dashboard",
      icon: UsersRoundIcon,
    },
  ],
  resources: [
    {
      name: "Links",
      href: "/dashboard",
      icon: LinkIcon,
    },
    {
      name: "Forms",
      href: "/dashboard",
      icon: ClipboardListIcon,
    },
    {
      name: "Events",
      href: "/dashboard",
      icon: ActivityIcon,
    },
    {
      name: "Files",
      href: "/dashboard",
      icon: FilesIcon,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      href: "/dashboard",
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      href: "/dashboard",
      icon: CircleHelpIcon,
    },
    {
      title: "Search",
      href: "/dashboard",
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
        <NavDocuments items={sidebarData.resources} />
        <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <UserMenu isLoggingOut={isLoggingOut} onLogout={onLogout} user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
