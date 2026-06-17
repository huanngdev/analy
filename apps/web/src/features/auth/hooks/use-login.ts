import { zodResolver } from "@hookform/resolvers/zod";
import { authLoginRequestSchema } from "@repo/shared";
import type { AuthLoginRequest, AuthMeResponse } from "@repo/shared";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { login } from "@/features/auth/api/auth-api";
import { getApiErrorMessage } from "@/lib/api-client";
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
      // The login response already carries the authenticated user, so there is
      // no need for a second `/auth/me` round trip.
      const session = await login(input);

      return {
        ...session,
        memberships: [],
        organizations: [],
        permissions: [],
      } satisfies AuthMeResponse;
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
