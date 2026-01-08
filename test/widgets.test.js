import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildReverseGeocodeUrl,
  formatShortTime,
  formatTimeParts,
  getBrowserCoords,
  getHourlyIndex,
  getLocationName,
  getWeatherSummary,
  initWeatherWidget,
  setRotation,
  updateClockWidget,
  weatherCodeMap,
} from '../assets/js/widgets/widgets.js';

const flushPromises = async (times = 1) => {
  for (let i = 0; i < times; i += 1) {
    await Promise.resolve();
  }
};

describe('widget helpers', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('formats time parts in a stable timezone', () => {
    const date = new Date('2024-01-01T12:34:56Z');
    const parts = formatTimeParts(date, 'UTC');
    expect(parts.hour).toBe(12);
    expect(parts.minute).toBe(34);
    expect(parts.second).toBe(56);
    expect(parts.timeString).toBe('12:34:56');
  });

  it('formats a short time', () => {
    const date = new Date('2024-01-01T09:05:00Z');
    expect(formatShortTime(date, 'UTC')).toBe('09:05');
  });

  it('finds the matching hourly index', () => {
    const times = ['2024-01-01T11:00', '2024-01-01T12:00', '2024-01-01T13:00'];
    const date = new Date('2024-01-01T12:34:00Z');
    expect(getHourlyIndex(times, date, 'UTC')).toBe(1);
  });

  it('returns -1 when hourly index is missing', () => {
    const times = ['2024-01-01T08:00', '2024-01-01T09:00'];
    const date = new Date('2024-01-01T12:34:00Z');
    expect(getHourlyIndex(times, date, 'UTC')).toBe(-1);
  });

  it('builds a weather summary', () => {
    const data = {
      current: {
        temperature_2m: 8.4,
        apparent_temperature: 6.9,
        precipitation: 0.5,
        weather_code: 2,
        wind_speed_10m: 12.2,
        wind_direction_10m: 180,
        relative_humidity_2m: 81,
      },
      hourly: {
        time: ['2024-01-01T12:00'],
        precipitation_probability: [45],
      },
    };
    const now = new Date('2024-01-01T12:10:00Z');
    const summary = getWeatherSummary(data, 'UTC', now);

    expect(summary.temperature).toBe(8.4);
    expect(summary.apparentTemperature).toBe(6.9);
    expect(summary.precipitationProbability).toBe(45);
    expect(summary.description).toBe(weatherCodeMap[2]);
  });

  it('handles missing hourly data in weather summary', () => {
    const data = {
      current: {
        temperature_2m: 12.1,
        apparent_temperature: 10.4,
        precipitation: 0,
        weather_code: 1,
        wind_speed_10m: 5.2,
        wind_direction_10m: 220,
        relative_humidity_2m: 60,
      },
    };
    const summary = getWeatherSummary(data, 'UTC', new Date('2024-01-01T12:10:00Z'));

    expect(summary.precipitationProbability).toBeUndefined();
    expect(summary.description).toBe(weatherCodeMap[1]);
  });

  it('resolves a location name from reverse geocoding', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [{ name: 'Brussel' }] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(getLocationName(50.85, 4.35)).resolves.toBe('Brussel');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain('latitude=50.85');
  });

  it('throws when reverse geocoding returns no results', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(getLocationName(1, 2)).rejects.toThrow('No reverse geocode results');
  });

  it('sets rotation CSS custom property', () => {
    const style = { setProperty: vi.fn() };
    setRotation({ style }, 45);
    expect(style.setProperty).toHaveBeenCalledWith('--rotation', '45deg');
  });

  it('builds a reverse geocode URL with query params', () => {
    const url = buildReverseGeocodeUrl(50.85, 4.35);
    expect(url).toBeInstanceOf(URL);
    expect(url.searchParams.get('latitude')).toBe('50.85');
    expect(url.searchParams.get('longitude')).toBe('4.35');
    expect(url.searchParams.get('language')).toBe('nl');
    expect(url.searchParams.get('count')).toBe('1');
  });

  it('resolves browser coordinates when geolocation is available', async () => {
    const getCurrentPosition = vi.fn((success) =>
      success({ coords: { latitude: 51.0, longitude: 4.4 } }),
    );
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });

    await expect(getBrowserCoords()).resolves.toEqual({ lat: 51.0, lon: 4.4 });
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it('rejects when geolocation is unsupported', async () => {
    await expect(getBrowserCoords()).rejects.toThrow('Geolocation unsupported');
  });

  it('updates a clock widget with time and hand rotations', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T03:00:00Z'));

    const timeEl = { textContent: '' };
    const hourHand = { style: { setProperty: vi.fn() } };
    const minuteHand = { style: { setProperty: vi.fn() } };
    const secondHand = { style: { setProperty: vi.fn() } };
    const widget = {
      isConnected: true,
      querySelectorAll: () => [timeEl],
      querySelector: (selector) => {
        if (selector === '[data-clock-hour]') return hourHand;
        if (selector === '[data-clock-minute]') return minuteHand;
        if (selector === '[data-clock-second]') return secondHand;
        return null;
      },
    };

    updateClockWidget(widget, 'UTC');

    expect(timeEl.textContent).toBe('03:00:00');
    expect(hourHand.style.setProperty).toHaveBeenCalledWith('--rotation', '90deg');
    expect(minuteHand.style.setProperty).toHaveBeenCalledWith('--rotation', '0deg');
    expect(secondHand.style.setProperty).toHaveBeenCalledWith('--rotation', '0deg');

    widget.isConnected = false;
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('returns early when a clock widget has no targets', () => {
    const widget = {
      querySelectorAll: () => [],
      querySelector: () => null,
    };

    expect(() => updateClockWidget(widget, 'UTC')).not.toThrow();
  });

  it('initializes a weather widget from manual coords', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T03:00:00Z'));

    const fetchMock = vi.fn(() => ({
      ok: true,
      json: () => ({
        current: {
          temperature_2m: 10,
          apparent_temperature: 8,
          precipitation: 1,
          weather_code: 999,
          wind_speed_10m: 5,
          wind_direction_10m: 180,
          relative_humidity_2m: 70,
        },
        hourly: {
          time: ['2024-01-01T03:00'],
          precipitation_probability: [40],
        },
      }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const tempEl = { textContent: '' };
    const descEl = { textContent: '' };
    const locationEl = { textContent: '' };
    const updatedEl = { textContent: '', dateTime: '' };
    const apparentEl = { textContent: '' };
    const windEl = { textContent: '' };
    const windDirEl = { textContent: '' };
    const precipEl = { textContent: '' };
    const precipProbEl = { textContent: '' };
    const humidityEl = { textContent: '' };
    const elements = {
      '[data-wx-temp]': tempEl,
      '[data-wx-desc]': descEl,
      '[data-wx-location]': locationEl,
      '[data-wx-updated]': updatedEl,
      '[data-wx-apparent]': apparentEl,
      '[data-wx-wind]': windEl,
      '[data-wx-wind-direction]': windDirEl,
      '[data-wx-precip]': precipEl,
      '[data-wx-precip-prob]': precipProbEl,
      '[data-wx-humidity]': humidityEl,
    };
    const widget = {
      dataset: {
        widgetLat: '50.85',
        widgetLon: '4.35',
        widgetLocation: 'Test City',
        widgetTz: 'UTC',
        widgetRefresh: '10',
      },
      isConnected: true,
      querySelector: (selector) => elements[selector] ?? null,
    };

    initWeatherWidget(widget);
    await flushPromises(4);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(descEl.textContent).toBe('Weer');
    expect(locationEl.textContent).toBe('Test City');
    expect(updatedEl.textContent).toBe('03:00');
    expect(updatedEl.dateTime).not.toBe('');
    expect(tempEl.textContent.startsWith('10')).toBe(true);
    expect(apparentEl.textContent.startsWith('8')).toBe(true);
    expect(windEl.textContent).toContain(' km/h');
    expect(windDirEl.textContent.startsWith('180')).toBe(true);
    expect(precipEl.textContent).toContain(' mm');
    expect(precipProbEl.textContent).toContain('%');
    expect(humidityEl.textContent).toContain('%');

    widget.isConnected = false;
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('shows an error message when weather updates fail', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(() => {
      throw new Error('nope');
    });
    vi.stubGlobal('fetch', fetchMock);

    const descEl = { textContent: '' };
    const widget = {
      dataset: { widgetLat: '50.85', widgetLon: '4.35', widgetRefresh: '10' },
      isConnected: true,
      querySelector: (selector) => (selector === '[data-wx-desc]' ? descEl : null),
    };

    initWeatherWidget(widget);
    await flushPromises(4);

    expect(descEl.textContent).toBe('Weer: fout bij ophalen.');

    widget.isConnected = false;
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });
});
