import type { AnimatedIcon } from "@/components/icons/animated-icon";
import { SidebarNavItem } from "@/components/sidebar/sidebar-nav-item";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";

type NavDocumentItem = {
  href: string;
  icon: AnimatedIcon;
  name: string;
};

type NavDocumentsProps = {
  items: NavDocumentItem[];
};

export function NavDocuments({ items }: NavDocumentsProps) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Analytics</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarNavItem
            key={item.name}
            href={item.href}
            icon={item.icon}
            label={item.name}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
