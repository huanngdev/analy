import type { HealthResponse } from "@repo/shared";

import { apiClient } from "@/lib/api-client";

export async function getHealth(signal?: AbortSignal) {
  const response = await apiClient.get<HealthResponse>("/health", { signal });

  return response.data;
}
