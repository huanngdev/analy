import { env } from "@/env";
import axios, { type InternalAxiosRequestConfig } from "axios";
import type { RotateAccessTokenResponse } from "@repo/shared";
import { useAuthStore } from "@/stores/auth.store";

const axiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

const MAX_ROTATE = 3;

type RetryableConfig = InternalAxiosRequestConfig & { _retryCount?: number };

axiosInstance.interceptors.request.use(
  (config) => {
    config.headers.Authorization = `Bearer ${useAuthStore.getState().accessToken}`;
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableConfig;

    const shouldSkip =
      error.response?.status !== 401 ||
      originalRequest.url?.includes("/auth/rotate-access-token") ||
      originalRequest.url?.includes("/auth/sign-in") ||
      originalRequest.url?.includes("/auth/sign-up");

    if (shouldSkip) return Promise.reject(error);

    originalRequest._retryCount = (originalRequest._retryCount ?? 0) + 1;

    if (originalRequest._retryCount > MAX_ROTATE) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post<RotateAccessTokenResponse>(
        `${env.NEXT_PUBLIC_API_URL}/auth/rotate-access-token`,
        {},
        { withCredentials: true },
      );

      const newToken = data.data.accessToken;
      useAuthStore.getState().setAccessToken(newToken);
      axiosInstance.defaults.headers.common["Authorization"] =
        `Bearer ${newToken}`;
      originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

      return axiosInstance(originalRequest);
    } catch {
      useAuthStore.getState().clearAuth();
      return Promise.reject(error);
    }
  },
);

export default axiosInstance;
export * from "./auth.api";
export * from "./organization.api";
