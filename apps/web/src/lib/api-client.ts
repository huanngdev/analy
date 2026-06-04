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
  _redirectOnAuthFailure?: boolean;
  _skipAuthRetry?: boolean;
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

function clearLocalAuthState() {
  queryClient.clear();
  useAuthStore.getState().clearAuth();
}

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
    clearLocalAuthState();

    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const config = error.config as RetryableRequestConfig | undefined;

    if (
      !config ||
      error.response?.status !== 401 ||
      isAuthEndpoint(config) ||
      config._skipAuthRetry
    ) {
      return Promise.reject(error);
    }

    const redirectOnAuthFailure = config._redirectOnAuthFailure ?? true;

    config._authRetryCount = (config._authRetryCount ?? 0) + 1;

    if (config._authRetryCount > MAX_AUTH_RETRIES) {
      if (redirectOnAuthFailure) {
        await logoutUser();
      } else {
        clearLocalAuthState();
      }

      return Promise.reject(error);
    }

    try {
      await rotateAuthCookies();
      return apiClient(config);
    } catch (rotationError) {
      if (redirectOnAuthFailure) {
        await logoutUser();
      } else {
        clearLocalAuthState();
      }

      return Promise.reject(rotationError);
    }
  },
);

export type ApiRequestConfig = AxiosRequestConfig & {
  _redirectOnAuthFailure?: boolean;
  _skipAuthRetry?: boolean;
};

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
