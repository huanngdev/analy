import { zodResolver } from "@hookform/resolvers/zod";
import { authLoginRequestSchema } from "@repo/shared";
import type { AuthLoginRequest } from "@repo/shared";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { getMe, login } from "@/axios/auth";
import { getApiErrorMessage } from "@/axios";
import { useAuthStore } from "@/stores/auth-store";

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const form = useForm<AuthLoginRequest>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(authLoginRequestSchema),
  });

  const mutation = useMutation({
    mutationFn: async (input: AuthLoginRequest) => {
      await login(input);
      return getMe();
    },
    onError: (error) => {
      toast.error("Unable to sign in", {
        description: getApiErrorMessage(error),
      });
    },
    onSuccess: (auth) => {
      setAuth(auth);
      toast.success("Signed in", {
        description: "Welcome back to Analy.",
      });
      void navigate("/dashboard", { replace: true });
    },
  });

  return {
    form,
    isLoading: mutation.isPending,
    onSubmit: form.handleSubmit((input) => mutation.mutate(input)),
  };
}
