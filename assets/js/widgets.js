const defaultTimeZone = "Europe/Brussels";
const weatherRefreshMs = 5 * 60 * 1000;
const clockRefreshMs = 1000;
const defaultCoords = { lat: 50.792161, lon: 3.746323 };
const defaultLocation = "Opbrakel";

const weatherCodeMap = {
  0: "☀️ Helder",
  1: "🌤️ Overwegend helder",
  2: "⛅ Deels bewolkt",
  3: "☁️ Bewolkt",
  45: "🌫️ Mist",
  48: "🌫️ Mist",
  51: "🌦️ Motregen (licht)",
  53: "🌧️ Motregen",
  55: "🌧️ Motregen (zwaar)",
  61: "🌦️ Regen (licht)",
  63: "🌧️ Regen",
  65: "🌧️ Regen (zwaar)",
  71: "🌨️ Sneeuw (licht)",
  73: "🌨️ Sneeuw",
  75: "❄️ Sneeuw (zwaar)",
  80: "🌦️ Buien (licht)",
  81: "🌧️ Buien",
  82: "⛈️ Buien (zwaar)",
  95: "⛈️ Onweer",
  96: "⛈️ Onweer (hagel)",
  99: "⛈️ Onweer (zware hagel)"
};

const clockTimers = new WeakMap();
const weatherTimers = new WeakMap();

const numberFormat = new Intl.NumberFormat("nl-BE", { maximumFractionDigits: 0 });

const formatTimeParts = (date, timeZone) => {
  const formatter = new Intl.DateTimeFormat("nl-BE", {
    timeZone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  const parts = formatter.formatToParts(date);
  const map = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return {
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
    timeString: formatter.format(date)
  };
};

const formatShortTime = (date, timeZone) => {
  const formatter = new Intl.DateTimeFormat("nl-BE", {
    timeZone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit"
  });
  return formatter.format(date);
};

const getHourlyIndex = (times, date, timeZone) => {
  if (!Array.isArray(times)) return -1;
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false
  });
  const parts = formatter.formatToParts(date);
  const map = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
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
    description: weatherCodeMap[current.weather_code] ?? "Weer"
  };
};

const setRotation = (el, deg) => {
  if (!el) return;
  el.style.setProperty("--rotation", `${deg}deg`);
};

const updateClockWidget = (widget, timeZone) => {
  const timeEls = widget.querySelectorAll("[data-clock-time]");
  const hourHand = widget.querySelector("[data-clock-hour]");
  const minuteHand = widget.querySelector("[data-clock-minute]");
  const secondHand = widget.querySelector("[data-clock-second]");

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
  const lat = Number(widget.dataset.widgetLat ?? defaultCoords.lat);
  const lon = Number(widget.dataset.widgetLon ?? defaultCoords.lon);
  const location = widget.dataset.widgetLocation ?? defaultLocation;
  const timeZone = widget.dataset.widgetTz ?? defaultTimeZone;
  const refreshMs = Number(widget.dataset.widgetRefresh ?? weatherRefreshMs);

  const tempEl = widget.querySelector("[data-wx-temp]");
  const descEl = widget.querySelector("[data-wx-desc]");
  const locationEl = widget.querySelector("[data-wx-location]");
  const updatedEl = widget.querySelector("[data-wx-updated]");
  const apparentEl = widget.querySelector("[data-wx-apparent]");
  const windEl = widget.querySelector("[data-wx-wind]");
  const windDirEl = widget.querySelector("[data-wx-wind-direction]");
  const precipEl = widget.querySelector("[data-wx-precip]");
  const precipProbEl = widget.querySelector("[data-wx-precip-prob]");
  const humidityEl = widget.querySelector("[data-wx-humidity]");

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m"
  );
  url.searchParams.set("hourly", "precipitation_probability");
  url.searchParams.set("timezone", timeZone);

  const update = async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      const summary = getWeatherSummary(data, timeZone);

      if (tempEl) {
        tempEl.textContent = summary.temperature == null ? "--°" : `${numberFormat.format(summary.temperature)}°`;
      }
      if (descEl) descEl.textContent = summary.description;
      if (locationEl) locationEl.textContent = location;
      if (apparentEl) {
        apparentEl.textContent = summary.apparentTemperature == null ? "—" : `${numberFormat.format(summary.apparentTemperature)}°`;
      }
      if (windEl) {
        windEl.textContent = summary.windSpeed == null ? "—" : `${numberFormat.format(summary.windSpeed)} km/h`;
      }
      if (windDirEl) {
        windDirEl.textContent = summary.windDirection == null ? "—" : `${numberFormat.format(summary.windDirection)}°`;
      }
      if (precipEl) {
        precipEl.textContent = summary.precipitation == null ? "—" : `${numberFormat.format(summary.precipitation)} mm`;
      }
      if (precipProbEl) {
        precipProbEl.textContent = summary.precipitationProbability == null ? "—" : `${numberFormat.format(summary.precipitationProbability)}%`;
      }
      if (humidityEl) {
        humidityEl.textContent = summary.humidity == null ? "—" : `${numberFormat.format(summary.humidity)}%`;
      }
      if (updatedEl) {
        const now = new Date();
        updatedEl.dateTime = now.toISOString();
        updatedEl.textContent = formatShortTime(now, timeZone);
      }
    } catch (error) {
      if (descEl) descEl.textContent = "Weer: fout bij ophalen.";
    }
  };

  update();
  const existingTimer = weatherTimers.get(widget);
  if (existingTimer) clearInterval(existingTimer);
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

const initWidgets = () => {
  document.querySelectorAll("[data-widget='clock']").forEach((widget) => {
    const timeZone = widget.dataset.widgetTz ?? defaultTimeZone;
    updateClockWidget(widget, timeZone);
  });

  document.querySelectorAll("[data-widget='weather']").forEach((widget) => {
    initWeatherWidget(widget);
  });
};

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWidgets);
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
  getWeatherSummary
};
