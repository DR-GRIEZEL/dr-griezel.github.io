import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import { firebaseConfig, isFirebaseConfigReady } from '/assets/js/login/firebase-config.js';
import { mountAuthGate } from './gate-core.js';

if (!isFirebaseConfigReady()) {
  window.location.replace('/500/');
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

const bootstrapGate = () => {
  mountAuthGate({
    onAuthStateChanged: (callback) => onAuthStateChanged(auth, callback),
  });
};

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapGate);
  } else {
    bootstrapGate();
  }
}
