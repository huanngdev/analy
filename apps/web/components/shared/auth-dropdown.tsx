"use client";

import { LinkButton } from "@/components/ui/link-button";
import { useAuthStore } from "@/stores/auth.store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useSignOut } from "@/hooks/auth/use-sign-out";
import { LogOutIcon } from "lucide-react";

export function AuthDropdown() {
  const { user } = useAuthStore();
  const { signOut } = useSignOut();
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
      <DropdownMenuTrigger>
        <Avatar className={cn("size-8")}>
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOutIcon />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
