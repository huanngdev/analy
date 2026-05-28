import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { env } from "@/env";

function oauthUrl(provider: "github" | "google") {
  return new URL(`/auth/${provider}`, env.VITE_API_URL).toString();
}

export function OAuthButtons() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-xs">or</span>
        <Separator className="flex-1" />
      </div>
      <div className="flex flex-col gap-2">
        <Button asChild variant="outline" className="w-full">
          <a href={oauthUrl("google")}>
            <SiGoogle data-icon="inline-start" aria-hidden="true" />
            Continue with Google
          </a>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <a href={oauthUrl("github")}>
            <SiGithub data-icon="inline-start" aria-hidden="true" />
            Continue with GitHub
          </a>
        </Button>
      </div>
    </div>
  );
}
