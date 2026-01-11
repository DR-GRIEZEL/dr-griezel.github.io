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

  it('returns null without listeners', () => {
    const result = mountAuthGate({});
    expect(result.protectedEl).toBeNull();
  });
});
