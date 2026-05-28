export const SYSTEM_ROLES = ["admin", "regular"] as const;

export const AUTH_PROVIDERS = ["email", "github", "google"] as const;

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

export const REFRESH_SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

export const AUTH_COOKIE_NAMES = {
  accessToken: "analy_access_token",
  refreshToken: "analy_refresh_token",
} as const;
