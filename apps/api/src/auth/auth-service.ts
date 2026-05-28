import type { AuthLoginRequest, AuthRegisterRequest } from "@repo/shared";

import { signAccessToken } from "@/auth/access-token";
import {
  createEmailPasswordUser,
  findAuthUserById,
  findUserRecordByEmail,
  mapUserRecordToAuthUser,
} from "@/auth/auth-repository";
import { hashPassword, verifyPassword } from "@/auth/password";
import type { AuthRequestContext } from "@/auth/request-context";
import {
  createRefreshSession,
  rotateRefreshSession,
} from "@/auth/refresh-session-service";
import { AppError } from "@/errors/app-error";

function invalidCredentialsError() {
  return new AppError({
    code: "UNAUTHORIZED",
    message: "Invalid email or password",
    status: 401,
  });
}

export async function registerWithEmailPassword(
  input: AuthRegisterRequest,
  context: AuthRequestContext,
) {
  const passwordHash = await hashPassword(input.password);
  const user = await createEmailPasswordUser(input, passwordHash);
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(user),
    createRefreshSession(user.id, context),
  ]);

  return { accessToken, refreshToken, user };
}

export async function loginWithEmailPassword(
  input: AuthLoginRequest,
  context: AuthRequestContext,
) {
  const userRecord = await findUserRecordByEmail(input.email);

  if (!userRecord?.passwordHash) {
    throw invalidCredentialsError();
  }

  const validPassword = await verifyPassword(
    userRecord.passwordHash,
    input.password,
  );

  if (!validPassword) {
    throw invalidCredentialsError();
  }

  const user = mapUserRecordToAuthUser(userRecord);
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(user),
    createRefreshSession(user.id, context),
  ]);

  return { accessToken, refreshToken, user };
}

export async function rotateAuthTokens(refreshCookie: string | undefined) {
  const rotatedSession = await rotateRefreshSession(refreshCookie);
  const user = await findAuthUserById(rotatedSession.userId);

  if (!user) {
    throw new AppError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      status: 401,
    });
  }

  return {
    accessToken: await signAccessToken(user),
    refreshToken: rotatedSession.refreshToken,
    user,
  };
}

export async function getAuthUser(userId: string) {
  const user = await findAuthUserById(userId);

  if (!user) {
    throw new AppError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      status: 401,
    });
  }

  return user;
}
