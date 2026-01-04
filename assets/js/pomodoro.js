const timerEl = document.getElementById("pomo-time");
const subEl = document.getElementById("pomo-state");
const barIn = document.getElementById("pomo-bar");
const bStart = document.getElementById("pomo-start");
const bPause = document.getElementById("pomo-pause");
const bBreak = document.getElementById("pomo-break");
const bReset = document.getElementById("pomo-reset");

if (!timerEl || !subEl || !barIn || !bStart || !bPause || !bBreak || !bReset) {
  throw new Error("Pomodoro widget: missing DOM elements.");
}

/***** CONFIG *****/
const CFG = { focus: 25 * 60, break: 5 * 60, off: 0, cycles: 4 };
const KEY = `pomo::${location.pathname}`;
const AUTO_START_BREAK = true;
const AUTO_START_FOCUS = false;

/***** STATE *****/
const todayStr = new Date().toISOString().slice(0, 10);
let state = null;
try {
  state = JSON.parse(localStorage.getItem(KEY));
} catch (_) {
  state = null;
}
if (!state) state = { mode: "off", remaining: 0, running: false, cycle: 1, lastDay: todayStr };

function midnightResetIfNeeded() {
  const nowStr = new Date().toISOString().slice(0, 10);
  if (state.lastDay !== nowStr) {
    state.lastDay = nowStr;
    state.cycle = 1;
    state.mode = "off";
    state.running = false;
    state.remaining = 0;
  }
}
midnightResetIfNeeded();

/***** LOGICA *****/
let iv = null;
function ensureInterval() {
  if (!iv) {
    iv = setInterval(() => {
      if (!document.body.contains(timerEl)) {
        clearInterval(iv);
        iv = null;
        return;
      }
      tick();
    }, 1000);
  }
}

function fmt(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = String(Math.floor(s / 60)).padStart(2, "0");
  const r = String(s % 60).padStart(2, "0");
  return `${m}:${r}`;
}
function capFor(mode) {
  return mode === "break" ? CFG.break : CFG.focus;
}
function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function render() {
  midnightResetIfNeeded();

  timerEl.textContent = fmt(state.remaining);
  let label = "uit";
  if (state.mode === "break") label = "pauze";
  else if (state.mode === "focus") label = `cyclus ${state.cycle}/${CFG.cycles}`;
  subEl.textContent = `${label} ${state.running ? "• actief" : "• gepauzeerd"}`;

  const cap = capFor(state.mode);
  barIn.style.width = cap > 0 ? `${100 * (1 - state.remaining / cap)}%` : "0%";

  bStart.disabled = state.running || (state.mode !== "off" && state.remaining === 0);
  bPause.disabled = !state.running;
}

function tick() {
  if (!state.running) return;
  state.remaining -= 1;

  if (state.remaining <= 0) {
    state.remaining = 0;
    state.running = false;

    if (state.mode === "focus") {
      state.mode = "break";
      state.remaining = CFG.break;
      state.running = !!AUTO_START_BREAK;
      chime("🎉 Focus klaar!", `Start (${Math.round(CFG.break / 60)} min. pauze...)`);
    } else if (state.mode === "break") {
      if (state.cycle < CFG.cycles) state.cycle += 1;
      state.mode = "off";
      state.remaining = 0;
      state.running = !!AUTO_START_FOCUS;
      chime("⏰ Pauze voltooid!", `Cyclus ${state.cycle}/${CFG.cycles}`);
    }
  }
  render();
  save();
}

function start() {
  if (state.mode === "off") {
    state.mode = "focus";
    state.remaining = CFG.focus;
  }
  if (state.running || state.remaining === 0) return;
  state.running = true;
  render();
  save();
  ensureInterval();
}
function pause() {
  state.running = false;
  render();
  save();
}
function startBreak() {
  state.mode = "break";
  state.remaining = CFG.break;
  state.running = true;
  render();
  save();
  ensureInterval();
}
function reset() {
  state.mode = "off";
  state.remaining = 0;
  state.running = false;
  render();
  save();
}

bStart.addEventListener("click", start);
bPause.addEventListener("click", pause);
bBreak.addEventListener("click", startBreak);
bReset.addEventListener("click", reset);

function chime(title = "Timer", body = "") {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
    o.start();
    o.stop(ctx.currentTime + 0.35);
  } catch (_) {
    // ignore
  }
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body });
  } else if ("Notification" in window && Notification.permission !== "denied") {
    Notification.requestPermission();
  }
}

render();
