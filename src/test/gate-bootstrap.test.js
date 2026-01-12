import { describe, expect, it, vi } from 'vitest';

import { initAuthGate } from '../assets/js/login/gate-bootstrap.js';

describe('initAuthGate', () => {
  it('waits for DOMContentLoaded when the document is loading', () => {
    const handlers = {};
    const doc = {
      readyState: 'loading',
      addEventListener: (event, handler) => {
        handlers[event] = handler;
      },
    };
    const mount = vi.fn();
    const onAuthStateChanged = vi.fn();

    const result = initAuthGate({ document: doc, onAuthStateChanged, mount });

    expect(result.mounted).toBe(false);
    expect(mount).not.toHaveBeenCalled();

    handlers.DOMContentLoaded();
    expect(mount).toHaveBeenCalledWith({ document: doc, onAuthStateChanged });
  });

  it('mounts immediately when the document is ready', () => {
    const doc = {
      readyState: 'complete',
      addEventListener: vi.fn(),
    };
    const mount = vi.fn();
    const onAuthStateChanged = vi.fn();

    const result = initAuthGate({ document: doc, onAuthStateChanged, mount });

    expect(result.mounted).toBe(true);
    expect(mount).toHaveBeenCalledWith({ document: doc, onAuthStateChanged });
    expect(doc.addEventListener).not.toHaveBeenCalled();
  });

  it('returns mounted false when no document is available', () => {
    const result = initAuthGate({ document: null });
    expect(result.mounted).toBe(false);
  });
});
