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

// === layout containers ===
const wrap = dv.el("div", "", { cls: "dv-dashboard" });

// === Klok ===

const clock = dv.el("div", "", { cls: "fancy-clock" }, wrap);
function tick(){ 
  clock.textContent = new Date().toLocaleString("nl-BE",{timeZone:tz, hour12:false}); 
}
tick();
window.__dvTimers.clock = setInterval(() => {
  if (!clock?.isConnected || (clock.checkVisibility && !clock.checkVisibility())) { clearInterval(window.__dvTimers.clock); return; }
  tick();
}, clockRefreshMs);

// === Weer ===

// const box = dv.el("div","Weer laden...");
// box.className = "wxbox";
const wx = dv.el("div", "Weer laden...", { cls: "wxbox" }, wrap);

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
    wx.innerHTML = `${wmap[c.weather_code] ?? "Weer"} 🌡️ ${c.temperature_2m}°C (${c.apparent_temperature}°C) 💨 ${c.wind_speed_10m} km/u ☔ ${c.precipitation} mm`;
  } catch(e) {
    wx.textContent="Weer: fout bij ophalen."; 
  }
}
await draw();
window.__dvTimers.weather = setInterval(() => {
  if (!wx?.isConnected || (wx.checkVisibility && !wx.checkVisibility())) { clearInterval(window.__dvTimers.weather); return; }
  draw();
}, weatherRefreshMs);
