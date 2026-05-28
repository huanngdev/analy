import type {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthLogoutResponse,
  AuthMeResponse,
  AuthRegisterRequest,
  AuthRegisterResponse,
  AuthRotateTokenResponse,
} from "@repo/shared";

import { apiClient, type ApiRequestConfig } from "@/axios";

type GetMeOptions = {
  redirectOnAuthFailure?: boolean;
  skipAuthRetry?: boolean;
};

export async function register(input: AuthRegisterRequest) {
  const response = await apiClient.post<AuthRegisterResponse>(
    "/auth/register",
    input,
  );

  return response.data;
}

export async function login(input: AuthLoginRequest) {
  const response = await apiClient.post<AuthLoginResponse>(
    "/auth/login",
    input,
  );

  return response.data;
}

export async function logout() {
  const response = await apiClient.post<AuthLogoutResponse>("/auth/logout");

  return response.data;
}

export async function rotateToken() {
  const response =
    await apiClient.post<AuthRotateTokenResponse>("/auth/rotate-token");

  return response.data;
}

export async function getMe(options: GetMeOptions = {}) {
  const config: ApiRequestConfig = {
    _redirectOnAuthFailure: options.redirectOnAuthFailure,
    _skipAuthRetry: options.skipAuthRetry,
  };

  const response = await apiClient.get<AuthMeResponse>("/auth/me", config);

  return response.data;
}
