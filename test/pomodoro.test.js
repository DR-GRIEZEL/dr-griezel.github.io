import { describe, it, expect, beforeEach, vi } from "vitest";

describe("pomodoro widget", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="pomo-time">25:00</div>
      <div id="pomo-state">Focus</div>
      <div id="pomo-bar"></div>
      <button id="pomo-start">Start</button>
      <button id="pomo-pause">Pause</button>
      <button id="pomo-break">Break</button>
      <button id="pomo-reset">Reset</button>
    `;
  });

  it("starts and updates timer state on click", async () => {
    const storage = new Map();
    const storageMock = {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    };

    const { initPomodoro } = await import("../assets/js/pomodoro.js");
    const pomo = initPomodoro({
      storage: storageMock,
      enableChime: false,
    });

    document.getElementById("pomo-start").click();

    await vi.waitFor(() => {
      expect(document.getElementById("pomo-state").textContent).toContain("actief");
      expect(document.getElementById("pomo-time").textContent).toBe("25:00");
    });

    pomo.stop();
  });

  it("resets and enters break mode", async () => {
    const storage = new Map();
    const storageMock = {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    };
    const { initPomodoro } = await import("../assets/js/pomodoro.js");
    const pomo = initPomodoro({
      storage: storageMock,
      enableChime: false,
    });

    document.getElementById("pomo-break").click();
    await vi.waitFor(() => {
      expect(document.getElementById("pomo-state").textContent).toContain("pauze");
    });

    document.getElementById("pomo-reset").click();
    await vi.waitFor(() => {
      expect(document.getElementById("pomo-time").textContent).toBe("00:00");
    });

    pomo.stop();
  });
});
