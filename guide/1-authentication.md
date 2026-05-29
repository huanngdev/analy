# Authentication Guide

This guide is the source of truth for Analy authentication and the handoff document for future agent sessions.

## Current State

- Email/password authentication is implemented in `apps/api/src/auth`.
- Access tokens are JWTs signed with `jose` and stored in an `HttpOnly` cookie.
- Refresh sessions are active in Redis and audited in PostgreSQL.
- Auth request/response schemas, auth-facing types, provider constants, cookie names, and token TTLs live in `packages/shared`.
- API docs use OpenAPI 3.1 with Scalar in development only.
- GitHub and Google OAuth are implemented with `arctic`; OAuth accounts reuse `user_accounts` and create a user automatically when no matching user exists.
- `/auth/me` returns the authenticated user's safe profile data only, with no collaboration-scoped auth context.

## Runtime Infrastructure

- PostgreSQL stores users, linked login identities, and refresh session audit metadata.
- Redis stores active refresh session state and is the source of truth for whether a refresh token is usable.
- Hono runs the API through `Bun.serve`.
- `apps/api/src/index.ts` checks PostgreSQL first, Redis second, then starts the API.
- API startup intentionally crashes if PostgreSQL or Redis cannot connect.
- OpenAPI docs are registered only when `NODE_ENV !== "production"`.

## Development URLs

- Web client: `http://localhost:3000`
- API: `http://localhost:5000`
- Scalar docs: `http://localhost:5000/docs`
- Raw OpenAPI spec: `http://localhost:5000/openapi.json`
- Drizzle Studio: `https://local.drizzle.studio`

## Token Model

Use a two-token model with short-lived access tokens and long-lived refresh sessions.

- Access token TTL: 15 minutes.
- Refresh session TTL: 30 days.
- Access token cookie name: `analy_access_token`.
- Refresh token cookie name: `analy_refresh_token`.
- Cookie flags: `HttpOnly`, `SameSite=Lax`, `path=/`, `Secure` only in production.
- Optional cookie domain comes from `AUTH_COOKIE_DOMAIN`.
- Never store tokens in localStorage, sessionStorage, Zustand, React state, or TanStack Query cache.

## Current Endpoints

- `GET /`: system greeting.
- `GET /health`: API health response.
- `POST /auth/register`: validates email/password input, creates a user, creates an email provider account, creates a refresh session, sets auth cookies, and returns safe user data.
- `POST /auth/login`: verifies email/password credentials, creates a refresh session, sets auth cookies, and returns safe user data.
- `POST /auth/logout`: revokes the refresh session if a refresh cookie is present and clears both auth cookies.
- `POST /auth/rotate-token`: validates and rotates the refresh token, signs a new access token, sets both cookies, preserves the original refresh-session expiry, and returns safe user data.
- `GET /auth/me`: uses the authentication middleware to verify the access token cookie, loads the user from PostgreSQL, and returns safe user data.
- `GET /auth/github`: start GitHub OAuth.
- `GET /auth/github/callback`: complete GitHub OAuth.
- `GET /auth/google`: start Google OAuth.
- `GET /auth/google/callback`: complete Google OAuth.

## Planned Endpoints

- Future project, service, credential, backup, metric, usage, billing, and provisioning endpoints must scope protected reads and writes by the authenticated user's `userId`, not JWT claims or resource ids alone.

## API Docs Rules

- Every new or changed endpoint must include OpenAPI metadata.
- Use `OpenAPIHono` and `createRoute` from `@hono/zod-openapi`.
- Prefer shared Zod schemas from `@repo/shared` for request and response docs.
- Keep `/docs` and `/openapi.json` development-only.
- Do not expose secrets, stack traces, environment internals, or implementation-only details in docs.
- Auth cookie security schemes are registered in `apps/api/src/open-api.ts`.

## Environment Variables

Validated by `packages/shared/src/validation/env-validation.ts` and parsed in `apps/api/src/env.ts`.

- `ACCESS_TOKEN_SECRET`: minimum 32 characters.
- `REFRESH_TOKEN_SECRET`: minimum 32 characters.
- `DATABASE_URL`: PostgreSQL connection URL.
- `REDIS_URL`: Redis connection URL.
- `CORS_ORIGINS`: comma-separated origin list, defaults to `http://localhost:3000`.
- `AUTH_COOKIE_DOMAIN`: optional cookie domain.
- `API_PUBLIC_URL`: public API origin used to build OAuth callback URLs, defaults to `http://localhost:5000`.
- `WEB_APP_URL`: web origin used after OAuth success redirects, defaults to `http://localhost:3000`.
- `GITHUB_CLIENT_ID`: GitHub OAuth app client ID.
- `GITHUB_CLIENT_SECRET`: GitHub OAuth app client secret.
- `GOOGLE_CLIENT_ID`: Google OAuth web client ID.
- `GOOGLE_CLIENT_SECRET`: Google OAuth web client secret.
- `NODE_ENV`: `development`, `test`, or `production`, defaults to `development`.
- `PORT`: API port, defaults to `5000`.

## Database Model

Defined in `packages/shared/src/db/schema/auth-schema.ts`.

- `users`: canonical user profile, password hash, email verification flag, timestamps.
- `user_accounts`: login identities for `email`, `github`, and `google`, linked to one user.
- `refresh_sessions`: PostgreSQL audit record for refresh sessions. Redis remains the active session store.

Important rules:

- Keep Drizzle schemas in `packages/shared`.
- Keep PostgreSQL as the source of truth for users, projects, provisioned services, credentials metadata, backups metadata, and usage records.
- Keep Redis limited to active refresh sessions, cache, rate limits, and short-lived coordination.
- Do not authorize project, service, credential, backup, or usage access from resource ids alone; always scope by authenticated user ownership.

## File Structure

### API Auth Files

- `apps/api/src/auth/auth-routes.ts`: Hono auth route definitions, OpenAPI route metadata, request parsing, response validation, and cookie wiring.
- `apps/api/src/auth/auth-service.ts`: email/password registration, login, token rotation orchestration, and current-user lookup rules.
- `apps/api/src/auth/auth-repository.ts`: Drizzle user/account/session-audit queries and user-record mapping.
- `apps/api/src/auth/oauth-service.ts`: GitHub/Google authorization URLs, callback token exchange, and provider profile loading.
- `apps/api/src/auth/access-token.ts`: JWT signing and verification for access tokens.
- `apps/api/src/auth/auth-cookies.ts`: read, set, and clear auth cookies with secure cookie options.
- `apps/api/src/auth/password.ts`: Argon2 password hashing and verification.
- `apps/api/src/auth/refresh-session-service.ts`: refresh token generation, HMAC hashing, Redis session storage, refresh rotation, and session revocation.
- `apps/api/src/auth/request-context.ts`: JSON body parsing and extraction of user agent/IP metadata for refresh sessions.

### API Infrastructure Files

- `apps/api/src/app.ts`: root Hono app, security/CORS/request-id/logger middleware, system routes, docs registration, auth route mounting, global error handling, and 404 handling.
- `apps/api/src/index.ts`: startup entrypoint that verifies PostgreSQL and Redis before `Bun.serve`.
- `apps/api/src/db.ts`: PostgreSQL client, Drizzle instance, and database connectivity assertion.
- `apps/api/src/redis.ts`: Redis client lifecycle and connectivity assertion.
- `apps/api/src/env.ts`: API environment parsing through shared Zod schema.
- `apps/api/src/open-api.ts`: dev-only Scalar docs and OpenAPI 3.1 spec registration.
- `apps/api/src/errors/app-error.ts`: typed application error for safe status/code/message responses.
- `apps/api/src/middleware/error-handler.ts`: global app/Zod/unexpected error responses.
- `apps/api/src/middleware/not-found.ts`: stable JSON 404 response.
- `apps/api/src/middleware/request-id.ts`: request id context middleware.
- `apps/api/src/middleware/cors.ts`: CORS using validated origins.
- `apps/api/src/middleware/security.ts`: Hono secure headers middleware.
- `apps/api/src/middleware/require-auth.ts`: access-token authentication middleware for protected routes.

### Shared Auth Files

- `packages/shared/src/constants/auth-constants.ts`: auth providers, token TTLs, and cookie names.
- `packages/shared/src/db/schema/auth-schema.ts`: Drizzle auth tables and enums.
- `packages/shared/src/validation/auth-validation.ts`: auth request/response Zod schemas.
- `packages/shared/src/validation/api-validation.ts`: shared API root/error response schemas.
- `packages/shared/src/validation/env-validation.ts`: API and database environment schemas.
- `packages/shared/src/types/auth-api-types.ts`: inferred auth request/response/user types.
- `packages/shared/src/types/auth-types.ts`: inferred Drizzle auth table types.
- `packages/shared/src/types/api-error-types.ts`: stable API error codes and response types.

## Request Flow

Registration:

1. `auth-routes.ts` parses JSON with `parseJsonBody`.
2. Shared Zod schema validates the request.
3. `auth-service.ts` hashes the password.
4. `auth-repository.ts` creates `users` and `user_accounts` in one transaction.
5. `refresh-session-service.ts` creates Redis session state and PostgreSQL audit metadata.
6. `access-token.ts` signs a short-lived access token.
7. `auth-cookies.ts` sets access and refresh cookies.
8. Route returns `authSessionResponseSchema` output.

Login:

1. Route validates input through shared schema.
2. Repository loads user by email.
3. Password helper verifies Argon2 hash.
4. Service creates access token and refresh session.
5. Route sets cookies and returns safe user data.

OAuth login:

1. Start route creates an OAuth `state`, stores it in an HttpOnly cookie, and redirects to the provider.
2. Google also stores a PKCE code verifier in an HttpOnly cookie.
3. Callback route validates `state`, exchanges `code` for provider tokens, and loads a verified provider email/profile.
4. Repository finds a linked provider account, links an existing user with the same email, or creates a new passwordless user.
5. Service creates Analy access/refresh cookies and redirects to the dashboard.

Token rotation:

1. Route reads refresh cookie.
2. Refresh service parses `sessionId.refreshToken`.
3. Redis session is loaded and token HMAC is compared with timing-safe comparison.
4. A new refresh token is generated while preserving the original refresh-session expiry.
5. Redis session and PostgreSQL audit row are updated without extending the refresh-session lifetime.
6. Service signs a new access token for the user.
7. Route sets rotated cookies and returns safe user data.

Current user:

1. `requireAuthMiddleware` reads the access token cookie.
2. `verifyAccessToken` validates JWT signature and payload.
3. The route reads the verified auth payload from Hono context.
4. `getAuthUser` loads the user from PostgreSQL.
5. Route returns safe user data.

## Error Handling

- Known auth/domain failures throw `AppError` with stable API error codes.
- Zod errors become `400 VALIDATION_ERROR`.
- Unknown errors become `500 INTERNAL_SERVER_ERROR`.
- Responses include `requestId` and never expose secrets, SQL details, stack traces, raw tokens, or internal service errors.

## Frontend Integration Rules

- Configure browser API calls with credentials enabled so cookies are sent.
- Store only safe UI auth hints in Zustand, never tokens.
- Use TanStack Query for `/auth/me` and other server state.
- On startup, hydrate safe persisted state first, then call `GET /auth/me`.
- Axios intercepts protected-route `401` responses, calls `POST /auth/rotate-token`, and retries the original request up to 3 times.
- If rotation fails or the retry limit is reached, clear safe auth state, clear cached queries, and redirect to login.

## Next Agent Session Notes

- Current branch work is on `feat/authen`.
- Current API auth docs are available at `/docs` in development.
- If the editor reports missing exports from `@repo/shared`, build the shared package and restart the TypeScript server; package exports point to `packages/shared/dist`.
- When adding a route, update OpenAPI metadata in the same route file.
- When changing auth request/response shape, update shared Zod schemas first, then inferred types, then route/service usage.
- OAuth reuses `user_accounts` and avoids provider-specific columns on `users`.
- Keep `/auth/me` focused on the authenticated user; do not add collaboration-scoped auth context payloads.
- Add backend tests before expanding ownership-sensitive behavior.

## Recommended Libraries

- `jose`: sign and verify JWT access tokens.
- `@node-rs/argon2`: hash and verify passwords with Argon2id.
- `arctic`: OAuth helpers for GitHub and Google login.
- `zod`: validate auth request bodies, responses, and environment variables.
- `@hono/zod-openapi`: route-level OpenAPI metadata from Zod schemas.
- `@scalar/hono-api-reference`: development API docs UI.
- Redis client: refresh sessions, cache, rate limits, and short-lived coordination only.
