import { Navigate } from "react-router-dom";

import { DotPattern } from "@/components/patterns/dot-pattern";
import { SidebarLayout } from "@/components/sidebar/sidebar-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <SidebarLayout
      isLoggingOut={logoutMutation.isPending}
      onLogout={() => logoutMutation.mutate()}
      title="Dashboard"
      user={auth.user}
    >
      <DotPattern className="text-primary/60" gap={28} dotOpacity={0.16} />
      <div className="relative z-10 flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
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
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
