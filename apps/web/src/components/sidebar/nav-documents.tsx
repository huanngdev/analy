import type { ElementType } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { activeSidebarMenuButtonClassName } from "@/components/sidebar/sidebar-nav-styles";

type NavDocumentItem = {
  href: string;
  icon: ElementType;
  name: string;
};

type NavDocumentsProps = {
  items: NavDocumentItem[];
};

export function NavDocuments({ items }: NavDocumentsProps) {
  const { pathname } = useLocation();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Analytics</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              className={activeSidebarMenuButtonClassName}
              isActive={isActivePath(pathname, item.href)}
            >
              <Link
                to={item.href}
                aria-current={
                  isActivePath(pathname, item.href) ? "page" : undefined
                }
              >
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
