const defaultRedirect = (destination) => {
  if (typeof window === 'undefined' || !window.location) return;
  window.location.replace(destination);
};

export const DEFAULT_PROTECTED_SELECTOR = '[data-requires-auth]';
export const DEFAULT_REDIRECT_PATH = '/500/';

export const mountAuthGate = ({
  document: doc = typeof document !== 'undefined' ? document : null,
  onAuthStateChanged,
  redirect = defaultRedirect,
  selector = DEFAULT_PROTECTED_SELECTOR,
} = {}) => {
  if (!onAuthStateChanged) {
    return { protectedEl: null };
  }

  const protectedEl = doc?.querySelector(selector) ?? null;
  if (protectedEl) {
    protectedEl.hidden = true;
  }

  onAuthStateChanged((user) => {
    const ok = Boolean(user);
    if (protectedEl) {
      protectedEl.hidden = !ok;
    }
    if (!ok) {
      redirect(DEFAULT_REDIRECT_PATH);
    }
  });

  return { protectedEl };
};
