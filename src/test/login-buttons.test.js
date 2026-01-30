import { describe, expect, it, vi } from 'vitest';

import { initLoginButtons } from '../assets/js/login/buttons-init.js';

describe('initLoginButtons', () => {
  const createButton = () => {
    const handlers = {};
    return {
      handlers,
      addEventListener: (event, handler) => {
        handlers[event] = handler;
      },
    };
  };

  const createStatus = () => ({
    textContent: '',
    dataset: {},
  });

  it('throws when required inputs are missing', () => {
    expect(() => initLoginButtons({})).toThrow(
      'login elements are required; disable login if not used.',
    );
    expect(() =>
      initLoginButtons({
        googleButton: createButton(),
        githubButton: createButton(),
        statusElement: createStatus(),
      }),
    ).toThrow('login handlers are required; disable google login if not used.');
  });

  it('throws when github handlers are missing for a github button', () => {
    expect(() =>
      initLoginButtons({
        googleButton: createButton(),
        githubButton: createButton(),
        statusElement: createStatus(),
        loginGooglePopup: vi.fn().mockResolvedValue(null),
        loginGoogleRedirect: vi.fn().mockResolvedValue(undefined),
        handleRedirectResult: vi.fn().mockResolvedValue(undefined),
      }),
    ).toThrow('github handlers are required; disable github login if not used.');
  });

  it('allows initializing without github button', () => {
    const googleButton = createButton();
    const statusElement = createStatus();

    expect(() =>
      initLoginButtons({
        googleButton,
        statusElement,
        loginGooglePopup: vi.fn().mockResolvedValue(null),
        loginGoogleRedirect: vi.fn().mockResolvedValue(undefined),
        handleRedirectResult: vi.fn().mockResolvedValue(undefined),
      }),
    ).not.toThrow();
  });

  it('updates status on google popup success', async () => {
    const googleButton = createButton();
    const githubButton = createButton();
    const statusElement = createStatus();

    initLoginButtons({
      googleButton,
      githubButton,
      statusElement,
      loginGooglePopup: vi.fn().mockResolvedValue({ displayName: 'Test User' }),
      loginGoogleRedirect: vi.fn().mockResolvedValue(undefined),
      loginGithubPopup: vi.fn().mockResolvedValue(null),
      loginGithubRedirect: vi.fn().mockResolvedValue(undefined),
      handleRedirectResult: vi.fn().mockResolvedValue(undefined),
      isEmbeddedBrowser: () => false,
    });

    await googleButton.handlers.click();

    expect(statusElement.textContent).toBe('');
    expect(statusElement.dataset.tone).toBe('success');
  });

  it('falls back to redirect for embedded browsers', async () => {
    const googleButton = createButton();
    const githubButton = createButton();
    const statusElement = createStatus();
    const loginGoogleRedirect = vi.fn().mockResolvedValue(undefined);

    initLoginButtons({
      googleButton,
      githubButton,
      statusElement,
      loginGooglePopup: vi.fn().mockResolvedValue(null),
      loginGoogleRedirect,
      loginGithubPopup: vi.fn().mockResolvedValue(null),
      loginGithubRedirect: vi.fn().mockResolvedValue(undefined),
      handleRedirectResult: vi.fn().mockResolvedValue(undefined),
      isEmbeddedBrowser: () => true,
    });

    await googleButton.handlers.click();

    expect(loginGoogleRedirect).toHaveBeenCalled();
    expect(statusElement.textContent).toBe('Google logging in...');
    expect(statusElement.dataset.tone).toBe('pending');
  });

  it('uses the default embedded browser detection', async () => {
    const googleButton = createButton();
    const githubButton = createButton();
    const statusElement = createStatus();
    const loginGoogleRedirect = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal('navigator', { userAgent: 'Instagram' });
    vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });

    initLoginButtons({
      googleButton,
      githubButton,
      statusElement,
      loginGooglePopup: vi.fn().mockResolvedValue(null),
      loginGoogleRedirect,
      loginGithubPopup: vi.fn().mockResolvedValue(null),
      loginGithubRedirect: vi.fn().mockResolvedValue(undefined),
      handleRedirectResult: vi.fn().mockResolvedValue(undefined),
    });

    await googleButton.handlers.click();

    expect(loginGoogleRedirect).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('treats standalone display mode as embedded', async () => {
    const googleButton = createButton();
    const githubButton = createButton();
    const statusElement = createStatus();
    const loginGoogleRedirect = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal('navigator', { userAgent: '' });
    vi.stubGlobal('window', { matchMedia: () => ({ matches: true }) });

    initLoginButtons({
      googleButton,
      githubButton,
      statusElement,
      loginGooglePopup: vi.fn().mockResolvedValue(null),
      loginGoogleRedirect,
      loginGithubPopup: vi.fn().mockResolvedValue(null),
      loginGithubRedirect: vi.fn().mockResolvedValue(undefined),
      handleRedirectResult: vi.fn().mockResolvedValue(undefined),
    });

    await googleButton.handlers.click();

    expect(loginGoogleRedirect).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('treats missing navigator info as non-embedded', async () => {
    const googleButton = createButton();
    const githubButton = createButton();
    const statusElement = createStatus();
    const loginGooglePopup = vi.fn().mockResolvedValue(null);

    delete globalThis.navigator;

    initLoginButtons({
      googleButton,
      githubButton,
      statusElement,
      loginGooglePopup,
      loginGoogleRedirect: vi.fn().mockResolvedValue(undefined),
      loginGithubPopup: vi.fn().mockResolvedValue(null),
      loginGithubRedirect: vi.fn().mockResolvedValue(undefined),
      handleRedirectResult: vi.fn().mockResolvedValue(undefined),
    });

    await googleButton.handlers.click();

    expect(loginGooglePopup).toHaveBeenCalled();
  });

  it('falls back to redirect on popup errors', async () => {
    const googleButton = createButton();
    const githubButton = createButton();
    const statusElement = createStatus();
    const loginGoogleRedirect = vi.fn().mockResolvedValue(undefined);

    initLoginButtons({
      googleButton,
      githubButton,
      statusElement,
      loginGooglePopup: vi.fn().mockRejectedValue({ code: 'auth/popup-blocked' }),
      loginGoogleRedirect,
      loginGithubPopup: vi.fn().mockResolvedValue(null),
      loginGithubRedirect: vi.fn().mockResolvedValue(undefined),
      handleRedirectResult: vi.fn().mockResolvedValue(undefined),
      isEmbeddedBrowser: () => false,
    });

    await googleButton.handlers.click();

    expect(loginGoogleRedirect).toHaveBeenCalled();
    expect(statusElement.textContent).toBe('Google logging in...');
    expect(statusElement.dataset.tone).toBe('pending');
  });

  it('updates status when redirect reports error', async () => {
    const googleButton = createButton();
    const githubButton = createButton();
    const statusElement = createStatus();

    await initLoginButtons({
      googleButton,
      githubButton,
      statusElement,
      loginGooglePopup: vi.fn().mockResolvedValue(null),
      loginGoogleRedirect: vi.fn().mockResolvedValue(undefined),
      loginGithubPopup: vi.fn().mockResolvedValue(null),
      loginGithubRedirect: vi.fn().mockResolvedValue(undefined),
      handleRedirectResult: vi.fn().mockResolvedValue({ error: new Error('redirect failed') }),
      isEmbeddedBrowser: () => false,
    });

    expect(statusElement.textContent).toBe('Redirect failed.');
    expect(statusElement.dataset.tone).toBe('error');
  });

  it('sets status when redirect provides a user', async () => {
    const googleButton = createButton();
    const githubButton = createButton();
    const statusElement = createStatus();

    await initLoginButtons({
      googleButton,
      githubButton,
      statusElement,
      loginGooglePopup: vi.fn().mockResolvedValue(null),
      loginGoogleRedirect: vi.fn().mockResolvedValue(undefined),
      loginGithubPopup: vi.fn().mockResolvedValue(null),
      loginGithubRedirect: vi.fn().mockResolvedValue(undefined),
      handleRedirectResult: vi.fn().mockResolvedValue({ user: { displayName: 'Ada' } }),
      isEmbeddedBrowser: () => false,
    });

    expect(statusElement.textContent).toBe('logged in as Ada.');
    expect(statusElement.dataset.tone).toBe('success');
  });

  it('formats redirect users using an email fallback', async () => {
    const googleButton = createButton();
    const githubButton = createButton();
    const statusElement = createStatus();

    await initLoginButtons({
      googleButton,
      githubButton,
      statusElement,
      loginGooglePopup: vi.fn().mockResolvedValue(null),
      loginGoogleRedirect: vi.fn().mockResolvedValue(undefined),
      loginGithubPopup: vi.fn().mockResolvedValue(null),
      loginGithubRedirect: vi.fn().mockResolvedValue(undefined),
      handleRedirectResult: vi.fn().mockResolvedValue({ user: { email: 'test@example.com' } }),
      isEmbeddedBrowser: () => false,
    });

    expect(statusElement.textContent).toBe('logged in as test@example.com.');
  });

  it('reports popup errors that do not redirect', async () => {
    const googleButton = createButton();
    const githubButton = createButton();
    const statusElement = createStatus();
    const loginGoogleRedirect = vi.fn().mockResolvedValue(undefined);

    initLoginButtons({
      googleButton,
      githubButton,
      statusElement,
      loginGooglePopup: vi.fn().mockRejectedValue({ code: 'auth/invalid' }),
      loginGoogleRedirect,
      loginGithubPopup: vi.fn().mockResolvedValue(null),
      loginGithubRedirect: vi.fn().mockResolvedValue(undefined),
      handleRedirectResult: vi.fn().mockResolvedValue(undefined),
      isEmbeddedBrowser: () => false,
    });

    await googleButton.handlers.click();

    expect(loginGoogleRedirect).not.toHaveBeenCalled();
    expect(statusElement.textContent).toBe('Google login failed.');
    expect(statusElement.dataset.tone).toBe('error');
  });

  it('reports redirect failures from embedded browsers', async () => {
    const googleButton = createButton();
    const githubButton = createButton();
    const statusElement = createStatus();

    initLoginButtons({
      googleButton,
      githubButton,
      statusElement,
      loginGooglePopup: vi.fn().mockResolvedValue(null),
      loginGoogleRedirect: vi.fn().mockRejectedValue(new Error('blocked')),
      loginGithubPopup: vi.fn().mockResolvedValue(null),
      loginGithubRedirect: vi.fn().mockResolvedValue(undefined),
      handleRedirectResult: vi.fn().mockResolvedValue(undefined),
      isEmbeddedBrowser: () => true,
    });

    await googleButton.handlers.click();

    expect(statusElement.textContent).toBe(
      'Google login failed, permission required. (check browser settings)',
    );
    expect(statusElement.dataset.tone).toBe('error');
  });

  it('starts github login flow when the github button is clicked', async () => {
    const googleButton = createButton();
    const githubButton = createButton();
    const statusElement = createStatus();
    const loginGithubPopup = vi.fn().mockResolvedValue(null);

    initLoginButtons({
      googleButton,
      githubButton,
      statusElement,
      loginGooglePopup: vi.fn().mockResolvedValue(null),
      loginGoogleRedirect: vi.fn().mockResolvedValue(undefined),
      loginGithubPopup,
      loginGithubRedirect: vi.fn().mockResolvedValue(undefined),
      handleRedirectResult: vi.fn().mockResolvedValue(undefined),
      isEmbeddedBrowser: () => false,
    });

    await githubButton.handlers.click();

    expect(loginGithubPopup).toHaveBeenCalled();
    expect(statusElement.textContent).toBe('GitHub logging in...');
    expect(statusElement.dataset.tone).toBe('pending');
  });
});
