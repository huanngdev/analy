import { beforeEach, describe, expect, test } from "bun:test";
import type { AuthMeResponse } from "@repo/shared";

import { useAuthStore } from "@/stores/auth-store";

const sampleAuth: AuthMeResponse = {
  memberships: [],
  ok: true,
  organizations: [],
  permissions: [],
  user: {
    avatarUrl: null,
    createdAt: new Date("2024-01-01T00:00:00.000Z").toISOString(),
    email: "user@example.com",
    emailVerified: true,
    id: "00000000-0000-4000-8000-000000000000",
    name: "User",
    systemRole: "regular",
  },
};

beforeEach(() => {
  useAuthStore.setState({ auth: null, hydrated: false });
});

describe("useAuthStore", () => {
  test("setAuth stores the auth payload", () => {
    useAuthStore.getState().setAuth(sampleAuth);

    expect(useAuthStore.getState().auth).toEqual(sampleAuth);
  });

  test("clearAuth resets the auth payload to null", () => {
    useAuthStore.getState().setAuth(sampleAuth);
    useAuthStore.getState().clearAuth();

    expect(useAuthStore.getState().auth).toBeNull();
  });

  test("setHydrated toggles the hydration flag", () => {
    expect(useAuthStore.getState().hydrated).toBe(false);

    useAuthStore.getState().setHydrated(true);

    expect(useAuthStore.getState().hydrated).toBe(true);
  });
});
