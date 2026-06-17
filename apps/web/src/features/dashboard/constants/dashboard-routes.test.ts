import { describe, expect, test } from "bun:test";

import { getDashboardBreadcrumbs } from "@/features/dashboard/constants/dashboard-routes";

describe("getDashboardBreadcrumbs", () => {
  test("returns a single crumb for the dashboard index", () => {
    expect(getDashboardBreadcrumbs("/dashboard")).toEqual([
      { label: "Dashboard" },
    ]);
    expect(getDashboardBreadcrumbs("/dashboard/")).toEqual([
      { label: "Dashboard" },
    ]);
  });

  test("returns a nested crumb for a known placeholder route", () => {
    expect(getDashboardBreadcrumbs("/dashboard/links")).toEqual([
      { label: "Dashboard", to: "/dashboard" },
      { label: "Links" },
    ]);
  });

  test("falls back to the dashboard crumb for unknown routes", () => {
    expect(getDashboardBreadcrumbs("/dashboard/does-not-exist")).toEqual([
      { label: "Dashboard" },
    ]);
  });
});
