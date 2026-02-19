import { ErrorResponse, SignUpSchema, signUpSchema } from "@repo/shared";
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

export function useSignUp() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
    reValidateMode: "onBlur",
    shouldUnregister: true,
    shouldFocusError: true,
    shouldUseNativeValidation: false,
  });

  const signUpMutation = useMutation({
    mutationFn: authApi.signUp,
    onSuccess: (response) => {
      const { user, accessToken } = response.data;
      setAuth(user, accessToken);
      axiosInstance.defaults.headers.common["Authorization"] =
        `Bearer ${accessToken}`;
      toast.success("Account created successfully");
      router.push("/");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error(error);
      toast.error(error.response?.data.message || "Sign up failed");
    },
  });

  const onSubmit = useCallback(() => {
    signUpMutation.mutate(form.getValues());
  }, [form, signUpMutation]);

  return {
    form,
    onSubmit,
    isLoading: signUpMutation.isPending,
    isError: signUpMutation.isError,
    isSuccess: signUpMutation.isSuccess,
    error: signUpMutation.error,
  };
}
