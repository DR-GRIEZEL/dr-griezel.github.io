import { describe, expect, it, vi } from 'vitest';

import { createGoogleAuthHandlers } from '../assets/js/login-auth.js';

describe('createGoogleAuthHandlers', () => {
  it('throws when required dependencies are missing', () => {
    expect(() => createGoogleAuthHandlers({})).toThrow('auth is required');
    expect(() => createGoogleAuthHandlers({ auth: {}, signInWithPopup: () => {} })).toThrow(
      'GoogleAuthProvider is required',
    );
    expect(() =>
      createGoogleAuthHandlers({
        auth: {},
        GoogleAuthProvider: class {},
      }),
    ).toThrow('auth functions are required');
  });

  it('returns popup handler that resolves user', async () => {
    class MockProvider {}

    const auth = { id: 'auth' };
    const signInWithPopup = vi.fn().mockResolvedValue({ user: { uid: 'user-1' } });
    const signInWithRedirect = vi.fn();
    const getRedirectResult = vi.fn().mockResolvedValue(null);

    const { loginGooglePopup } = createGoogleAuthHandlers({
      auth,
      GoogleAuthProvider: MockProvider,
      signInWithPopup,
      signInWithRedirect,
      getRedirectResult,
    });

    await expect(loginGooglePopup()).resolves.toEqual({ uid: 'user-1' });
    expect(signInWithPopup).toHaveBeenCalledWith(auth, expect.any(MockProvider));
  });

  it('returns redirect handler that calls redirect flow', async () => {
    class MockProvider {}

    const auth = { id: 'auth' };
    const signInWithPopup = vi.fn();
    const signInWithRedirect = vi.fn().mockResolvedValue(undefined);
    const getRedirectResult = vi.fn().mockResolvedValue(null);

    const { loginGoogleRedirect } = createGoogleAuthHandlers({
      auth,
      GoogleAuthProvider: MockProvider,
      signInWithPopup,
      signInWithRedirect,
      getRedirectResult,
    });

    await loginGoogleRedirect();
    expect(signInWithRedirect).toHaveBeenCalledWith(auth, expect.any(MockProvider));
  });

  it('handles redirect result without throwing', async () => {
    class MockProvider {}

    const auth = { id: 'auth' };
    const signInWithPopup = vi.fn();
    const signInWithRedirect = vi.fn();
    const getRedirectResult = vi.fn().mockRejectedValue(new Error('redirect failed'));

    const { handleRedirectResult } = createGoogleAuthHandlers({
      auth,
      GoogleAuthProvider: MockProvider,
      signInWithPopup,
      signInWithRedirect,
      getRedirectResult,
    });

    await expect(handleRedirectResult()).resolves.toBeUndefined();
    expect(getRedirectResult).toHaveBeenCalledWith(auth);
  });
});
