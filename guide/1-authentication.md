# Authentication Guide

This guide is the source of truth for Analy authentication.

## Goals

- Use secure, cookie-based access tokens.
- Use Redis-backed refresh sessions for long-lived login.
- Support email/password now and scalable GitHub/Google OAuth later.
- Keep all auth request/response schemas, auth-facing types, roles, token TTL constants, and cookie constants in `packages/shared`.
- Keep tokens out of browser-readable storage.

## Token Model

Use a two-token authentication model with short-lived access tokens and long-lived refresh sessions.

- Access token TTL: 15 minutes.
- Refresh token/session TTL: 30 days in Redis.
- Access token transport: secure `HttpOnly` cookie.
- Refresh token storage: Redis only, preferably hashed before storing.
- Rotate tokens through `POST /auth/rotate-token`.
- Resolve the current authenticated user through `GET /auth/me`.
- System roles are `admin` and `regular`.

## Access Token Cookie

- Store the access token only in an `HttpOnly` cookie.
- Use `Secure` outside local development.
- Use `SameSite=Lax` by default unless cross-site auth requires `None` with `Secure`.
- Scope the cookie path to the API surface when practical.
- Never store access tokens in localStorage, sessionStorage, Zustand, React state, or TanStack Query cache.

## Refresh Sessions

- Store refresh sessions in Redis with a 30-day TTL.
- Store a hashed refresh token or opaque session identifier, not the raw token value.
- Include enough metadata to revoke safely: `userId`, `sessionId`, `createdAt`, `expiresAt`, `lastRotatedAt`, optional `userAgent`, optional `ipHash`.
- Rotate refresh tokens on `POST /auth/rotate-token` to reduce replay risk.
- Delete the Redis session on logout.
- Delete all user sessions on password reset or account compromise.
- Redis is session/cache storage only, not the source of truth for users or permissions.

## Endpoints

- `POST /auth/register`: create a user with email and password.
- `POST /auth/login`: verify credentials, create Redis refresh session, set access token cookie, return safe user data.
- `POST /auth/logout`: delete refresh session and clear auth cookies.
- `POST /auth/rotate-token`: validate refresh session, rotate refresh session when appropriate, set a fresh access token cookie.
- `GET /auth/me`: validate access token cookie and return the current user, system role, organizations, memberships, and active permissions needed by the web app.
- `GET /auth/github`: start GitHub OAuth.
- `GET /auth/github/callback`: complete GitHub OAuth.
- `GET /auth/google`: start Google OAuth.
- `GET /auth/google/callback`: complete Google OAuth.

## Frontend Startup Flow

Use Zustand persist for safe UI auth state only, not token storage.

- Store only safe user/session UI state in Zustand persist: user id, email, name, avatar, system role, selected organization/project ids, and a boolean such as `isLoggedIn`.
- On app startup or hard page refresh, wait for Zustand persist hydration before making auth decisions.
- After hydration, if persisted state says a user is logged in, call `GET /auth/me` to refresh real server state.
- If `GET /auth/me` succeeds, replace persisted user state with server data.
- If `GET /auth/me` returns unauthorized, call `POST /auth/rotate-token` once, then retry `GET /auth/me` once.
- If refresh fails, clear persisted auth state and send the user to login.
- Use TanStack Query for `/auth/me` and other server state.
- Use Zustand only for local UI/session hints.

## Axios Refresh Flow

- Configure Axios with `withCredentials: true` so cookies are sent to the API.
- On a `401` response, call `POST /auth/rotate-token` once.
- Retry the original request once after a successful token rotation.
- Prevent infinite retry loops with a request-level retry marker.
- If rotation fails, clear safe auth state and redirect to login.
- Do not expose tokens to Axios interceptors; cookies are handled by the browser.

## Backend Implementation Rules

- Validate request input with shared Zod schemas from `@repo/shared`.
- Return response shapes typed from shared schemas/types.
- Hash passwords with Argon2id.
- Sign and verify access JWTs with `jose`.
- Set and clear auth cookies with Hono cookie helpers.
- Use one Redis client module in `apps/api` for refresh sessions.
- Keep route handlers small; put reusable auth logic into services/helpers.
- Never authorize from access token claims alone when organization/project permissions are needed; load memberships/permissions from PostgreSQL.

## OAuth Scalability

Model identities separately from users so email/password, GitHub, and Google can coexist.

Recommended tables in `packages/shared` Drizzle schemas:

- `users`: canonical user profile and system role.
- `user_accounts`: login identities with `provider`, `providerAccountId`, `userId`, and provider metadata.
- `refresh_sessions`: optional PostgreSQL audit record for sessions if needed; Redis remains the active session store.

OAuth rules:

- Support multiple login providers per user.
- Keep email/password as one identity path, not the only account model.
- Require verified email from OAuth providers before trusting provider email.
- Handle account linking explicitly to avoid accidental account takeover.
- Use `arctic` for GitHub and Google OAuth flows.

## Recommended Libraries

- `jose`: sign and verify JWT access tokens.
- `@node-rs/argon2`: hash and verify passwords with Argon2id.
- `arctic`: OAuth helpers for GitHub and Google login.
- `zod`: validate auth request bodies, responses, and environment variables.
- Hono cookie helpers: set and clear secure auth cookies.
- Redis client: refresh sessions, cache, rate limits, and short-lived coordination only.
