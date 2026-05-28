import {
  ACCESS_TOKEN_TTL_SECONDS,
  type AuthUser,
  type SystemRole,
} from "@repo/shared";
import { jwtVerify, SignJWT } from "jose";
import { z } from "zod";

import { env } from "@/env";
import { AppError } from "@/errors/app-error";

const accessTokenSecret = new TextEncoder().encode(env.ACCESS_TOKEN_SECRET);

const accessTokenPayloadSchema = z.object({
  email: z.email(),
  sub: z.uuid(),
  systemRole: z.enum(["admin", "regular"]),
});

export type AccessTokenPayload = {
  email: string;
  id: string;
  systemRole: SystemRole;
};

export async function signAccessToken(user: AuthUser) {
  return new SignJWT({
    email: user.email,
    systemRole: user.systemRole,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(accessTokenSecret);
}

export async function verifyAccessToken(
  token: string,
): Promise<AccessTokenPayload> {
  try {
    const result = await jwtVerify(token, accessTokenSecret);
    const payload = accessTokenPayloadSchema.parse({
      email: result.payload.email,
      sub: result.payload.sub,
      systemRole: result.payload.systemRole,
    });

    return {
      email: payload.email,
      id: payload.sub,
      systemRole: payload.systemRole,
    };
  } catch (error) {
    throw new AppError({
      cause: error,
      code: "UNAUTHORIZED",
      message: "Authentication required",
      status: 401,
    });
  }
}
