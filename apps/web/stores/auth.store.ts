import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SelectUser } from "@repo/shared";
import { authApi } from "@/api";
import axiosInstance from "@/api";

interface AuthState {
  user: SelectUser | null;
  accessToken: string | null;
  setUser: (user: SelectUser | null) => void;
  setAccessToken: (token: string | null) => void;
  setAuth: (user: SelectUser, accessToken: string) => void;
  clearAuth: () => void;
  revalidate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      setUser: (user) => set({ user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setAuth: (user, accessToken) => set({ user, accessToken }),
      clearAuth: () => {
        set({ user: null, accessToken: null });
        delete axiosInstance.defaults.headers.common["Authorization"];
      },
      revalidate: async () => {
        const { accessToken } = get();
        if (!accessToken) return;

        axiosInstance.defaults.headers.common["Authorization"] =
          `Bearer ${accessToken}`;

        try {
          const response = await authApi.me();
          set({ user: response.data.user });
        } catch {
          set({ user: null, accessToken: null });
          delete axiosInstance.defaults.headers.common["Authorization"];
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    },
  ),
);
