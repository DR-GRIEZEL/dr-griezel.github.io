import { capFor, defaultConfig, formatDuration } from './pomodoro-core.js';

const AUTO_START_BREAK = true;
const AUTO_START_FOCUS = false;

const initPomodoroWidget = (widget, index) => {
  const timerEl = widget.querySelector('[data-pomo-time]');
  const subEl = widget.querySelector('[data-pomo-state]');
  const barIn = widget.querySelector('[data-pomo-bar]');
  const bStart = widget.querySelector('[data-pomo-start]');
  const bPause = widget.querySelector('[data-pomo-pause]');
  const bBreak = widget.querySelector('[data-pomo-break]');
  const bReset = widget.querySelector('[data-pomo-reset]');

  if (!timerEl || !subEl || !barIn || !bStart || !bPause || !bBreak || !bReset) {
    return;
  }

  const widgetId = widget.dataset.pomoId ?? `widget-${index}`;
  const key = `pomo::${location.pathname}::${widgetId}`;
  const config = { ...defaultConfig };

  const todayStr = new Date().toISOString().slice(0, 10);
  let state = null;
  try {
    state = JSON.parse(localStorage.getItem(key));
  } catch {
    state = null;
  }
  if (!state) state = { mode: 'off', remaining: 0, running: false, cycle: 1, lastDay: todayStr };

  const midnightResetIfNeeded = () => {
    const nowStr = new Date().toISOString().slice(0, 10);
    if (state.lastDay !== nowStr) {
      state.lastDay = nowStr;
      state.cycle = 1;
      state.mode = 'off';
      state.running = false;
      state.remaining = 0;
    }
  };
  midnightResetIfNeeded();

  let intervalId = null;
  const ensureInterval = () => {
    if (!intervalId) {
      intervalId = setInterval(() => {
        if (!widget.isConnected) {
          clearInterval(intervalId);
          intervalId = null;
          return;
        }
        tick();
      }, 1000);
    }
  };

  const save = () => {
    localStorage.setItem(key, JSON.stringify(state));
  };

  const render = () => {
    midnightResetIfNeeded();

    timerEl.textContent = formatDuration(state.remaining);
    let label = 'off';
    if (state.mode === 'break') label = 'break';
    else if (state.mode === 'focus') label = `cycle ${state.cycle}/${config.cycles}`;
    subEl.textContent = `${label} ${state.running ? '• active' : '• paused'}`;

    const cap = capFor(state.mode, config);
    barIn.style.width = cap > 0 ? `${100 * (1 - state.remaining / cap)}%` : '0%';

    bStart.disabled = state.running || (state.mode !== 'off' && state.remaining === 0);
    bPause.disabled = !state.running;
  };

  const tick = () => {
    if (!state.running) return;
    state.remaining -= 1;

    if (state.remaining <= 0) {
      state.remaining = 0;
      state.running = false;

      if (state.mode === 'focus') {
        state.mode = 'break';
        state.remaining = config.break;
        state.running = !!AUTO_START_BREAK;
        chime('🎉 Focus complete!', `Start (${Math.round(config.break / 60)} min. break...)`);
      } else if (state.mode === 'break') {
        if (state.cycle < config.cycles) state.cycle += 1;
        state.mode = 'off';
        state.remaining = 0;
        state.running = !!AUTO_START_FOCUS;
        chime('⏰ Break finished!', `Cycle ${state.cycle}/${config.cycles}`);
      }
    }
    render();
    save();
  };

  const start = () => {
    if (state.mode === 'off') {
      state.mode = 'focus';
      state.remaining = config.focus;
    }
    if (state.running || state.remaining === 0) return;
    state.running = true;
    render();
    save();
    ensureInterval();
  };

  const pause = () => {
    state.running = false;
    render();
    save();
  };

  const startBreak = () => {
    state.mode = 'break';
    state.remaining = config.break;
    state.running = true;
    render();
    save();
    ensureInterval();
  };

  const reset = () => {
    state.mode = 'off';
    state.remaining = 0;
    state.running = false;
    render();
    save();
  };

  bStart.addEventListener('click', start);
  bPause.addEventListener('click', pause);
  bBreak.addEventListener('click', startBreak);
  bReset.addEventListener('click', reset);

  render();
};

const chime = (title = 'Timer', body = '') => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 880;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
    o.start();
    o.stop(ctx.currentTime + 0.35);
  } catch {
    // ignore
  }
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  } else if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
};

const initPomodoroWidgets = () => {
  const widgets = document.querySelectorAll("[data-widget='pomodoro']");
  widgets.forEach((widget, index) => {
    initPomodoroWidget(widget, index);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPomodoroWidgets);
} else {
  initPomodoroWidgets();
}
