import { describe, expect, it, vi } from 'vitest';

describe('firebase config module', () => {
  it('exposes config from the config file and reports ready', async () => {
    vi.resetModules();
    const configModuleUrl = new globalThis.URL(
      '../../../../config/firebase-config.js',
      new globalThis.URL('../assets/js/login/firebase-config.js', import.meta.url),
    ).href;

    vi.doMock(configModuleUrl, () => ({
      firebaseConfig: {
        apiKey: 'api-key',
        authDomain: 'auth-domain',
        projectId: 'project-id',
        storageBucket: 'storage-bucket',
        messagingSenderId: 'sender-id',
        appId: 'app-id',
        measurementId: 'measurement-id',
      },
    }));

    const { firebaseConfig, isFirebaseConfigReady } =
      await import('../assets/js/login/firebase-config.js');

    expect(firebaseConfig.apiKey).toBe('api-key');
    expect(firebaseConfig.projectId).toBe('project-id');
    expect(isFirebaseConfigReady()).toBe(true);
  });

  it('reports not ready when required values are missing', async () => {
    vi.resetModules();
    const configModuleUrl = new globalThis.URL(
      '../../../../config/firebase-config.js',
      new globalThis.URL('../assets/js/login/firebase-config.js', import.meta.url),
    ).href;

    vi.doMock(configModuleUrl, () => ({
      firebaseConfig: {
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
        measurementId: '',
      },
    }));

    const { isFirebaseConfigReady } = await import('../assets/js/login/firebase-config.js');

    expect(isFirebaseConfigReady()).toBe(false);
  });
});
