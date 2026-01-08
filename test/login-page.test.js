import { describe, expect, it, vi } from 'vitest';

import { initLoginPage } from '../assets/js/login-page-init.js';

describe('initLoginPage', () => {
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
    expect(() => initLoginPage({})).toThrow('login elements are required');
    expect(() =>
      initLoginPage({
        googlePopupButton: createButton(),
        googleRedirectButton: createButton(),
        githubPopupButton: createButton(),
        githubRedirectButton: createButton(),
        statusElement: createStatus(),
      }),
    ).toThrow('login handlers are required');
  });

  it('updates status on google popup success', async () => {
    const googlePopupButton = createButton();
    const googleRedirectButton = createButton();
    const githubPopupButton = createButton();
    const githubRedirectButton = createButton();
    const statusElement = createStatus();

    initLoginPage({
      googlePopupButton,
      googleRedirectButton,
      githubPopupButton,
      githubRedirectButton,
      statusElement,
      loginGooglePopup: vi.fn().mockResolvedValue({ displayName: 'Test User' }),
      loginGoogleRedirect: vi.fn().mockResolvedValue(undefined),
      loginGithubPopup: vi.fn().mockResolvedValue(null),
      loginGithubRedirect: vi.fn().mockResolvedValue(undefined),
      handleRedirectResult: vi.fn().mockResolvedValue(undefined),
    });

    await googlePopupButton.handlers.click();

    expect(statusElement.textContent).toBe('Ingelogd als Test User.');
    expect(statusElement.dataset.tone).toBe('success');
  });

  it('updates status on github popup error', async () => {
    const googlePopupButton = createButton();
    const googleRedirectButton = createButton();
    const githubPopupButton = createButton();
    const githubRedirectButton = createButton();
    const statusElement = createStatus();

    initLoginPage({
      googlePopupButton,
      googleRedirectButton,
      githubPopupButton,
      githubRedirectButton,
      statusElement,
      loginGooglePopup: vi.fn().mockResolvedValue(null),
      loginGoogleRedirect: vi.fn().mockResolvedValue(undefined),
      loginGithubPopup: vi.fn().mockRejectedValue(new Error('popup failed')),
      loginGithubRedirect: vi.fn().mockResolvedValue(undefined),
      handleRedirectResult: vi.fn().mockResolvedValue(undefined),
    });

    await githubPopupButton.handlers.click();

    expect(statusElement.textContent).toBe('GitHub popup-login mislukt. Gebruik redirect.');
    expect(statusElement.dataset.tone).toBe('error');
  });

  it('updates status when redirect returns a user', async () => {
    const googlePopupButton = createButton();
    const googleRedirectButton = createButton();
    const githubPopupButton = createButton();
    const githubRedirectButton = createButton();
    const statusElement = createStatus();

    await initLoginPage({
      googlePopupButton,
      googleRedirectButton,
      githubPopupButton,
      githubRedirectButton,
      statusElement,
      loginGooglePopup: vi.fn().mockResolvedValue(null),
      loginGoogleRedirect: vi.fn().mockResolvedValue(undefined),
      loginGithubPopup: vi.fn().mockResolvedValue(null),
      loginGithubRedirect: vi.fn().mockResolvedValue(undefined),
      handleRedirectResult: vi.fn().mockResolvedValue({ user: { email: 'test@example.com' } }),
    });

    expect(statusElement.textContent).toBe('Ingelogd als test@example.com.');
    expect(statusElement.dataset.tone).toBe('success');
  });

  it('updates status when redirect reports error', async () => {
    const googlePopupButton = createButton();
    const googleRedirectButton = createButton();
    const githubPopupButton = createButton();
    const githubRedirectButton = createButton();
    const statusElement = createStatus();

    await initLoginPage({
      googlePopupButton,
      googleRedirectButton,
      githubPopupButton,
      githubRedirectButton,
      statusElement,
      loginGooglePopup: vi.fn().mockResolvedValue(null),
      loginGoogleRedirect: vi.fn().mockResolvedValue(undefined),
      loginGithubPopup: vi.fn().mockResolvedValue(null),
      loginGithubRedirect: vi.fn().mockResolvedValue(undefined),
      handleRedirectResult: vi.fn().mockResolvedValue({ error: new Error('redirect failed') }),
    });

    expect(statusElement.textContent).toBe(
      'Redirect-login mislukt. Controleer de Firebase OAuth-instellingen.',
    );
    expect(statusElement.dataset.tone).toBe('error');
  });
});
