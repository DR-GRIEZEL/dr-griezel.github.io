// === settings ===

const tz="Europe/Brussels";
const weatherRefreshMs = 5*60*1000;
const clockRefreshMs = 1000; // 1 sec
const lat = 50.792161, lon = 3.746323; // Opbrakel

// === timer housekeeping (voorkomt dubbele intervals) ===
const defaultTimers = globalThis.__dvTimers ??= {};
for (const k of ["clock", "weather"]) {
  if (defaultTimers[k]) {
    clearInterval(defaultTimers[k]); 
	defaultTimers[k] = undefined;
  }
}

const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability&timezone=Europe%2FBrussels`;
const wmap = {
  0:"☀️ Helder", 1:"🌤️ Overwegend helder", 2:"⛅ Deels bewolkt", 3:"☁️ Bewolkt",
  45:"🌫️ Mist", 48:"🌫️ Mist", 51:"🌦️ Motregen (licht)", 53:"🌧️ Motregen", 55:"🌧️ Motregen (zwaar)",
  61:"🌦️ Regen (licht)", 63:"🌧️ Regen", 65:"🌧️ Regen (zwaar)",
  71:"🌨️ Sneeuw (licht)", 73:"🌨️ Sneeuw", 75:"❄️ Sneeuw (zwaar)", 80:"🌦️ Buien (licht)", 81:"🌧️ Buien", 82:"⛈️ Buien (zwaar)",
  95:"⛈️ Onweer", 96:"⛈️ Onweer (hagel)", 99:"⛈️ Onweer (zware hagel)"
};

export function initHero(options = {}) {
  const {
    clockEl = document.getElementById("clock"),
    wxTempEl = document.getElementById("wx-temp"),
    wxDescEl = document.getElementById("wx-desc"),
    wxLocationEl = document.getElementById("wx-location"),
    wxUpdatedEl = document.getElementById("wx-updated"),
    fetchFn = fetch,
    nowFn = () => new Date(),
    setIntervalFn = setInterval,
    clearIntervalFn = clearInterval,
    clockIntervalMs = clockRefreshMs,
    weatherIntervalMs = weatherRefreshMs,
    locationLabel = "Opbrakel",
    timers = defaultTimers,
  } = options;

  if (!clockEl && !wxTempEl && !wxDescEl && !wxLocationEl && !wxUpdatedEl) {
    return { stop: () => {} };
  }

  function tick(){ 
    if (!clockEl) return;
    const now = nowFn();
    clockEl.textContent = now.toLocaleTimeString("nl-BE", { timeZone: tz, hour12:false }); 
  }

  if (clockEl) {
    tick();
    timers.clock = setIntervalFn(() => {
      if (!clockEl?.isConnected || (clockEl.checkVisibility && !clockEl.checkVisibility())) { clearIntervalFn(timers.clock); return; }
      tick();
    }, clockIntervalMs);
  }

  async function draw(){
    try{
      const res = await fetchFn(url); 
	  if(!res.ok) throw new Error(res.status);
      const data = await res.json(), c=data.current;
      if (wxTempEl) wxTempEl.textContent = `${c.temperature_2m}°`;
      if (wxDescEl) wxDescEl.textContent = wmap[c.weather_code] ?? "Weer";
      if (wxLocationEl) wxLocationEl.textContent = locationLabel;
      if (wxUpdatedEl) {
        const now = nowFn();
        wxUpdatedEl.dateTime = now.toISOString();
        wxUpdatedEl.textContent = now.toLocaleTimeString("nl-BE", { timeZone: tz, hour12:false, hour: "2-digit", minute: "2-digit" });
      }
    } catch(e) {
      if (wxDescEl) wxDescEl.textContent = "Weer: fout bij ophalen.";
    }
  }

  if (wxTempEl || wxDescEl || wxLocationEl || wxUpdatedEl) {
    void draw();
    timers.weather = setIntervalFn(() => {
      const anyEl = wxTempEl ?? wxDescEl ?? wxLocationEl ?? wxUpdatedEl;
      if (!document.body.contains(anyEl)){ clearIntervalFn(timers.weather); return; }
      draw();
    }, weatherIntervalMs);
  }

  return {
    stop: () => {
      if (timers.clock) clearIntervalFn(timers.clock);
      if (timers.weather) clearIntervalFn(timers.weather);
    },
  };
}

function autoInit() {
  if (globalThis.__DASHBOARD_AUTO_INIT__ === false) return;
  initHero();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoInit, { once: true });
} else {
  autoInit();
}
