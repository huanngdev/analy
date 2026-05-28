import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { logout } from "@/axios/auth";
import { getApiErrorMessage } from "@/axios";
import { useAuthStore } from "@/stores/auth-store";

export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logout,
    onError: (error) => {
      toast.error("Unable to sign out", {
        description: getApiErrorMessage(error),
      });
    },
    onSuccess: () => {
      clearAuth();
      toast.success("Signed out");
      void navigate("/login", { replace: true });
    },
  });
}
