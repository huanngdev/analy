import { Navigate } from "react-router-dom";

import { useDocumentTitle } from "@/hooks/use-document-title";
import { useAuthStore } from "@/stores/auth-store";

export function RegisterPage() {
  const auth = useAuthStore((state) => state.auth);
  useDocumentTitle("Register | Analy");

  if (auth?.user) {
    return <Navigate to="/dashboard" replace />;
  }

  return null;
}
