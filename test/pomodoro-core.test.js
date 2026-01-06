import { describe, expect, it } from "vitest";
import { capFor, defaultConfig, formatDuration } from "../assets/js/pomodoro-core.js";

describe("pomodoro core", () => {
  it("formats duration into mm:ss", () => {
    expect(formatDuration(125)).toBe("02:05");
    expect(formatDuration(-5)).toBe("00:00");
  });

  it("returns caps based on mode", () => {
    expect(capFor("focus", defaultConfig)).toBe(defaultConfig.focus);
    expect(capFor("break", defaultConfig)).toBe(defaultConfig.break);
  });
});
