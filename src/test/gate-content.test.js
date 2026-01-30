import { describe, expect, it, vi } from 'vitest';

const createWindow = () => ({
  location: {
    replace: vi.fn(),
  },
});

const setupGateContent = async ({ configReady = true, apps = [] } = {}) => {
  vi.resetModules();

  vi.doMock('https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js', () => {
    return {
      initializeApp: vi.fn(() => ({ app: true })),
      getApps: vi.fn(() => apps),
    };
  });

  vi.doMock('https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js', () => {
    return {
      getAuth: vi.fn(() => ({ auth: true })),
      onAuthStateChanged: vi.fn(),
    };
  });

  vi.doMock('/assets/js/login/firebase-config.js', () => {
    return {
      firebaseConfig: { apiKey: 'test' },
      isFirebaseConfigReady: vi.fn(() => configReady),
    };
  });

  vi.doMock('../assets/js/login/gate-bootstrap.js', () => {
    return {
      initAuthGate: vi.fn(),
    };
  });

  await import('../assets/js/login/gate-content.js');

  const firebaseApp = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js');
  const firebaseAuth = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js');
  const gateBootstrap = await import('../assets/js/login/gate-bootstrap.js');
  const firebaseConfig = await import('/assets/js/login/firebase-config.js');

  return {
    firebaseApp,
    firebaseAuth,
    gateBootstrap,
    firebaseConfig,
  };
};

describe('gate-content', () => {
  it('initializes the auth gate with firebase auth', async () => {
    const originalWindow = globalThis.window;
    globalThis.window = createWindow();

    const { firebaseAuth, gateBootstrap, firebaseApp } = await setupGateContent();

    expect(firebaseApp.getApps).toHaveBeenCalled();
    expect(firebaseAuth.getAuth).toHaveBeenCalledWith({ app: true });
    expect(gateBootstrap.initAuthGate).toHaveBeenCalledTimes(1);

    const [{ onAuthStateChanged }] = gateBootstrap.initAuthGate.mock.calls[0];
    const callback = vi.fn();

    onAuthStateChanged(callback);

    expect(firebaseAuth.onAuthStateChanged).toHaveBeenCalledWith({ auth: true }, callback);

    globalThis.window = originalWindow;
  });

  it('redirects when firebase config is missing', async () => {
    const originalWindow = globalThis.window;
    const windowStub = createWindow();
    globalThis.window = windowStub;

    const { firebaseConfig } = await setupGateContent({ configReady: false });

    expect(firebaseConfig.isFirebaseConfigReady).toHaveBeenCalled();
    expect(windowStub.location.replace).toHaveBeenCalledWith('/500/');

    globalThis.window = originalWindow;
  });

  it('uses the existing firebase app when available', async () => {
    const originalWindow = globalThis.window;
    globalThis.window = createWindow();

    const existingApp = { app: true };
    const { firebaseApp, firebaseAuth } = await setupGateContent({ apps: [existingApp] });

    expect(firebaseApp.initializeApp).not.toHaveBeenCalled();
    expect(firebaseAuth.getAuth).toHaveBeenCalledWith(existingApp);

    globalThis.window = originalWindow;
  });
});
