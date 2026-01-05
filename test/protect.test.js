import { describe, it, expect, beforeEach } from "vitest";

describe("protect script", () => {
  beforeEach(async () => {
    document.body.innerHTML = `<div>Test</div>`;
    await import("../assets/js/protect.js");
  });

  it("prevents context menu", () => {
    const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
    const prevented = !document.dispatchEvent(event);
    expect(prevented || event.defaultPrevented).toBe(true);
  });

  it("prevents common inspect shortcuts", () => {
    const event = new KeyboardEvent("keydown", { key: "I", ctrlKey: true, bubbles: true, cancelable: true });
    const prevented = !document.dispatchEvent(event);
    expect(prevented || event.defaultPrevented).toBe(true);
  });
});
