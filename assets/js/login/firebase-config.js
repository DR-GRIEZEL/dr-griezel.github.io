const defaultFirebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: '',
};

const getDatasetConfig = (root) => {
  if (!root?.dataset) return {};
  const dataset = root.dataset;
  return {
    apiKey: dataset.firebaseApiKey,
    authDomain: dataset.firebaseAuthDomain,
    projectId: dataset.firebaseProjectId,
    storageBucket: dataset.firebaseStorageBucket,
    messagingSenderId: dataset.firebaseMessagingSenderId,
    appId: dataset.firebaseAppId,
    measurementId: dataset.firebaseMeasurementId,
  };
};

export const getFirebaseConfigFromRuntime = (runtimeConfig = {}, root = null) => {
  return {
    ...defaultFirebaseConfig,
    ...getDatasetConfig(root),
    ...runtimeConfig,
  };
};

const getRuntimeConfig = () => {
  const runtimeConfig = globalThis.__FIREBASE_CONFIG__ || {};
  const root = typeof document === 'undefined' ? null : document.documentElement;
  return getFirebaseConfigFromRuntime(runtimeConfig, root);
};

// For Firebase JS SDK v7.20.0 and later, measurementId is optional.
export const firebaseConfig = getRuntimeConfig();

export const isFirebaseConfigReady = () =>
  Object.values(firebaseConfig).every((value) => Boolean(value) && value !== '...');
