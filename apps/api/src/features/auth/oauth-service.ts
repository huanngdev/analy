import type { AuthProvider } from "@repo/shared";
import { GitHub, Google, generateCodeVerifier, generateState } from "arctic";
import { z } from "zod";

import { env } from "@/config/env";
import { AppError } from "@/lib/errors/app-error";

export type OAuthProvider = Exclude<AuthProvider, "email">;

export type OAuthUserProfile = {
  avatarUrl?: string | null;
  email: string;
  emailVerified: boolean;
  name?: string | null;
  provider: OAuthProvider;
  providerAccountId: string;
};

const googleUserSchema = z.object({
  email: z.email(),
  email_verified: z.boolean(),
  name: z.string().nullish(),
  picture: z.url().nullish(),
  sub: z.string().min(1),
});

const githubUserSchema = z.object({
  avatar_url: z.url().nullable(),
  email: z.email().nullable(),
  id: z.number().int(),
  login: z.string().min(1),
  name: z.string().nullable(),
});

const githubEmailSchema = z.object({
  email: z.email(),
  primary: z.boolean(),
  verified: z.boolean(),
});

const githubEmailsSchema = z.array(githubEmailSchema);

function oauthError(message = "Unable to authenticate with OAuth provider") {
  return new AppError({
    code: "UNAUTHORIZED",
    message,
    status: 401,
  });
}

function getCallbackUrl(provider: OAuthProvider) {
  return `${env.API_PUBLIC_URL}/auth/${provider}/callback`;
}

function getGoogleClient() {
  return new Google(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    getCallbackUrl("google"),
  );
}

function getGitHubClient() {
  return new GitHub(
    env.GITHUB_CLIENT_ID,
    env.GITHUB_CLIENT_SECRET,
    getCallbackUrl("github"),
  );
}

async function fetchJson(url: string, accessToken: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw oauthError();
  }

  return response.json();
}

export function createOAuthAuthorization(provider: OAuthProvider) {
  const state = generateState();

  if (provider === "google") {
    const codeVerifier = generateCodeVerifier();
    const url = getGoogleClient().createAuthorizationURL(state, codeVerifier, [
      "openid",
      "profile",
      "email",
    ]);

    return { codeVerifier, state, url };
  }

  const url = getGitHubClient().createAuthorizationURL(state, [
    "read:user",
    "user:email",
  ]);

  return { state, url };
}

export async function getOAuthUserProfile(
  provider: OAuthProvider,
  code: string,
  codeVerifier?: string,
): Promise<OAuthUserProfile> {
  if (provider === "google") {
    if (!codeVerifier) {
      throw oauthError();
    }

    const tokens = await getGoogleClient().validateAuthorizationCode(
      code,
      codeVerifier,
    );
    const googleUser = googleUserSchema.parse(
      await fetchJson(
        "https://openidconnect.googleapis.com/v1/userinfo",
        tokens.accessToken(),
      ),
    );

    if (!googleUser.email_verified) {
      throw oauthError("Google account email must be verified");
    }

    return {
      avatarUrl: googleUser.picture,
      email: googleUser.email,
      emailVerified: googleUser.email_verified,
      name: googleUser.name,
      provider,
      providerAccountId: googleUser.sub,
    };
  }

  const tokens = await getGitHubClient().validateAuthorizationCode(code);
  const [githubUser, githubEmails] = await Promise.all([
    fetchJson("https://api.github.com/user", tokens.accessToken()),
    fetchJson("https://api.github.com/user/emails", tokens.accessToken()),
  ]);
  const user = githubUserSchema.parse(githubUser);
  const emails = githubEmailsSchema.parse(githubEmails);
  const primaryEmail = emails.find((email) => email.primary && email.verified);
  const verifiedEmail =
    primaryEmail ?? emails.find((email) => email.verified) ?? null;

  if (!verifiedEmail) {
    throw oauthError("GitHub account needs a verified email address");
  }

  return {
    avatarUrl: user.avatar_url,
    email: verifiedEmail.email,
    emailVerified: verifiedEmail.verified,
    name: user.name ?? user.login,
    provider,
    providerAccountId: String(user.id),
  };
}
