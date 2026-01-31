const configModuleUrl = new URL('../../../config/firebase-config.js', import.meta.url);
const { firebaseConfig: configFromFile = {} } = await import(configModuleUrl.href);

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
