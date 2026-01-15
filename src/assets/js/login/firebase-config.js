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
export const isFirebaseConfigReady = () =>
  Object.values(firebaseConfig).every((value) => Boolean(value) && value !== '...');
