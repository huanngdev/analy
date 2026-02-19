import { authApi } from "@/api";
import { useAuthStore } from "@/stores/auth.store";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useSignOut() {
  const router = useRouter();
  const { clearAuth } = useAuthStore();

  const signOutMutation = useMutation({
    mutationFn: authApi.signOut,
    onSuccess: () => {
      toast.success("Signed out successfully");
    },
    onError: () => {
      toast.error("Sign out failed");
    },
    onSettled: () => {
      clearAuth();
      router.push("/sign-in");
    },
  });

  return {
    signOut: signOutMutation.mutate,
    isLoading: signOutMutation.isPending,
  };
}
