import { LinkButton } from "@/components/ui/link-button";

export function AuthDropdown() {
  return (
    <div className="flex items-center gap-2">
      <LinkButton href="/sign-in" variant="ghost">
        Sign In
      </LinkButton>
      <LinkButton href="/sign-up">Sign Up</LinkButton>
    </div>
  );
}
