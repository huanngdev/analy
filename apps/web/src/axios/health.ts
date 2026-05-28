import type { HealthResponse } from "@repo/shared";

import { apiClient } from "@/axios";

export async function getHealth(signal?: AbortSignal) {
  const response = await apiClient.get<HealthResponse>("/health", { signal });

  return response.data;
}
