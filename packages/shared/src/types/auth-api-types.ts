import type { z } from "zod";

import type {
  authLoginRequestSchema,
  authLogoutResponseSchema,
  authMeResponseSchema,
  authRegisterRequestSchema,
  authSessionResponseSchema,
  authUserSchema,
} from "@/validation/auth-validation";

export type AuthUser = z.infer<typeof authUserSchema>;

export type AuthRegisterRequest = z.infer<typeof authRegisterRequestSchema>;

export type AuthLoginRequest = z.infer<typeof authLoginRequestSchema>;

export type AuthSessionResponse = z.infer<typeof authSessionResponseSchema>;

export type AuthRegisterResponse = AuthSessionResponse;

export type AuthLoginResponse = AuthSessionResponse;

export type AuthRotateTokenResponse = AuthSessionResponse;

export type AuthMeResponse = z.infer<typeof authMeResponseSchema>;

export type AuthLogoutResponse = z.infer<typeof authLogoutResponseSchema>;
