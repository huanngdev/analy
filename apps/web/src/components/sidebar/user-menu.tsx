import type { AuthUser } from "@repo/shared";
import {
  BellIcon,
  CreditCardIcon,
  EllipsisVerticalIcon,
  CircleUserRoundIcon,
  LogOutIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react";
import { useTheme } from "next-themes";

import { UserAvatar } from "@/components/sidebar/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar-context";
import { Switch } from "@/components/ui/switch";

type UserMenuProps = {
  isLoggingOut?: boolean;
  onLogout: () => void;
  user: AuthUser;
};

export function UserMenu({
  isLoggingOut = false,
  onLogout,
  user,
}: UserMenuProps) {
  const { isMobile } = useSidebar();
  const { resolvedTheme, setTheme, theme } = useTheme();
  const currentTheme =
    theme === "dark" || resolvedTheme === "dark" ? "dark" : "light";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  const displayName = user.name ?? user.email;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              tooltip={displayName}
            >
              <UserAvatar user={user} className="size-8" />
              <span className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </span>
              <EllipsisVerticalIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserAvatar user={user} className="size-8 rounded-lg" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem disabled>
                <CircleUserRoundIcon />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <CreditCardIcon />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <BellIcon />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                aria-label="Toggle dark mode"
                onSelect={(event) => {
                  event.preventDefault();
                  setTheme(nextTheme);
                }}
              >
                {currentTheme === "dark" ? <MoonIcon /> : <SunIcon />}
                <span>Dark mode</span>
                <Switch
                  aria-label="Dark mode"
                  checked={currentTheme === "dark"}
                  className="pointer-events-none ml-auto"
                  tabIndex={-1}
                />
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={isLoggingOut}
              variant="destructive"
              onSelect={onLogout}
            >
              <LogOutIcon />
              {isLoggingOut ? "Signing out" : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
