import { useRef } from "react";
import { Link, useLocation } from "react-router-dom";

import type {
  AnimatedIcon,
  AnimatedIconHandle,
} from "@/components/icons/animated-icon";
import { activeSidebarMenuButtonClassName } from "@/components/sidebar/sidebar-nav-styles";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

type SidebarNavItemProps = {
  href: string;
  icon: AnimatedIcon;
  label: string;
};

export function SidebarNavItem({
  href,
  icon: Icon,
  label,
}: SidebarNavItemProps) {
  const { pathname } = useLocation();
  const iconRef = useRef<AnimatedIconHandle>(null);
  const isActive = isActivePath(pathname, href);

  return (
    <SidebarMenuItem
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onMouseLeave={() => iconRef.current?.stopAnimation()}
    >
      <SidebarMenuButton
        asChild
        className={activeSidebarMenuButtonClassName}
        isActive={isActive}
        tooltip={label}
      >
        <Link to={href} aria-current={isActive ? "page" : undefined}>
          <Icon
            ref={iconRef}
            size={16}
            className="text-muted-foreground flex shrink-0 group-data-[active=true]/menu-button:text-inherit"
          />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
