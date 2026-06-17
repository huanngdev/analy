import type { ComponentPropsWithoutRef } from "react";

import type { AnimatedIcon } from "@/components/icons/animated-icon";
import { SidebarNavItem } from "@/components/sidebar/sidebar-nav-item";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";

type NavSecondaryItem = {
  href: string;
  icon: AnimatedIcon;
  title: string;
};

type NavSecondaryProps = {
  items: NavSecondaryItem[];
} & ComponentPropsWithoutRef<typeof SidebarGroup>;

export function NavSecondary({ items, ...props }: NavSecondaryProps) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarNavItem
              key={item.title}
              href={item.href}
              icon={item.icon}
              label={item.title}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
