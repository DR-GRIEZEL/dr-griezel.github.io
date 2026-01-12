import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import { firebaseConfig, isFirebaseConfigReady } from '/assets/js/login/firebase-config.js';
import { initAuthGate } from './gate-bootstrap.js';

if (!isFirebaseConfigReady()) {
  window.location.replace('/500/');
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

initAuthGate({
  onAuthStateChanged: (callback) => onAuthStateChanged(auth, callback),
});
