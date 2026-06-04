import { HomeIcon } from "lucide-react";
import { Link, Navigate } from "react-router-dom";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { PageTitle } from "@/components/typography/page-title";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/use-document-title";

const colorTokens = [
  { label: "Background", variable: "--background" },
  { label: "Foreground", variable: "--foreground" },
  { label: "Card", variable: "--card" },
  { label: "Primary", variable: "--primary" },
  { label: "Secondary", variable: "--secondary" },
  { label: "Muted", variable: "--muted" },
  { label: "Accent", variable: "--accent" },
  { label: "Destructive", variable: "--destructive" },
  { label: "Border", variable: "--border" },
  { label: "Ring", variable: "--ring" },
  { label: "Chart 1", variable: "--chart-1" },
  { label: "Chart 2", variable: "--chart-2" },
  { label: "Chart 3", variable: "--chart-3" },
  { label: "Chart 4", variable: "--chart-4" },
  { label: "Chart 5", variable: "--chart-5" },
];

const buttonVariants = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const;

export function DesignSystemPage() {
  useDocumentTitle("Design System | Analy");

  return (
    <main className="bg-background text-foreground relative min-h-dvh overflow-x-hidden">
      <nav className="absolute inset-x-0 top-0 z-10 border-b">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link to="/">
                <HomeIcon data-icon="inline-start" />
                Home
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="flex min-h-dvh items-center justify-center px-4 py-24">
        <div className="flex w-full max-w-2xl flex-col gap-8">
          <header className="flex flex-col gap-2 text-center">
            <PageTitle>Design System</PageTitle>
            <p className="text-muted-foreground text-sm">
              App colors and button states.
            </p>
          </header>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold">Colors</h2>
            <div className="grid gap-2">
              {colorTokens.map((token) => (
                <ColorToken key={token.variable} {...token} />
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold">Buttons</h2>
            <div className="flex flex-col items-center gap-3">
              {buttonVariants.map((variant) => (
                <Button
                  key={variant}
                  className="w-full max-w-xs"
                  variant={variant}
                >
                  {getButtonLabel(variant)}
                </Button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export function DesignSystemRedirectPage() {
  return <Navigate to="/design-system" replace />;
}

function ColorToken({ label, variable }: { label: string; variable: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-2">
      <span
        className="ring-border size-10 shrink-0 rounded-md ring-1"
        style={{ backgroundColor: `var(${variable})` }}
      />
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-muted-foreground truncate text-xs">{variable}</p>
      </div>
    </div>
  );
}

function getButtonLabel(variant: (typeof buttonVariants)[number]) {
  if (variant === "default") {
    return "Primary Button";
  }

  return `${variant.charAt(0).toUpperCase()}${variant.slice(1)} Button`;
}
