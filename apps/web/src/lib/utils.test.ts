import { describe, expect, test } from "bun:test";

import { cn } from "@/lib/utils";

describe("cn", () => {
  test("joins truthy class values and drops falsy ones", () => {
    const isActive = false;

    expect(cn("a", isActive && "b", undefined, "c")).toBe("a c");
  });

  test("merges conflicting tailwind classes so the last wins", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  test("supports the clsx object syntax", () => {
    expect(cn({ block: true, hidden: false })).toBe("block");
  });
});
