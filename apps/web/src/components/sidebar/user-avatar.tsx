import type { AuthUser } from "@repo/shared";
import { Avatar as Web3Avatar } from "web3-avatar-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  className?: string;
  fallbackClassName?: string;
  user: AuthUser;
};

function addressFromSeed(seed: string) {
  let hash = 2166136261;

  for (const character of seed) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  const hex = Array.from({ length: 40 }, (_, index) =>
    ((hash >>> ((index % 8) * 4)) & 0xf).toString(16),
  ).join("");

  return `0x${hex}`;
}

export function UserAvatar({
  className,
  fallbackClassName,
  user,
}: UserAvatarProps) {
  const fallbackAddress = addressFromSeed(user.id || user.email);

  return (
    <Avatar className={cn("overflow-hidden rounded-full", className)}>
      {user.avatarUrl && (
        <AvatarImage src={user.avatarUrl} alt={user.name ?? ""} />
      )}
      <AvatarFallback
        className={cn("overflow-hidden rounded-full p-0", fallbackClassName)}
      >
        <Web3Avatar
          address={fallbackAddress}
          aria-hidden="true"
          className="size-full rounded-full"
        />
      </AvatarFallback>
    </Avatar>
  );
}
