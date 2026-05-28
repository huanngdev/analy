import { zodResolver } from "@hookform/resolvers/zod";
import { authRegisterRequestSchema } from "@repo/shared";
import type { AuthRegisterRequest } from "@repo/shared";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { getMe, register } from "@/axios/auth";
import { getApiErrorMessage } from "@/axios";
import { useAuthStore } from "@/stores/auth-store";

export function useRegister() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const form = useForm<AuthRegisterRequest>({
    defaultValues: {
      confirmPassword: "",
      email: "",
      password: "",
    },
    resolver: zodResolver(authRegisterRequestSchema),
  });

  const mutation = useMutation({
    mutationFn: async (input: AuthRegisterRequest) => {
      await register(input);
      return getMe();
    },
    onError: (error) => {
      toast.error("Unable to create account", {
        description: getApiErrorMessage(error),
      });
    },
    onSuccess: (auth) => {
      setAuth(auth);
      toast.success("Account created", {
        description: "Your workspace is ready.",
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
