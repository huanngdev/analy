import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { getMe } from "@/axios/auth";
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

      const { auth, clearAuth, setAuth } = useAuthStore.getState();

      if (!auth?.user) {
        if (active) {
          setBootstrapped(true);
        }

        return;
      }

      try {
        setAuth(await getMe());
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
