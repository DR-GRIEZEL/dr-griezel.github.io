<<<<<<< HEAD:assets/js/login/firebase-config.js
// For Firebase JS SDK v7.20.0 and later, measurementId is optional.
export const firebaseConfig = {
  apiKey: 'AIzaSyC4dw2DS7X5OMsnwiwFSYLdeUH1jEDRzGo',
  authDomain: 'dashboard-a81aa.firebaseapp.com',
  projectId: 'dashboard-a81aa',
  storageBucket: 'dashboard-a81aa.firebasestorage.app',
  messagingSenderId: '78150871126',
  appId: '1:78150871126:web:c950dca3d2c972658a33f7',
  measurementId: 'G-NX4BKD7GHN',
};

=======
import { firebaseConfig as configFromFile } from '/config/firebase-config.js';

const defaultFirebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: '',
};

export const firebaseConfig = {
  ...defaultFirebaseConfig,
  ...(configFromFile ?? {}),
};

// For Firebase JS SDK v7.20.0 and later, measurementId is optional.
>>>>>>> 17319976767dd90cb79c84db4666328e56cde6ac:src/assets/js/login/firebase-config.js
export const isFirebaseConfigReady = () =>
  Object.values(firebaseConfig).every((value) => Boolean(value) && value !== '...');
