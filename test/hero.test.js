import { describe, it, expect, vi, beforeEach } from "vitest";

const fixedNow = new Date("2025-01-01T12:34:56.000Z");

describe("hero widget", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <p id="clock">--:--:--</p>
      <strong id="wx-temp">--°</strong>
      <span id="wx-desc">—</span>
      <span id="wx-location">—</span>
      <time id="wx-updated">—:—</time>
    `;
  });

  it("updates clock and weather fields", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        current: {
          temperature_2m: 21.5,
          apparent_temperature: 20,
          precipitation: 0,
          weather_code: 1,
          wind_speed_10m: 12,
        },
      }),
    }));

    const { initHero } = await import("../assets/js/hero.js");
    const stop = initHero({
      fetchFn: fetchMock,
      nowFn: () => fixedNow,
      clockIntervalMs: 50,
      weatherIntervalMs: 50,
    });

    await vi.waitFor(() => {
      expect(document.getElementById("wx-temp").textContent).toBe("21.5°");
      expect(document.getElementById("wx-desc").textContent).toContain("Overwegend");
      expect(document.getElementById("wx-location").textContent).toBe("Opbrakel");
      expect(document.getElementById("wx-updated").textContent).not.toBe("—:—");
      expect(document.getElementById("clock").textContent).not.toBe("--:--:--");
    });

    stop.stop();
  });

  it("stops active timers on cleanup", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ current: { temperature_2m: 10, weather_code: 0 } }),
    }));
    const clearMock = vi.fn();
    const intervalMock = vi.fn((cb) => {
      cb();
      return 123;
    });

    const { initHero } = await import("../assets/js/hero.js");
    const control = initHero({
      fetchFn: fetchMock,
      setIntervalFn: intervalMock,
      clearIntervalFn: clearMock,
      nowFn: () => fixedNow,
    });

    control.stop();
    expect(clearMock).toHaveBeenCalled();
  });
});
