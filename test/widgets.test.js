import { describe, expect, it } from "vitest";
import {
  formatShortTime,
  formatTimeParts,
  getHourlyIndex,
  getWeatherSummary,
  weatherCodeMap
} from "../assets/js/widgets.js";

describe("widget helpers", () => {
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
});
