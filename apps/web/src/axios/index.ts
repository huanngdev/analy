import axios from "axios";
import type {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import type { ApiErrorResponse } from "@repo/shared";

import { env } from "@/env";
import { queryClient } from "@/lib/query-client";
import { useAuthStore } from "@/stores/auth-store";

const MAX_AUTH_RETRIES = 3;

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _authRetryCount?: number;
};

const authClient = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15_000,
  withCredentials: true,
});

export const apiClient = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15_000,
  withCredentials: true,
});

let rotateTokenPromise: Promise<void> | undefined;

function isAuthEndpoint(config: AxiosRequestConfig) {
  const url = config.url ?? "";

  return (
    url.includes("/auth/login") ||
    url.includes("/auth/logout") ||
    url.includes("/auth/register") ||
    url.includes("/auth/rotate-token")
  );
}

async function rotateAuthCookies() {
  rotateTokenPromise ??= authClient
    .post("/auth/rotate-token")
    .then(() => undefined)
    .finally(() => {
      rotateTokenPromise = undefined;
    });

  return rotateTokenPromise;
}

async function logoutUser() {
  try {
    await authClient.post("/auth/logout");
  } catch {
    // Best effort: local state must still be cleared when server logout fails.
  } finally {
    queryClient.clear();
    useAuthStore.getState().clearAuth();

    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const config = error.config as RetryableRequestConfig | undefined;

    if (!config || error.response?.status !== 401 || isAuthEndpoint(config)) {
      return Promise.reject(error);
    }

    config._authRetryCount = (config._authRetryCount ?? 0) + 1;

    if (config._authRetryCount > MAX_AUTH_RETRIES) {
      await logoutUser();
      return Promise.reject(error);
    }

    try {
      await rotateAuthCookies();
      return apiClient(config);
    } catch (rotationError) {
      await logoutUser();
      return Promise.reject(rotationError);
    }
  },
);

export function isApiError(
  error: unknown,
): error is AxiosError<ApiErrorResponse> {
  return axios.isAxiosError<ApiErrorResponse>(error);
}

export function getApiErrorMessage(error: unknown) {
  if (isApiError(error)) {
    return error.response?.data.error.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}
