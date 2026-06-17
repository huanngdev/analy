import { describe, expect, test } from "bun:test";

import { formatGreeting } from "./functions";

describe("formatGreeting", () => {
  test("interpolates the target into the greeting", () => {
    expect(formatGreeting("api")).toBe("Hello from api");
  });

  test("handles an empty target", () => {
    expect(formatGreeting("")).toBe("Hello from ");
  });
});
