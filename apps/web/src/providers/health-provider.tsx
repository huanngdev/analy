import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "@/axios";
import { getHealth } from "@/axios/health";
import { ErrorScreen } from "@/components/screens/error-screen";
import { LoadingScreen } from "@/components/screens/loading-screen";

type HealthProviderProps = {
  children: ReactNode;
};

type HealthStatus = "checking" | "healthy" | "unhealthy";

function assertHealthy(ok: boolean) {
  if (!ok) {
    throw new Error("The API reported an unhealthy status.");
  }
}

async function verifyHealth(signal?: AbortSignal) {
  const health = await getHealth(signal);

  assertHealthy(health.ok);
}

export function HealthProvider({ children }: HealthProviderProps) {
  const [status, setStatus] = useState<HealthStatus>("checking");
  const [errorMessage, setErrorMessage] = useState<string>();

  const checkHealth = useCallback(async (signal?: AbortSignal) => {
    setStatus("checking");
    setErrorMessage(undefined);

    try {
      await verifyHealth(signal);
      setStatus("healthy");
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setErrorMessage(getApiErrorMessage(error));
      setStatus("unhealthy");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function checkInitialHealth() {
      try {
        await verifyHealth(controller.signal);
        setStatus("healthy");
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setErrorMessage(getApiErrorMessage(error));
        setStatus("unhealthy");
      }
    }

    void checkInitialHealth();

    return () => {
      controller.abort();
    };
  }, []);

  if (status === "checking") {
    return <LoadingScreen title="Checking system status" />;
  }

  if (status === "unhealthy") {
    return (
      <ErrorScreen
        actionLabel="Retry"
        description={
          errorMessage
            ? `Health check failed: ${errorMessage}`
            : "The API health check failed."
        }
        onAction={() => void checkHealth()}
        title="Service unavailable"
      />
    );
  }

  return children;
}
