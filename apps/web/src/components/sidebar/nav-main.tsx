import type { AnimatedIcon } from "@/components/icons/animated-icon";
import { SidebarNavItem } from "@/components/sidebar/sidebar-nav-item";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";

type NavMainItem = {
  href: string;
  icon: AnimatedIcon;
  title: string;
};

type NavMainProps = {
  items: NavMainItem[];
};

export function NavMain({ items }: NavMainProps) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
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
