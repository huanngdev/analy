import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { getMe } from "@/features/auth/api/auth-api";
import { LoadingScreen } from "@/components/screens/loading-screen";
import { useAuthStore } from "@/stores/auth-store";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let active = true;

    async function bootstrapAuth() {
      await useAuthStore.persist.rehydrate();

      const { clearAuth, setAuth } = useAuthStore.getState();

      try {
        setAuth(await getMe({ redirectOnAuthFailure: false }));
      } catch {
        clearAuth();
      } finally {
        if (active) {
          setBootstrapped(true);
        }
      }
    }

    void bootstrapAuth();

    return () => {
      active = false;
    };
  }, []);

  if (!bootstrapped) {
    return <LoadingScreen title="Restoring session" />;
  }

  return children;
}
