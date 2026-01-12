import { describe, expect, it, vi } from 'vitest';

import { mountAuthGate, DEFAULT_REDIRECT_PATH } from '../assets/js/login/gate-core.js';

describe('mountAuthGate', () => {
  it('hides and reveals protected element based on auth state', () => {
    const element = { hidden: false };
    const doc = { querySelector: () => element };
    const listeners = [];
    const onAuthStateChanged = (callback) => {
      listeners.push(callback);
    };
    const redirect = vi.fn();

    const { protectedEl } = mountAuthGate({ document: doc, onAuthStateChanged, redirect });

    expect(protectedEl).toBe(element);
    expect(element.hidden).toBe(true);

    listeners[0]({ uid: 'user-1' });
    expect(element.hidden).toBe(false);
    expect(redirect).not.toHaveBeenCalled();

    listeners[0](null);
    expect(element.hidden).toBe(true);
    expect(redirect).toHaveBeenCalledWith(DEFAULT_REDIRECT_PATH);
  });

  it('redirects even when the protected element is missing', () => {
    const listeners = [];
    const onAuthStateChanged = (callback) => {
      listeners.push(callback);
    };

    const redirect = vi.fn();
    const result = mountAuthGate({ document: null, onAuthStateChanged, redirect });

    expect(result.protectedEl).toBeNull();
    listeners[0](null);
    expect(redirect).toHaveBeenCalledWith(DEFAULT_REDIRECT_PATH);
  });

  it('returns null without listeners', () => {
    const result = mountAuthGate({});
    expect(result.protectedEl).toBeNull();
  });

  it('uses the default redirect when no override is provided', () => {
    const element = { hidden: false };
    const doc = { querySelector: () => element };
    const listeners = [];
    const onAuthStateChanged = (callback) => {
      listeners.push(callback);
    };
    const replace = vi.fn();
    globalThis.window = { location: { replace } };

    mountAuthGate({ document: doc, onAuthStateChanged });

    listeners[0](null);
    expect(replace).toHaveBeenCalledWith(DEFAULT_REDIRECT_PATH);

    delete globalThis.window;
  });

  it('no-ops when the default redirect cannot access window', () => {
    const listeners = [];
    const onAuthStateChanged = (callback) => {
      listeners.push(callback);
    };

    mountAuthGate({ document: null, onAuthStateChanged });

    expect(() => listeners[0](null)).not.toThrow();
  });

  it('uses the global document when none is provided', () => {
    const element = { hidden: false };
    const listeners = [];
    const onAuthStateChanged = (callback) => {
      listeners.push(callback);
    };

    globalThis.document = { querySelector: () => element };

    mountAuthGate({ onAuthStateChanged, redirect: vi.fn() });

    listeners[0]({ uid: 'user-2' });
    expect(element.hidden).toBe(false);

    delete globalThis.document;
  });
});
