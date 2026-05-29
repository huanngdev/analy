import type { ComponentPropsWithoutRef } from "react";
import type { LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavSecondaryItem = {
  href: string;
  icon: LucideIcon;
  title: string;
};

type NavSecondaryProps = {
  items: NavSecondaryItem[];
} & ComponentPropsWithoutRef<typeof SidebarGroup>;

export function NavSecondary({ items, ...props }: NavSecondaryProps) {
  const { pathname } = useLocation();

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActivePath(pathname, item.href)}
              >
                <Link
                  to={item.href}
                  aria-current={
                    isActivePath(pathname, item.href) ? "page" : undefined
                  }
                >
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
