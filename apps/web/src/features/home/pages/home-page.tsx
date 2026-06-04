import { Navigate } from "react-router-dom";

import { useDocumentTitle } from "@/hooks/use-document-title";
import { useAuthStore } from "@/stores/auth-store";

export function HomePage() {
  const auth = useAuthStore((state) => state.auth);
  useDocumentTitle("Analy");

  return <Navigate to={auth?.user ? "/dashboard" : "/register"} replace />;
}
