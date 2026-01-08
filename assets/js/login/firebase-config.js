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

export const isFirebaseConfigReady = () =>
  Object.values(firebaseConfig).every((value) => Boolean(value) && value !== '...');
