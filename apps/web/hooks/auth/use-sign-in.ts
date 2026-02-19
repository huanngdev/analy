import { ErrorResponse, SignInSchema, signInSchema } from "@repo/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api";
import { toast } from "sonner";
import { useCallback } from "react";
import { AxiosError } from "axios";

export function useSignIn() {
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
    onSuccess: () => {
      toast.success("Sign in successful");
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
