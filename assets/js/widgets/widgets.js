const defaultTimeZone = 'Europe/Brussels';
const weatherRefreshMs = 5 * 60 * 1000;
const clockRefreshMs = 1000;
const defaultCoords = { lat: 50.8503, lon: 4.3517 };
const defaultLocation = 'Brussels';

const weatherCodeMap = {
  0: '☀️ Clear',
  1: '🌤️ Mostly clear',
  2: '⛅ Partly cloudy',
  3: '☁️ Cloudy',
  45: '🌫️ Fog',
  48: '🌫️ Fog',
  51: '🌦️ Drizzle (light)',
  53: '🌧️ Drizzle',
  55: '🌧️ Drizzle (heavy)',
  61: '🌦️ Rain (light)',
  63: '🌧️ Rain',
  65: '🌧️ Rain (heavy)',
  71: '🌨️ Snow (light)',
  73: '🌨️ Snow',
  75: '❄️ Snow (heavy)',
  80: '🌦️ Showers (light)',
  81: '🌧️ Showers',
  82: '⛈️ Showers (heavy)',
  95: '⛈️ Thunderstorm',
  96: '⛈️ Thunderstorm (hail)',
  99: '⛈️ Thunderstorm (heavy hail)',
};

const clockTimers = new WeakMap();
const weatherTimers = new WeakMap();

const numberFormat = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });

const formatTimeParts = (date, timeZone) => {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const map = Object.fromEntries(
    parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]),
  );
  return {
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
    timeString: formatter.format(date),
  };
};

const formatShortTime = (date, timeZone) => {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
  return formatter.format(date);
};

const getHourlyIndex = (times, date, timeZone) => {
  if (!Array.isArray(times)) return -1;
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const map = Object.fromEntries(
    parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]),
  );
  const key = `${map.year}-${map.month}-${map.day}T${map.hour}:00`;
  return times.indexOf(key);
};

const getWeatherSummary = (data, timeZone, now = new Date()) => {
  const current = data?.current ?? {};
  const hourly = data?.hourly ?? {};
  const idx = getHourlyIndex(hourly.time ?? [], now, timeZone);
  const precipitationProbability = idx >= 0 ? hourly.precipitation_probability?.[idx] : undefined;

  return {
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    precipitation: current.precipitation,
    windSpeed: current.wind_speed_10m,
    windDirection: current.wind_direction_10m,
    humidity: current.relative_humidity_2m,
    precipitationProbability,
    description: weatherCodeMap[current.weather_code] ?? 'Weather',
  };
};

const setRotation = (el, deg) => {
  if (!el) return;
  el.style.setProperty('--rotation', `${deg}deg`);
};

const getBrowserCoords = () =>
  new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation unsupported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => reject(error),
      {
        enableHighAccuracy: false,
        maximumAge: 10 * 60 * 1000,
        timeout: 8000,
      },
    );
  });

const buildReverseGeocodeUrl = (lat, lon) => {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/reverse');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('language', 'en');
  url.searchParams.set('count', '1');
  return url;
};

const getLocationName = async (lat, lon) => {
  const res = await fetch(buildReverseGeocodeUrl(lat, lon));
  if (!res.ok) {
    throw new Error(`Reverse geocode failed: ${res.status}`);
  }
  const data = await res.json();
  const result = data?.results?.[0];
  if (!result?.name) {
    throw new Error('No reverse geocode results');
  }
  return result.name;
};

const updateClockWidget = (widget, timeZone) => {
  const timeEls = widget.querySelectorAll('[data-clock-time]');
  const hourHand = widget.querySelector('[data-clock-hour]');
  const minuteHand = widget.querySelector('[data-clock-minute]');
  const secondHand = widget.querySelector('[data-clock-second]');

  if (!timeEls.length && !hourHand && !minuteHand && !secondHand) return;

  const tick = () => {
    const now = new Date();
    const { hour, minute, second, timeString } = formatTimeParts(now, timeZone);
    timeEls.forEach((el) => {
      el.textContent = timeString;
    });
    const hourDeg = ((hour % 12) + minute / 60) * 30;
    const minuteDeg = (minute + second / 60) * 6;
    const secondDeg = second * 6;
    setRotation(hourHand, hourDeg);
    setRotation(minuteHand, minuteDeg);
    setRotation(secondHand, secondDeg);
  };

  tick();
  const existingTimer = clockTimers.get(widget);
  if (existingTimer) clearInterval(existingTimer);
  const timer = setInterval(() => {
    if (!widget.isConnected) {
      clearInterval(timer);
      clockTimers.delete(widget);
      return;
    }
    tick();
  }, clockRefreshMs);
  clockTimers.set(widget, timer);
};

const initWeatherWidget = (widget) => {
  const manualLat = Number(widget.dataset.widgetLat);
  const manualLon = Number(widget.dataset.widgetLon);
  const manualLocation = widget.dataset.widgetLocation ?? defaultLocation;
  const timeZone = widget.dataset.widgetTz ?? defaultTimeZone;
  const refreshMs = Number(widget.dataset.widgetRefresh ?? weatherRefreshMs);

  const tempEl = widget.querySelector('[data-wx-temp]');
  const descEl = widget.querySelector('[data-wx-desc]');
  const locationEl = widget.querySelector('[data-wx-location]');
  const updatedEl = widget.querySelector('[data-wx-updated]');
  const apparentEl = widget.querySelector('[data-wx-apparent]');
  const windEl = widget.querySelector('[data-wx-wind]');
  const windDirEl = widget.querySelector('[data-wx-wind-direction]');
  const precipEl = widget.querySelector('[data-wx-precip]');
  const precipProbEl = widget.querySelector('[data-wx-precip-prob]');
  const humidityEl = widget.querySelector('[data-wx-humidity]');

  const manualCoords =
    Number.isFinite(manualLat) && Number.isFinite(manualLon)
      ? { lat: manualLat, lon: manualLon }
      : null;
  let coords = manualCoords ?? defaultCoords;
  let locationName = manualLocation;

  const buildUrl = (latValue, lonValue) => {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(latValue));
    url.searchParams.set('longitude', String(lonValue));
    url.searchParams.set(
      'current',
      'temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m',
    );
    url.searchParams.set('hourly', 'precipitation_probability');
    url.searchParams.set('timezone', timeZone);
    return url;
  };
  let url = buildUrl(coords.lat, coords.lon);

  const update = async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      const summary = getWeatherSummary(data, timeZone);

      if (tempEl) {
        tempEl.textContent =
          summary.temperature == null ? '--°' : `${numberFormat.format(summary.temperature)}°`;
      }
      if (descEl) descEl.textContent = summary.description;
      if (locationEl) locationEl.textContent = locationName;
      if (apparentEl) {
        apparentEl.textContent =
          summary.apparentTemperature == null
            ? '—'
            : `${numberFormat.format(summary.apparentTemperature)}°`;
      }
      if (windEl) {
        windEl.textContent =
          summary.windSpeed == null ? '—' : `${numberFormat.format(summary.windSpeed)} km/h`;
      }
      if (windDirEl) {
        windDirEl.textContent =
          summary.windDirection == null ? '—' : `${numberFormat.format(summary.windDirection)}°`;
      }
      if (precipEl) {
        precipEl.textContent =
          summary.precipitation == null ? '—' : `${numberFormat.format(summary.precipitation)} mm`;
      }
      if (precipProbEl) {
        precipProbEl.textContent =
          summary.precipitationProbability == null
            ? '—'
            : `${numberFormat.format(summary.precipitationProbability)}%`;
      }
      if (humidityEl) {
        humidityEl.textContent =
          summary.humidity == null ? '—' : `${numberFormat.format(summary.humidity)}%`;
      }
      if (updatedEl) {
        const now = new Date();
        updatedEl.dateTime = now.toISOString();
        updatedEl.textContent = formatShortTime(now, timeZone);
      }
    } catch {
      if (descEl) descEl.textContent = 'Weer: fout bij ophalen.';
    }
  };

  const existingTimer = weatherTimers.get(widget);
  if (existingTimer) clearInterval(existingTimer);
  const startUpdates = () => {
    update();
    const timer = setInterval(() => {
      if (!widget.isConnected) {
        clearInterval(timer);
        weatherTimers.delete(widget);
        return;
      }
      update();
    }, refreshMs);
    weatherTimers.set(widget, timer);
  };

  const resolveCoords = async () => {
    if (manualCoords) {
      coords = manualCoords;
      locationName = manualLocation;
      url = buildUrl(coords.lat, coords.lon);
      return;
    }

    try {
      const browserCoords = await getBrowserCoords();
      coords = browserCoords;
      url = buildUrl(coords.lat, coords.lon);
      locationName = 'Huidige locatie';
      try {
        locationName = await getLocationName(coords.lat, coords.lon);
      } catch {
        locationName = 'Huidige locatie';
      }
    } catch {
      coords = defaultCoords;
      locationName = defaultLocation;
      url = buildUrl(coords.lat, coords.lon);
    }
  };

  resolveCoords().then(startUpdates);
};

const initWidgets = () => {
  document.querySelectorAll("[data-widget='clock']").forEach((widget) => {
    const timeZone = widget.dataset.widgetTz ?? defaultTimeZone;
    updateClockWidget(widget, timeZone);
  });

  document.querySelectorAll("[data-widget='weather']").forEach((widget) => {
    initWeatherWidget(widget);
  });
};

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidgets);
  } else {
    initWidgets();
  }
}

export {
  defaultTimeZone,
  weatherRefreshMs,
  clockRefreshMs,
  defaultCoords,
  defaultLocation,
  weatherCodeMap,
  formatTimeParts,
  formatShortTime,
  getHourlyIndex,
  getWeatherSummary,
  getLocationName,
  setRotation,
  getBrowserCoords,
  buildReverseGeocodeUrl,
  updateClockWidget,
  initWeatherWidget,
  initWidgets,
};
