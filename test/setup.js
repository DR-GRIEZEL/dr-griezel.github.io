globalThis.__DASHBOARD_AUTO_INIT__ = false;

class AudioContextMock {
  createOscillator() {
    return {
      type: "sine",
      frequency: { value: 0 },
      connect() {},
      start() {},
      stop() {},
    };
  }
  createGain() {
    return {
      gain: {
        setValueAtTime() {},
        exponentialRampToValueAtTime() {},
      },
      connect() {},
    };
  }
  get destination() {
    return {};
  }
  get currentTime() {
    return 0;
  }
}

globalThis.AudioContext = AudioContextMock;
globalThis.webkitAudioContext = AudioContextMock;
globalThis.Notification = class NotificationMock {
  static permission = "denied";
  static requestPermission() {
    return Promise.resolve("denied");
  }
  constructor() {}
};
