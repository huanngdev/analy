import type { AuthUser } from "@repo/shared";
import {
  SiClickhouse,
  SiMinio,
  SiPostgresql,
  SiRabbitmq,
  SiRedis,
} from "@icons-pack/react-simple-icons";
import type { ComponentProps } from "react";
import {
  ActivityIcon,
  CircleHelpIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  SearchIcon,
  ServerIcon,
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
    {
      title: "Services",
      href: "/dashboard/services",
      icon: ServerIcon,
    },
    {
      title: "Credentials",
      href: "/dashboard/credentials",
      icon: KeyRoundIcon,
    },
    {
      title: "Usage",
      href: "/dashboard/usage",
      icon: ActivityIcon,
    },
  ],
  resources: [
    {
      name: "PostgreSQL",
      href: "/dashboard/services/postgresql",
      icon: SiPostgresql,
    },
    {
      name: "Redis",
      href: "/dashboard/services/redis",
      icon: SiRedis,
    },
    {
      name: "ClickHouse",
      href: "/dashboard/services/clickhouse",
      icon: SiClickhouse,
    },
    {
      name: "Object Storage",
      href: "/dashboard/services/object-storage",
      icon: SiMinio,
    },
    {
      name: "Queues",
      href: "/dashboard/services/queues",
      icon: SiRabbitmq,
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
        <NavDocuments items={sidebarData.resources} />
        <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <UserMenu isLoggingOut={isLoggingOut} onLogout={onLogout} user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
