// === settings ===

const tz="Europe/Brussels";
const weatherRefreshMs = 5*60*1000;
const clockRefreshMs = 1000; // 1 sec
const lat = 50.792161, lon = 3.746323; // Opbrakel

// === timer housekeeping (voorkomt dubbele intervals) ===
window.__dvTimers ??={};
for (const k of ["clock", "weather"]) {
  if (window.__dvTimers[k]) {
    clearInterval(window.__dvTimers[k]); 
	window.__dvTimers[k] = undefined;
  }
}

const clock = document.getElementById("clock");
const clockTime = document.getElementById("clock-time");
const clockHour = document.getElementById("clock-hour");
const clockMinute = document.getElementById("clock-minute");
const clockSecond = document.getElementById("clock-second");
const wxTemp = document.getElementById("wx-temp");
const wxDesc = document.getElementById("wx-desc");
const wxLocation = document.getElementById("wx-location");
const wxUpdated = document.getElementById("wx-updated");

if (clock) {
  const timeFormatter = new Intl.DateTimeFormat("nl-BE", {
    timeZone: tz,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  const getParts = (date) => {
    const parts = timeFormatter.formatToParts(date);
    const map = Object.fromEntries(parts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value]));
    return {
      hour: Number(map.hour),
      minute: Number(map.minute),
      second: Number(map.second)
    };
  };
  const setRotation = (el, deg) => {
    if (!el) return;
    el.style.setProperty("--rotation", `${deg}deg`);
  };
  function tick(){ 
    const now = new Date();
    const { hour, minute, second } = getParts(now);
    const timeString = timeFormatter.format(now);
    if (clockTime) clockTime.textContent = timeString;
    const hourDeg = ((hour % 12) + minute / 60) * 30;
    const minuteDeg = (minute + second / 60) * 6;
    const secondDeg = second * 6;
    setRotation(clockHour, hourDeg);
    setRotation(clockMinute, minuteDeg);
    setRotation(clockSecond, secondDeg);
  }
  tick();
  window.__dvTimers.clock = setInterval(() => {
    if (!clock?.isConnected || (clock.checkVisibility && !clock.checkVisibility())) { clearInterval(window.__dvTimers.clock); return; }
    tick();
  }, clockRefreshMs);
}

// === Weer ===

// const box = dv.el("div","Weer laden...");
// box.className = "wxbox";
const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability&timezone=Europe%2FBrussels`;
// const res = await fetch(url);
// if (!res.ok) { dv.paragraph("Weer: fout bij ophalen."); return; }
// const data = await res.json();
// const c = data.current;
const wmap = {
  0:"☀️ Helder", 1:"🌤️ Overwegend helder", 2:"⛅ Deels bewolkt", 3:"☁️ Bewolkt",
  45:"🌫️ Mist", 48:"🌫️ Mist", 51:"🌦️ Motregen (licht)", 53:"🌧️ Motregen", 55:"🌧️ Motregen (zwaar)",
  61:"🌦️ Regen (licht)", 63:"🌧️ Regen", 65:"🌧️ Regen (zwaar)",
  71:"🌨️ Sneeuw (licht)", 73:"🌨️ Sneeuw", 75:"❄️ Sneeuw (zwaar)", 80:"🌦️ Buien (licht)", 81:"🌧️ Buien", 82:"⛈️ Buien (zwaar)",
  95:"⛈️ Onweer", 96:"⛈️ Onweer (hagel)", 99:"⛈️ Onweer (zware hagel)"
};
async function draw(){
  try{
    const res = await fetch(url); 
	if(!res.ok) throw new Error(res.status);
    const data = await res.json(), c=data.current;
    if (wxTemp) wxTemp.textContent = `${c.temperature_2m}°`;
    if (wxDesc) wxDesc.textContent = wmap[c.weather_code] ?? "Weer";
    if (wxLocation) wxLocation.textContent = "Opbrakel";
    if (wxUpdated) {
      const now = new Date();
      wxUpdated.dateTime = now.toISOString();
      wxUpdated.textContent = now.toLocaleTimeString("nl-BE", { timeZone: tz, hour12:false, hour: "2-digit", minute: "2-digit" });
    }
  } catch(e) {
    if (wxDesc) wxDesc.textContent = "Weer: fout bij ophalen.";
  }
}
if (wxTemp || wxDesc || wxLocation || wxUpdated) {
  await draw();
  window.__dvTimers.weather = setInterval(() => {
    if (!document.body.contains(wxTemp ?? wxDesc ?? wxLocation ?? wxUpdated)){ clearInterval(window.__dvTimers.weather); return; }
    draw();
  }, weatherRefreshMs);
}
