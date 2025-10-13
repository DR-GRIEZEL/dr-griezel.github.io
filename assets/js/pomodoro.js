
/***** CSS *****/
const root = dv.el("div",""); root.className = "pomo-widget";
const timerEl = document.createElement("div"); timerEl.className = "pomo-timer";
const subEl   = document.createElement("div"); subEl.className   = "pomo-sub";
const bar     = document.createElement("div"); bar.className     = "pomo-progress";
const barIn   = document.createElement("div"); barIn.className   = "pomo-progress-bar";
bar.appendChild(barIn);
const btns    = document.createElement("div"); btns.className    = "pomobar";

/***** CONFIG *****/
const CFG = { focus: 25*60, break: 5*60, off: 0, cycles: 4 };
const KEY = "pomo::" + dv.current().file.path;
const AUTO_START_BREAK = true;     // meteen break starten na focus
const AUTO_START_FOCUS = false;    // na break wacht je op Start

/***** STATE *****/
const todayStr = new Date().toISOString().slice(0,10); // YYYY-MM-DD
let state = null;
try { state = JSON.parse(localStorage.getItem(KEY)); } catch(_) {}
if (!state) state = { mode:"off", remaining:0, running:false, cycle:1, lastDay: todayStr };

/***** MIDNIGHT RESET *****/
function midnightResetIfNeeded() {
  const nowStr = new Date().toISOString().slice(0,10);
  if (state.lastDay !== nowStr) {
    state.lastDay = nowStr;
	state.cycle = 1;
	state.mode = "off";
	state.running = false;
	state.remaining = 0;
  }
}
midnightResetIfNeeded();

/***** Buttons *****/
function mkBtn(label, fn, title){
  const b = document.createElement("button");
  b.className = "pomo-btn"; b.textContent = label; b.onclick = fn;
  if (title){ b.title = title; b.setAttribute("aria-label", title); }
  return b;
}
const bStart = mkBtn("▶",  ()=> start());
const bPause = mkBtn("⏸",  ()=> pause());
const bReset = mkBtn("↺",  ()=> reset());
btns.append(bStart,bPause,bReset);

root.append(timerEl, subEl, bar, btns);

/***** LOGICA *****/
let iv = null;

function fmt(sec){
  const s = Math.max(0, Math.floor(sec));
  const m = String(Math.floor(s/60)).padStart(2,"0");
  const r = String(s%60).padStart(2,"0");
  return `${m}:${r}`;
}
function capFor(mode){ return mode==="break" ? CFG.break : CFG.focus; }
function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }

function render(){
  midnightResetIfNeeded();

  // Tekst
  timerEl.textContent = fmt(state.remaining);
  let label;
  // if (state.mode === "off") label = "uit";
  if (state.mode === "break") label = "pauze";
  else label = `cyclus ${state.cycle}/${CFG.cycles}`;
  subEl.textContent = `${label} ${state.running?"• actief":"• gepauzeerd"}`;

  // Progress
  const cap = capFor(state.mode);
  barIn.style.width = cap > 0 ? `${100*(1 - state.remaining/cap)}%` : "0%";

  // Buttons
  // Start is actief als: niet running EN (remaining>0 of mode=off)
  bStart.disabled = state.running || (state.mode!=="off" && state.remaining===0);
  bPause.disabled = !state.running;
}
function tick(){
  if (!state.running) return;
  state.remaining -= 1;

  if (state.remaining <= 0){
    state.remaining = 0;
	  state.running = false;

    if (state.mode === "focus"){
	  // focus afgerond -> ga naar break
	  state.mode = "break";
	  state.remaining = CFG.break;
	  state.running = !!AUTO_START_BREAK;
	  chime("🎉 Focus klaar!", `Start (${Math.round(CFG.break/60)} min. pauze...)`);
	} else if (state.mode === "break"){
	  // Pauze klaar -> volgende cyclus, terug naar "off"
	  if (state.cycle < CFG.cycles) state.cycle += 1;
	  state.mode = "off";
	  state.remaining = 0;
	  state.running = !!AUTO_START_FOCUS; // meestal false voor 'off'
	  chime("⏰ Pauze voltooid!", `Cyclus ${state.cycle}/${CFG.cycles}`);
    }
  }
  render(); save();
}
function start(){
  // Vanuit OFF initialiseer focus
  if (state.mode === "off") {
    state.mode = "focus";
	state.remaining = CFG.focus;
  }
  if (state.running || state.remaining===0) return;
  state.running = true; render(); save();
  if (!iv){
    iv = setInterval(()=>{
      if (!document.body.contains(root)){ clearInterval(iv); iv=null; return; }
      tick();
    }, 1000);
  }
}
function pause(){ state.running = false; render(); save(); }
function reset(){
  state.mode = "off";
  state.remaining = 0;
  state.running=false;
  render(); save();
}

/* Offline piep + (optioneel) desktopnotificatie */
function chime(title="Timer", body=""){
  try{
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type="sine"; o.frequency.value=880; o.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime+.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+.3);
    o.start(); o.stop(ctx.currentTime+.35);
  }catch(_){}
  if ("Notification" in window && Notification.permission==="granted"){
    new Notification(title, { body });
  } else if ("Notification" in window && Notification.permission!=="denied"){
    Notification.requestPermission();
  }
}
render();
