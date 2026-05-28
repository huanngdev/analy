import { useLocation, useNavigate } from "react-router-dom";

import { Logo } from "@/components/logo";
import { DotPattern } from "@/components/patterns/dot-pattern";
import { ThemeToggle } from "@/components/theme-toggle";
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

export function AuthLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname === "/login" ? "login" : "register";

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
                  <CardTitle className="text-2xl">
                    Create your account
                  </CardTitle>
                  <CardDescription>
                    Start a workspace with secure email and password access.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RegisterForm />
                </CardContent>
              </TabsContent>
              <TabsContent value="login" className="flex flex-col gap-6">
                <CardHeader className="gap-2 text-left">
                  <CardTitle className="text-2xl">Welcome back</CardTitle>
                  <CardDescription>
                    Sign in to continue managing your analytics workspace.
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
