import { ErrorResponse, SignInSchema, signInSchema } from "@repo/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api";
import axiosInstance from "@/api";
import { toast } from "sonner";
import { useCallback } from "react";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

export function useSignIn() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
    reValidateMode: "onBlur",
    shouldUnregister: true,
    shouldFocusError: true,
    shouldUseNativeValidation: false,
  });

  const signInMutation = useMutation({
    mutationFn: authApi.signIn,
    onSuccess: (response) => {
      const { user, accessToken } = response.data;
      setAuth(user, accessToken);
      axiosInstance.defaults.headers.common["Authorization"] =
        `Bearer ${accessToken}`;
      toast.success("Sign in successful");
      router.push("/");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error(error);
      toast.error(error.response?.data.message || "Sign in failed");
    },
  });

  const onSubmit = useCallback(() => {
    signInMutation.mutate(form.getValues());
  }, [form, signInMutation]);

  return {
    form,
    onSubmit,
    isLoading: signInMutation.isPending,
    isError: signInMutation.isError,
    isSuccess: signInMutation.isSuccess,
    error: signInMutation.error,
  };
}
