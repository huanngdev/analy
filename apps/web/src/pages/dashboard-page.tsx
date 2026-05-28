import { Navigate } from "react-router-dom";

import { DotPattern } from "@/components/patterns/dot-pattern";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useAuthStore } from "@/stores/auth-store";

export function DashboardPage() {
  const auth = useAuthStore((state) => state.auth);
  const logoutMutation = useLogout();
  useDocumentTitle("Dashboard | Analy");

  if (!auth?.user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="bg-background text-foreground relative min-h-dvh overflow-hidden p-6">
      <DotPattern className="text-primary/60" gap={28} dotOpacity={0.16} />
      <section className="relative z-10 mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-sm font-medium tracking-[0.35em] uppercase">
              Analy
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
            >
              {logoutMutation.isPending && <Spinner data-icon="inline-start" />}
              Sign out
            </Button>
          </div>
        </header>
        <Card className="bg-card/95 backdrop-blur">
          <CardHeader>
            <CardTitle>Persisted auth state</CardTitle>
            <CardDescription>
              This is the full auth state currently stored in Zustand.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted text-muted-foreground max-h-[70dvh] overflow-auto rounded-2xl p-4 text-xs leading-relaxed">
              {JSON.stringify(auth, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
