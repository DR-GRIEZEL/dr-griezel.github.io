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
        popupButton: createButton(),
        redirectButton: createButton(),
        statusElement: createStatus(),
      }),
    ).toThrow('login handlers are required');
  });

  it('updates status on popup success', async () => {
    const popupButton = createButton();
    const redirectButton = createButton();
    const statusElement = createStatus();

    initLoginPage({
      popupButton,
      redirectButton,
      statusElement,
      loginGooglePopup: vi.fn().mockResolvedValue({ displayName: 'Test User' }),
      loginGoogleRedirect: vi.fn().mockResolvedValue(undefined),
      handleRedirectResult: vi.fn().mockResolvedValue(null),
    });

    await popupButton.handlers.click();

    expect(statusElement.textContent).toBe('Ingelogd als Test User.');
    expect(statusElement.dataset.tone).toBe('success');
  });

  it('updates status on popup error', async () => {
    const popupButton = createButton();
    const redirectButton = createButton();
    const statusElement = createStatus();

    initLoginPage({
      popupButton,
      redirectButton,
      statusElement,
      loginGooglePopup: vi.fn().mockRejectedValue(new Error('popup failed')),
      loginGoogleRedirect: vi.fn().mockResolvedValue(undefined),
      handleRedirectResult: vi.fn().mockResolvedValue(null),
    });

    await popupButton.handlers.click();

    expect(statusElement.textContent).toBe('Popup-login mislukt. Gebruik de redirect-flow.');
    expect(statusElement.dataset.tone).toBe('error');
  });

  it('updates status when redirect returns a user', async () => {
    const popupButton = createButton();
    const redirectButton = createButton();
    const statusElement = createStatus();

    await initLoginPage({
      popupButton,
      redirectButton,
      statusElement,
      loginGooglePopup: vi.fn().mockResolvedValue(null),
      loginGoogleRedirect: vi.fn().mockResolvedValue(undefined),
      handleRedirectResult: vi.fn().mockResolvedValue({ user: { email: 'test@example.com' } }),
    });

    expect(statusElement.textContent).toBe('Ingelogd als test@example.com.');
    expect(statusElement.dataset.tone).toBe('success');
  });
});
