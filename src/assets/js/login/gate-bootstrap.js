import { mountAuthGate } from './gate-core.js';

export const initAuthGate = ({
  document: doc = typeof document !== 'undefined' ? document : null,
  onAuthStateChanged,
  mount = mountAuthGate,
} = {}) => {
  if (!doc) {
    return { mounted: false };
  }

  const run = () => {
    mount({ document: doc, onAuthStateChanged });
  };

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', run);
    return { mounted: false };
  }

  run();
  return { mounted: true };
};
