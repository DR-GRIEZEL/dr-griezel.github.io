import { describe, expect, it } from 'vitest';
import { getFirebaseConfigFromRuntime } from '../assets/js/login/firebase-config.js';

describe('firebase config runtime', () => {
  it('returns defaults when no data is provided', () => {
    const config = getFirebaseConfigFromRuntime();
    expect(config.apiKey).toBe('');
    expect(config.projectId).toBe('');
  });

  it('merges dataset and runtime values', () => {
    const root = {
      dataset: {
        firebaseApiKey: 'dataset-key',
        firebaseProjectId: 'dataset-project',
      },
    };

    const config = getFirebaseConfigFromRuntime({ apiKey: 'runtime-key' }, root);

    expect(config.apiKey).toBe('runtime-key');
    expect(config.projectId).toBe('dataset-project');
  });
});
