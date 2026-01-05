import { describe, expect, it } from "vitest";
import { add, multiply } from "./math.js";

describe("math helpers", () => {
  it("adds numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("multiplies numbers", () => {
    expect(multiply(4, 5)).toBe(20);
  });
});
