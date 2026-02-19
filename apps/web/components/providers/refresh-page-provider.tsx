"use client";

import { LoadingScreen } from "@/components/shared/loading-screen";
import { useAuthStore } from "@/stores/auth.store";
import { useEffect, useState } from "react";

export function RefreshPageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isValidating, setIsValidating] = useState(true);
  const revalidate = useAuthStore((state) => state.revalidate);

  useEffect(() => {
    revalidate().finally(() => setIsValidating(false));
  }, []);

  if (isValidating) {
    return <LoadingScreen message="Validating session..." />;
  }

  return <>{children}</>;
}
