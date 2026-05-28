import type { AuthMeResponse } from "@repo/shared";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  auth: AuthMeResponse | null;
  hydrated: boolean;
  clearAuth: () => void;
  setAuth: (auth: AuthMeResponse) => void;
  setHydrated: (hydrated: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      auth: null,
      clearAuth: () => set({ auth: null }),
      hydrated: false,
      setAuth: (auth) => set({ auth }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "analy-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({ auth: state.auth }),
      skipHydration: true,
    },
  ),
);
