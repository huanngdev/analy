import { Link } from "react-router-dom";

import { LogoMark } from "@/components/logo";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export function AppSidebarBrand() {
  return (
    <SidebarMenuButton
      asChild
      className="data-[slot=sidebar-menu-button]:p-1.5!"
      tooltip="Analy"
    >
      <Link to="/dashboard">
        <LogoMark className="size-5!" />
        <span className="text-base font-semibold">Analy</span>
      </Link>
    </SidebarMenuButton>
  );
}
