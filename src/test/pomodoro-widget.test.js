import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const buildAudioContext = () =>
  class AudioContext {
    constructor() {
      this.currentTime = 0;
      this.destination = {};
    }

    createOscillator() {
      return {
        type: '',
        frequency: { value: 0 },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      };
    }

    createGain() {
      return {
        connect: vi.fn(),
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
      };
    }
  };

const buildWidget = () => {
  const timerEl = { textContent: '' };
  const subEl = { textContent: '' };
  const barIn = { style: { width: '' } };

  const createButton = () => {
    const handlers = {};
    return {
      handlers,
      disabled: false,
      addEventListener: (event, handler) => {
        handlers[event] = handler;
      },
    };
  };

  const bStart = createButton();
  const bPause = createButton();
  const bBreak = createButton();
  const bReset = createButton();

  const elements = new Map([
    ['[data-pomo-time]', timerEl],
    ['[data-pomo-state]', subEl],
    ['[data-pomo-bar]', barIn],
    ['[data-pomo-start]', bStart],
    ['[data-pomo-pause]', bPause],
    ['[data-pomo-break]', bBreak],
    ['[data-pomo-reset]', bReset],
  ]);

  const widget = {
    dataset: { pomoId: 'alpha' },
    isConnected: true,
    querySelector: (selector) => elements.get(selector) ?? null,
  };

  return { widget, timerEl, subEl, barIn, bStart, bPause, bBreak, bReset };
};

describe('pomodoro widget bootstrap', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('initializes widget UI from default state', async () => {
    const { widget, timerEl, subEl, barIn, bStart, bPause } = buildWidget();

    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    });
    vi.stubGlobal('location', { pathname: '/dashboard' });
    vi.stubGlobal('document', {
      readyState: 'complete',
      querySelectorAll: () => [widget],
    });

    await import('../assets/js/widgets/pomodoro.js');

    expect(timerEl.textContent).toBe('00:00');
    expect(subEl.textContent).toBe('off • paused');
    expect(barIn.style.width).toBe('100%');
    expect(bStart.disabled).toBe(false);
    expect(bPause.disabled).toBe(true);
  });

  it('returns early when widget elements are missing', async () => {
    const widget = {
      dataset: { pomoId: 'alpha' },
      isConnected: true,
      querySelector: () => null,
    };

    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    });
    vi.stubGlobal('location', { pathname: '/dashboard' });
    vi.stubGlobal('document', {
      readyState: 'complete',
      querySelectorAll: () => [widget],
    });

    await import('../assets/js/widgets/pomodoro.js');

    expect(widget.isConnected).toBe(true);
  });

  it('starts a focus cycle when start is clicked', async () => {
    const { widget, timerEl, subEl, bStart, bPause } = buildWidget();

    const localStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    };

    vi.stubGlobal('localStorage', localStorage);
    vi.stubGlobal('location', { pathname: '/dashboard' });
    vi.stubGlobal('document', {
      readyState: 'complete',
      querySelectorAll: () => [widget],
    });

    await import('../assets/js/widgets/pomodoro.js');

    bStart.handlers.click();

    expect(timerEl.textContent).toBe('25:00');
    expect(subEl.textContent).toBe('cycle 1/4 • active');
    expect(bStart.disabled).toBe(true);
    expect(bPause.disabled).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'pomo::/dashboard::alpha',
      expect.any(String),
    );
  });

  it('resets invalid persisted state', async () => {
    const { widget, timerEl } = buildWidget();

    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => '{not-json'),
      setItem: vi.fn(),
    });
    vi.stubGlobal('location', { pathname: '/dashboard' });
    vi.stubGlobal('document', {
      readyState: 'complete',
      querySelectorAll: () => [widget],
    });

    await import('../assets/js/widgets/pomodoro.js');

    expect(timerEl.textContent).toBe('00:00');
  });

  it('supports break, pause, and reset actions', async () => {
    const { widget, timerEl, subEl, bStart, bPause, bBreak, bReset } = buildWidget();

    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    });
    vi.stubGlobal('location', { pathname: '/dashboard' });
    vi.stubGlobal('document', {
      readyState: 'complete',
      querySelectorAll: () => [widget],
    });

    await import('../assets/js/widgets/pomodoro.js');

    bBreak.handlers.click();
    expect(timerEl.textContent).toBe('05:00');
    expect(subEl.textContent).toBe('break • active');
    expect(bStart.disabled).toBe(true);
    expect(bPause.disabled).toBe(false);

    bPause.handlers.click();
    expect(subEl.textContent).toBe('break • paused');
    expect(bStart.disabled).toBe(false);
    expect(bPause.disabled).toBe(false);

    bPause.handlers.click();
    expect(subEl.textContent).toBe('break • active');
    expect(bStart.disabled).toBe(true);
    expect(bPause.disabled).toBe(false);

    bReset.handlers.click();
    expect(timerEl.textContent).toBe('00:00');
    expect(subEl.textContent).toBe('off • paused');
  });

  it('pauses and resumes without resetting the timer', async () => {
    const { widget, timerEl, subEl, bStart, bPause } = buildWidget();

    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    });
    vi.stubGlobal('location', { pathname: '/dashboard' });
    vi.stubGlobal('document', {
      readyState: 'complete',
      querySelectorAll: () => [widget],
    });

    await import('../assets/js/widgets/pomodoro.js');

    bStart.handlers.click();
    vi.advanceTimersByTime(2000);

    expect(timerEl.textContent).toBe('24:58');

    bPause.handlers.click();
    expect(subEl.textContent).toBe('cycle 1/4 • paused');

    vi.advanceTimersByTime(3000);
    expect(timerEl.textContent).toBe('24:58');

    bPause.handlers.click();
    expect(subEl.textContent).toBe('cycle 1/4 • active');

    vi.advanceTimersByTime(2000);
    expect(timerEl.textContent).toBe('24:56');
  });

  it('resets stale state at midnight', async () => {
    const { widget, timerEl, subEl } = buildWidget();

    vi.setSystemTime(new Date('2024-01-02T00:00:00Z'));

    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() =>
        JSON.stringify({
          mode: 'focus',
          remaining: 120,
          running: true,
          cycle: 2,
          lastDay: '2024-01-01',
        }),
      ),
      setItem: vi.fn(),
    });
    vi.stubGlobal('location', { pathname: '/dashboard' });
    vi.stubGlobal('document', {
      readyState: 'complete',
      querySelectorAll: () => [widget],
    });

    await import('../assets/js/widgets/pomodoro.js');

    expect(timerEl.textContent).toBe('00:00');
    expect(subEl.textContent).toBe('off • paused');
  });

  it('runs focus and break cycles through completion', async () => {
    const { widget, subEl, bStart } = buildWidget();

    const NotificationMock = vi.fn();
    NotificationMock.permission = 'granted';
    NotificationMock.requestPermission = vi.fn();

    const AudioContextMock = buildAudioContext();

    vi.stubGlobal('Notification', NotificationMock);
    vi.stubGlobal('window', { AudioContext: AudioContextMock, Notification: NotificationMock });
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    });
    vi.stubGlobal('location', { pathname: '/dashboard' });
    vi.stubGlobal('document', {
      readyState: 'complete',
      querySelectorAll: () => [widget],
    });

    await import('../assets/js/widgets/pomodoro.js');

    bStart.handlers.click();
    vi.advanceTimersByTime(25 * 60 * 1000);

    expect(subEl.textContent).toBe('break • active');

    vi.advanceTimersByTime(5 * 60 * 1000);

    expect(subEl.textContent).toBe('off • paused');
    expect(NotificationMock).toHaveBeenCalled();
  });

  it('requests notification permission when not granted', async () => {
    const { widget, bStart } = buildWidget();

    const NotificationMock = vi.fn();
    NotificationMock.permission = 'default';
    NotificationMock.requestPermission = vi.fn();

    vi.stubGlobal('Notification', NotificationMock);
    vi.stubGlobal('window', { AudioContext: buildAudioContext(), Notification: NotificationMock });
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    });
    vi.stubGlobal('location', { pathname: '/dashboard' });
    vi.stubGlobal('document', {
      readyState: 'complete',
      querySelectorAll: () => [widget],
    });

    await import('../assets/js/widgets/pomodoro.js');

    bStart.handlers.click();
    vi.advanceTimersByTime(25 * 60 * 1000);

    expect(NotificationMock.requestPermission).toHaveBeenCalled();
  });

  it('clears the interval when a widget disconnects', async () => {
    const { widget, bStart } = buildWidget();

    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    });
    vi.stubGlobal('location', { pathname: '/dashboard' });
    vi.stubGlobal('document', {
      readyState: 'complete',
      querySelectorAll: () => [widget],
    });

    await import('../assets/js/widgets/pomodoro.js');

    bStart.handlers.click();
    widget.isConnected = false;
    vi.advanceTimersByTime(1000);

    expect(widget.isConnected).toBe(false);
  });

  it('defers pomodoro widget boot when the DOM is loading', async () => {
    vi.resetModules();
    const addEventListener = vi.fn();
    vi.stubGlobal('document', {
      readyState: 'loading',
      addEventListener,
    });

    await import('../assets/js/widgets/pomodoro.js');

    expect(addEventListener).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));
    vi.unstubAllGlobals();
  });
});
