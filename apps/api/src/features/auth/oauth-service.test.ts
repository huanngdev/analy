import { describe, expect, test } from "bun:test";

import { createOAuthAuthorization } from "@/features/auth/oauth-service";

describe("createOAuthAuthorization", () => {
  test("builds a GitHub authorization url with state and scopes", () => {
    const result = createOAuthAuthorization("github") as {
      state: string;
      url: URL;
    };

    expect(result.state).toBeTruthy();
    expect(result.url.hostname).toBe("github.com");
    expect(result.url.searchParams.get("state")).toBe(result.state);
    expect(result.url.searchParams.get("redirect_uri")).toBe(
      "http://localhost:5000/auth/github/callback",
    );
    expect(result.url.searchParams.get("scope") ?? "").toContain("user:email");
  });

  test("builds a Google authorization url with PKCE", () => {
    const result = createOAuthAuthorization("google") as {
      codeVerifier?: string;
      state: string;
      url: URL;
    };

    expect(result.codeVerifier).toBeTruthy();
    expect(result.url.hostname).toBe("accounts.google.com");
    expect(result.url.searchParams.get("state")).toBe(result.state);
    expect(result.url.searchParams.get("code_challenge")).toBeTruthy();
    expect(result.url.searchParams.get("scope") ?? "").toContain("email");
  });
});
