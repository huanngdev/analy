"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LinkButton } from "@/components/ui/link-button";
import { useSignOut } from "@/hooks/auth/use-sign-out";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import {
  CreditCardIcon,
  LayoutDashboard,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AuthDropdown() {
  const { user } = useAuthStore();
  const { signOut } = useSignOut();
  const pathname = usePathname();
  if (!user)
    return (
      <div className="flex items-center gap-2">
        <LinkButton href="/sign-in" variant="ghost">
          Sign In
        </LinkButton>
        <LinkButton href="/sign-up">Sign Up</LinkButton>
      </div>
    );

  return (
    <DropdownMenu>
      <div className="flex items-center gap-2">
        {pathname.startsWith("/dashboard") ? null : (
          <LinkButton variant="outline" href="/dashboard/organizations">
            Dashboard
          </LinkButton>
        )}
        <DropdownMenuTrigger>
          <Avatar className={cn("size-8")}>
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent className="w-40" align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <Link href="/dashboard/organizations">
            <DropdownMenuItem>
              <LayoutDashboard />
              Dashboard
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem>
            <UserIcon />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCardIcon />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <SettingsIcon />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => signOut()} variant="destructive">
            <LogOutIcon />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
