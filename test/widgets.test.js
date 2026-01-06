import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatShortTime,
  formatTimeParts,
  getHourlyIndex,
  getLocationName,
  getWeatherSummary,
  weatherCodeMap
} from "../assets/js/widgets.js";

describe("widget helpers", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("formats time parts in a stable timezone", () => {
    const date = new Date("2024-01-01T12:34:56Z");
    const parts = formatTimeParts(date, "UTC");
    expect(parts.hour).toBe(12);
    expect(parts.minute).toBe(34);
    expect(parts.second).toBe(56);
    expect(parts.timeString).toBe("12:34:56");
  });

  it("formats a short time", () => {
    const date = new Date("2024-01-01T09:05:00Z");
    expect(formatShortTime(date, "UTC")).toBe("09:05");
  });

  it("finds the matching hourly index", () => {
    const times = ["2024-01-01T11:00", "2024-01-01T12:00", "2024-01-01T13:00"];
    const date = new Date("2024-01-01T12:34:00Z");
    expect(getHourlyIndex(times, date, "UTC")).toBe(1);
  });

  it("returns -1 when hourly index is missing", () => {
    const times = ["2024-01-01T08:00", "2024-01-01T09:00"];
    const date = new Date("2024-01-01T12:34:00Z");
    expect(getHourlyIndex(times, date, "UTC")).toBe(-1);
  });

  it("builds a weather summary", () => {
    const data = {
      current: {
        temperature_2m: 8.4,
        apparent_temperature: 6.9,
        precipitation: 0.5,
        weather_code: 2,
        wind_speed_10m: 12.2,
        wind_direction_10m: 180,
        relative_humidity_2m: 81
      },
      hourly: {
        time: ["2024-01-01T12:00"],
        precipitation_probability: [45]
      }
    };
    const now = new Date("2024-01-01T12:10:00Z");
    const summary = getWeatherSummary(data, "UTC", now);

    expect(summary.temperature).toBe(8.4);
    expect(summary.apparentTemperature).toBe(6.9);
    expect(summary.precipitationProbability).toBe(45);
    expect(summary.description).toBe(weatherCodeMap[2]);
  });

  it("handles missing hourly data in weather summary", () => {
    const data = {
      current: {
        temperature_2m: 12.1,
        apparent_temperature: 10.4,
        precipitation: 0,
        weather_code: 1,
        wind_speed_10m: 5.2,
        wind_direction_10m: 220,
        relative_humidity_2m: 60
      }
    };
    const summary = getWeatherSummary(data, "UTC", new Date("2024-01-01T12:10:00Z"));

    expect(summary.precipitationProbability).toBeUndefined();
    expect(summary.description).toBe(weatherCodeMap[1]);
  });

  it("resolves a location name from reverse geocoding", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [{ name: "Brussel" }] })
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getLocationName(50.85, 4.35)).resolves.toBe("Brussel");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain("latitude=50.85");
  });

  it("throws when reverse geocoding returns no results", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] })
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getLocationName(1, 2)).rejects.toThrow("No reverse geocode results");
  });
});
