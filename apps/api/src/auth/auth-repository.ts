import type {
  AuthProvider,
  AuthRegisterRequest,
  AuthUser,
  NewUserAccount,
  NewRefreshSession,
  NewUser,
} from "@repo/shared";
import { refreshSessions, userAccounts, users } from "@repo/shared";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { AppError } from "@/errors/app-error";

type UserRecord = typeof users.$inferSelect;
type OAuthProvider = Exclude<AuthProvider, "email">;

type OAuthUserInput = {
  avatarUrl?: string | null;
  email: string;
  emailVerified: boolean;
  name?: string | null;
  provider: OAuthProvider;
  providerAccountId: string;
};

function generateNameFromEmail(email: string) {
  const atIndex = email.indexOf("@");
  const localPart = atIndex === -1 ? email : email.slice(0, atIndex);
  const plusIndex = localPart.indexOf("+");
  const baseName = plusIndex === -1 ? localPart : localPart.slice(0, plusIndex);
  const name = baseName
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());

  return (name || localPart).slice(0, 120);
}

function toAuthUser(user: UserRecord): AuthUser {
  return {
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
    email: user.email,
    emailVerified: user.emailVerified,
    id: user.id,
    name: user.name,
    systemRole: user.systemRole,
  };
}

export async function createEmailPasswordUser(
  input: AuthRegisterRequest,
  passwordHash: string,
) {
  const createdUser = await db.transaction(async (tx) => {
    const userValues: NewUser = {
      email: input.email,
      name: generateNameFromEmail(input.email),
      passwordHash,
    };

    const [user] = await tx
      .insert(users)
      .values(userValues)
      .onConflictDoNothing({ target: users.email })
      .returning();

    if (!user) {
      throw new AppError({
        code: "CONFLICT",
        message: "Email is already registered",
        status: 409,
      });
    }

    await tx.insert(userAccounts).values({
      provider: "email",
      providerAccountId: user.email,
      providerEmail: user.email,
      providerEmailVerified: user.emailVerified,
      userId: user.id,
    });

    return user;
  });

  return toAuthUser(createdUser);
}

export async function findOrCreateOAuthUser(input: OAuthUserInput) {
  const user = await db.transaction(async (tx) => {
    const [linkedAccount] = await tx
      .select({ user: users })
      .from(userAccounts)
      .innerJoin(users, eq(userAccounts.userId, users.id))
      .where(
        and(
          eq(userAccounts.provider, input.provider),
          eq(userAccounts.providerAccountId, input.providerAccountId),
        ),
      )
      .limit(1);

    if (linkedAccount) {
      return linkedAccount.user;
    }

    const accountValues = (userId: string): NewUserAccount => ({
      provider: input.provider,
      providerAccountId: input.providerAccountId,
      providerEmail: input.email,
      providerEmailVerified: input.emailVerified,
      userId,
    });

    const [existingUser] = await tx
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (existingUser) {
      await tx
        .insert(userAccounts)
        .values(accountValues(existingUser.id))
        .onConflictDoNothing({
          target: [userAccounts.provider, userAccounts.providerAccountId],
        });

      return existingUser;
    }

    const userValues: NewUser = {
      avatarUrl: input.avatarUrl ?? null,
      email: input.email,
      emailVerified: input.emailVerified,
      name: input.name?.trim() || generateNameFromEmail(input.email),
    };

    const [createdUser] = await tx.insert(users).values(userValues).returning();

    if (!createdUser) {
      throw new AppError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unable to create OAuth user",
        status: 500,
      });
    }

    await tx.insert(userAccounts).values(accountValues(createdUser.id));

    return createdUser;
  });

  return toAuthUser(user);
}

export async function findUserRecordByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user;
}

export async function findAuthUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return user ? toAuthUser(user) : undefined;
}

export function mapUserRecordToAuthUser(user: UserRecord) {
  return toAuthUser(user);
}

export async function createRefreshSessionAudit(session: NewRefreshSession) {
  await db.insert(refreshSessions).values(session);
}

export async function updateRefreshSessionAuditRotation(
  sessionId: string,
  expiresAt: Date,
) {
  await db
    .update(refreshSessions)
    .set({
      expiresAt,
      lastRotatedAt: new Date(),
    })
    .where(eq(refreshSessions.id, sessionId));
}

export async function revokeRefreshSessionAudit(sessionId: string) {
  await db
    .update(refreshSessions)
    .set({
      revokedAt: new Date(),
    })
    .where(eq(refreshSessions.id, sessionId));
}
