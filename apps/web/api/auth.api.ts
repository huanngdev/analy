import {
  GetMeResponse,
  RotateAccessTokenResponse,
  SignInResponse,
  SignInSchema,
  SignOutResponse,
  SignUpResponse,
  SignUpSchema,
} from "@repo/shared";
import axiosInstance from "@/api";

export const authApi = {
  signIn: async (payload: SignInSchema) => {
    const response = await axiosInstance.post<SignInResponse>(
      "/auth/sign-in",
      payload,
    );
    return response.data;
  },
  signUp: async (payload: SignUpSchema) => {
    const response = await axiosInstance.post<SignUpResponse>(
      "/auth/sign-up",
      payload,
    );
    return response.data;
  },
  signOut: async () => {
    const response =
      await axiosInstance.post<SignOutResponse>("/auth/sign-out");
    return response.data;
  },
  me: async () => {
    const response = await axiosInstance.get<GetMeResponse>("/auth/me");
    return response.data;
  },
  rotateAccessToken: async () => {
    const response = await axiosInstance.post<RotateAccessTokenResponse>(
      "/auth/rotate-access-token",
    );
    return response.data;
  },
};
