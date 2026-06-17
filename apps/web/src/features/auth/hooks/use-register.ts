import { zodResolver } from "@hookform/resolvers/zod";
import { authRegisterRequestSchema } from "@repo/shared";
import type { AuthMeResponse, AuthRegisterRequest } from "@repo/shared";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { register } from "@/features/auth/api/auth-api";
import { getApiErrorMessage } from "@/lib/api-client";
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
      // The register response already carries the authenticated user, so there
      // is no need for a second `/auth/me` round trip.
      const session = await register(input);

      return {
        ...session,
        memberships: [],
        organizations: [],
        permissions: [],
      } satisfies AuthMeResponse;
    },
    onError: (error) => {
      toast.error("Unable to create account", {
        description: getApiErrorMessage(error),
      });
    },
    onSuccess: (auth) => {
      setAuth(auth);
      toast.success("Account created", {
        description: "Your analytics dashboard is ready.",
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
