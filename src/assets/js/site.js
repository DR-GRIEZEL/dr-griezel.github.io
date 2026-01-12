(() => {
  const body = document.body;
  const sidebar = document.getElementById('sidebar');
  const toggle = document.querySelector('.sidebar-toggle');
  const storageKey = 'sidebar-collapsed';
  const smallScreen = window.matchMedia('(max-width: 900px)');

  const storage = (() => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  })();

  const readStorage = () => {
    if (!storage) return null;
    try {
      return storage.getItem(storageKey);
    } catch {
      return null;
    }
  };

  const writeStorage = (value) => {
    if (!storage) return;
    try {
      storage.setItem(storageKey, value);
    } catch {
      // ignore write failures (e.g. privacy mode)
    }
  };

  const applyState = (collapsed) => {
    body.classList.toggle('sidebar-collapsed', collapsed);
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(!collapsed));
    }
  };

  const getInitialState = () => {
    const stored = readStorage();
    if (stored !== null) {
      return stored === 'true';
    }
    return smallScreen.matches;
  };

  applyState(getInitialState());

  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      const collapsed = !body.classList.contains('sidebar-collapsed');
      writeStorage(String(collapsed));
      applyState(collapsed);
    });
  }

  const handleSmallScreenChange = (event) => {
    const stored = readStorage();
    if (stored === null) {
      applyState(event.matches);
    }
  };

  if (typeof smallScreen.addEventListener === 'function') {
    smallScreen.addEventListener('change', handleSmallScreenChange);
  } else if (typeof smallScreen.addListener === 'function') {
    smallScreen.addListener(handleSmallScreenChange);
  }

  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  const blockInspect = (event) => {
    const key = event.key.toLowerCase();
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;
    if (
      key === 'f12' ||
      (ctrlOrCmd && event.shiftKey && ['i', 'j', 'c'].includes(key)) ||
      (ctrlOrCmd && key === 'u')
    ) {
      event.preventDefault();
    }
  };

  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });
  document.addEventListener('keydown', blockInspect);
})();
