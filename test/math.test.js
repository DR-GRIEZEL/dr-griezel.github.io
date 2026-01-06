import { describe, expect, it } from "vitest";
import { add, clamp, multiply, safeDivide, subtract } from "./math.js";

describe("math helpers", () => {
  it("adds numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("multiplies numbers", () => {
    expect(multiply(4, 5)).toBe(20);
  });

  it("subtracts numbers", () => {
    expect(subtract(10, 4)).toBe(6);
  });

  it("clamps values inside range", () => {
    expect(clamp(7, 0, 5)).toBe(5);
    expect(clamp(-3, 0, 5)).toBe(0);
    expect(clamp(3, 0, 5)).toBe(3);
  });

  it("returns null when dividing by zero", () => {
    expect(safeDivide(5, 0)).toBeNull();
  });

  it("divides numbers safely", () => {
    expect(safeDivide(9, 3)).toBe(3);
  });
});
