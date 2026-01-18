import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../assets/js/login/firebase-sdk.js', () => ({
  loadFirebaseSdk: vi.fn(),
}));

vi.mock('../assets/js/login/auth.js', () => ({
  createAuthHandlers: vi.fn(),
}));

vi.mock('../assets/js/login/buttons-init.js', () => ({
  initLoginButtons: vi.fn(),
}));

vi.mock('../assets/js/login/firebase-config.js', () => ({
  firebaseConfig: { apiKey: 'test' },
  isFirebaseConfigReady: vi.fn(),
}));

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const buildElement = () => ({
  textContent: '',
  dataset: {},
  hidden: false,
  classList: { toggle: vi.fn() },
  setAttribute: vi.fn(),
  addEventListener: vi.fn(),
});

const buildLogout = () => {
  const handlers = {};
  return {
    handlers,
    addEventListener: (event, handler) => {
      handlers[event] = handler;
    },
  };
};

describe('login-buttons module', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('shows a status error when config is missing', async () => {
    const { isFirebaseConfigReady } = await import('../assets/js/login/firebase-config.js');
    isFirebaseConfigReady.mockReturnValue(false);

    const statusElement = buildElement();
    const googleButton = buildElement();

    vi.stubGlobal('document', {
      querySelector: (selector) => {
        if (selector === '[data-auth-status]') return statusElement;
        if (selector === '[data-auth-google]') return googleButton;
        return null;
      },
      querySelectorAll: () => [],
    });

    await import('../assets/js/login/login-buttons.js');

    expect(statusElement.textContent).toBe('Login is nog niet geconfigureerd.');
    expect(statusElement.dataset.tone).toBe('error');
  });

  it('boots login buttons when config is ready', async () => {
    const { isFirebaseConfigReady } = await import('../assets/js/login/firebase-config.js');
    const { loadFirebaseSdk } = await import('../assets/js/login/firebase-sdk.js');
    const { createAuthHandlers } = await import('../assets/js/login/auth.js');
    const { initLoginButtons } = await import('../assets/js/login/buttons-init.js');

    isFirebaseConfigReady.mockReturnValue(true);

    const statusElement = buildElement();
    const googleButton = buildElement();
    const githubButton = buildElement();
    const logoutButton = buildLogout();
    const authOnlyEl = buildElement();
    const loggedOutEl = buildElement();
    const userSlot = buildElement();

    const auth = { useDeviceLanguage: vi.fn() };
    const onAuthStateChanged = vi.fn((_auth, callback) => {
      callback({ displayName: 'Ada Lovelace' });
    });
    const signOut = vi.fn();

    const getApps = vi.fn(() => []);
    const initializeApp = vi.fn(() => ({ app: true }));

    loadFirebaseSdk.mockResolvedValue({
      getApps,
      initializeApp,
      getAuth: vi.fn(() => auth),
      GoogleAuthProvider: vi.fn(),
      GithubAuthProvider: vi.fn(),
      signInWithPopup: vi.fn(),
      signInWithRedirect: vi.fn(),
      getRedirectResult: vi.fn(),
      onAuthStateChanged,
      signOut,
    });

    createAuthHandlers.mockReturnValue({
      loginGooglePopup: vi.fn(),
      loginGoogleRedirect: vi.fn(),
      loginGithubPopup: vi.fn(),
      loginGithubRedirect: vi.fn(),
      handleRedirectResult: vi.fn(),
    });

    vi.stubGlobal('document', {
      querySelector: (selector) => {
        if (selector === '[data-auth-status]') return statusElement;
        if (selector === '[data-auth-google]') return googleButton;
        if (selector === '[data-auth-github]') return githubButton;
        if (selector === '[data-auth-logout]') return logoutButton;
        return null;
      },
      querySelectorAll: (selector) => {
        if (selector === '[data-auth-only]') return [authOnlyEl];
        if (selector === '[data-auth-logged-out]') return [loggedOutEl];
        if (selector === '[data-auth-user]') return [userSlot];
        return [];
      },
    });

    await import('../assets/js/login/login-buttons.js');
    await flushPromises();

    expect(loadFirebaseSdk).toHaveBeenCalledTimes(1);
    expect(getApps).toHaveBeenCalledTimes(1);
    expect(initializeApp).toHaveBeenCalledWith({ apiKey: 'test' });
    expect(initLoginButtons).toHaveBeenCalledWith(
      expect.objectContaining({
        googleButton,
        githubButton,
        statusElement,
      }),
    );

    expect(onAuthStateChanged).toHaveBeenCalledWith(auth, expect.any(Function));
    expect(authOnlyEl.hidden).toBe(false);
    expect(loggedOutEl.hidden).toBe(true);
    expect(userSlot.textContent).toBe('Ada Lovelace');

    logoutButton.handlers.click();
    expect(signOut).toHaveBeenCalledWith(auth);
  });

  it('reports sdk load failures', async () => {
    const { isFirebaseConfigReady } = await import('../assets/js/login/firebase-config.js');
    const { loadFirebaseSdk } = await import('../assets/js/login/firebase-sdk.js');

    isFirebaseConfigReady.mockReturnValue(true);
    loadFirebaseSdk.mockRejectedValue(new Error('boom'));

    const statusElement = buildElement();
    const googleButton = buildElement();

    vi.stubGlobal('document', {
      querySelector: (selector) => {
        if (selector === '[data-auth-status]') return statusElement;
        if (selector === '[data-auth-google]') return googleButton;
        return null;
      },
      querySelectorAll: () => [],
    });

    await import('../assets/js/login/login-buttons.js');
    await flushPromises();

    expect(statusElement.textContent).toBe('Login kan niet geladen worden.');
    expect(statusElement.dataset.tone).toBe('error');
  });
});
