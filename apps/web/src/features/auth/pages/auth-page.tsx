import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { Logo } from "@/components/logo";
import { DotPattern } from "@/components/patterns/dot-pattern";
import { ThemeToggle } from "@/components/theme-toggle";
import { PageTitle } from "@/components/typography/page-title";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/features/auth/components/login-form";
import { RegisterForm } from "@/features/auth/components/register-form";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useAuthStore } from "@/stores/auth-store";

export function AuthPage() {
  const auth = useAuthStore((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname === "/login" ? "login" : "register";

  useDocumentTitle(
    activeTab === "login" ? "Login | Analy" : "Register | Analy",
  );

  if (auth?.user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden p-6">
      <DotPattern className="text-primary/60" gap={28} dotOpacity={0.16} />
      <section className="relative flex w-full max-w-md flex-col gap-4">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        <Tabs
          className="flex flex-col gap-5"
          value={activeTab}
          onValueChange={(value) => navigate(`/${value}`)}
        >
          <TabsList className="w-full">
            <TabsTrigger value="register">Register</TabsTrigger>
            <TabsTrigger value="login">Login</TabsTrigger>
          </TabsList>
          <Card className="shadow-none">
            <div>
              <TabsContent value="register" className="flex flex-col gap-6">
                <CardHeader className="gap-2 text-left">
                  <CardTitle>
                    <PageTitle size="compact">Create your account</PageTitle>
                  </CardTitle>
                  <CardDescription>
                    Start provisioning databases and backend services from one
                    dashboard.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RegisterForm />
                </CardContent>
              </TabsContent>
              <TabsContent value="login" className="flex flex-col gap-6">
                <CardHeader className="gap-2 text-left">
                  <CardTitle>
                    <PageTitle size="compact">Welcome back</PageTitle>
                  </CardTitle>
                  <CardDescription>
                    Sign in to manage your projects, services, credentials, and
                    infrastructure usage.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LoginForm />
                </CardContent>
              </TabsContent>
            </div>
          </Card>
        </Tabs>
      </section>
    </main>
  );
}
