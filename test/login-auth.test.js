import { describe, expect, it, vi } from 'vitest';

<<<<<<< HEAD
import { createAuthHandlers } from '../assets/js/login-auth.js';
=======
import { createAuthHandlers } from '../assets/js/login/auth.js';
>>>>>>> codex/fix-login-methods-and-add-buttons-8fb7em

describe('createAuthHandlers', () => {
  it('throws when required dependencies are missing', () => {
    expect(() => createAuthHandlers({})).toThrow('auth is required');
    expect(() => createAuthHandlers({ auth: {}, signInWithPopup: () => {} })).toThrow(
      'GoogleAuthProvider is required',
    );
    expect(() =>
      createAuthHandlers({
        auth: {},
        GoogleAuthProvider: class {},
      }),
    ).toThrow('GithubAuthProvider is required');
    expect(() =>
      createAuthHandlers({
        auth: {},
        GoogleAuthProvider: class {},
        GithubAuthProvider: class {},
      }),
    ).toThrow('auth functions are required');
  });

  it('returns popup handler that resolves user with google client id', async () => {
    const setCustomParameters = vi.fn();
    class MockProvider {
      setCustomParameters(params) {
        setCustomParameters(params);
      }
    }
    class MockGithubProvider {}

    const auth = { id: 'auth' };
    const signInWithPopup = vi.fn().mockResolvedValue({ user: { uid: 'user-1' } });
    const signInWithRedirect = vi.fn();
    const getRedirectResult = vi.fn().mockResolvedValue(null);

    const { loginGooglePopup } = createAuthHandlers({
      auth,
      GoogleAuthProvider: MockProvider,
      GithubAuthProvider: MockGithubProvider,
      signInWithPopup,
      signInWithRedirect,
      getRedirectResult,
      googleClientId: 'client-id',
    });

    await expect(loginGooglePopup()).resolves.toEqual({ uid: 'user-1' });
    expect(signInWithPopup).toHaveBeenCalledWith(auth, expect.any(MockProvider));
    expect(setCustomParameters).toHaveBeenCalledWith({
      client_id: 'client-id',
      prompt: 'select_account',
    });
  });

  it('returns redirect handler that calls redirect flow', async () => {
    class MockProvider {
      setCustomParameters() {}
    }
    class MockGithubProvider {}

    const auth = { id: 'auth' };
    const signInWithPopup = vi.fn();
    const signInWithRedirect = vi.fn().mockResolvedValue(undefined);
    const getRedirectResult = vi.fn().mockResolvedValue(null);

    const { loginGoogleRedirect } = createAuthHandlers({
      auth,
      GoogleAuthProvider: MockProvider,
      GithubAuthProvider: MockGithubProvider,
      signInWithPopup,
      signInWithRedirect,
      getRedirectResult,
    });

    await loginGoogleRedirect();
    expect(signInWithRedirect).toHaveBeenCalledWith(auth, expect.any(MockProvider));
  });

  it('returns github popup handler that resolves user', async () => {
    class MockProvider {
      setCustomParameters() {}
    }
    class MockGithubProvider {
      addScope() {}
    }

    const auth = { id: 'auth' };
    const signInWithPopup = vi.fn().mockResolvedValue({ user: { uid: 'github-user' } });
    const signInWithRedirect = vi.fn();
    const getRedirectResult = vi.fn().mockResolvedValue(null);

    const { loginGithubPopup } = createAuthHandlers({
      auth,
      GoogleAuthProvider: MockProvider,
      GithubAuthProvider: MockGithubProvider,
      signInWithPopup,
      signInWithRedirect,
      getRedirectResult,
    });

    await expect(loginGithubPopup()).resolves.toEqual({ uid: 'github-user' });
    expect(signInWithPopup).toHaveBeenCalledWith(auth, expect.any(MockGithubProvider));
  });

  it('handles redirect result without throwing', async () => {
    class MockProvider {
      setCustomParameters() {}
    }
    class MockGithubProvider {}

    const auth = { id: 'auth' };
    const signInWithPopup = vi.fn();
    const signInWithRedirect = vi.fn();
    const getRedirectResult = vi.fn().mockRejectedValue(new Error('redirect failed'));

    const { handleRedirectResult } = createAuthHandlers({
      auth,
      GoogleAuthProvider: MockProvider,
      GithubAuthProvider: MockGithubProvider,
      signInWithPopup,
      signInWithRedirect,
      getRedirectResult,
    });

    await expect(handleRedirectResult()).resolves.toEqual({ error: expect.any(Error) });
    expect(getRedirectResult).toHaveBeenCalledWith(auth);
  });
});
