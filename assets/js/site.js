(() => {
  const body = document.body;
  const sidebar = document.getElementById("sidebar");
  const toggle = document.querySelector(".sidebar-toggle");
  const storageKey = "sidebar-collapsed";
  const smallScreen = window.matchMedia("(max-width: 900px)");

  const applyState = (collapsed) => {
    body.classList.toggle("sidebar-collapsed", collapsed);
    if (toggle) {
      toggle.setAttribute("aria-expanded", String(!collapsed));
    }
  };

  const getInitialState = () => {
    const stored = localStorage.getItem(storageKey);
    if (stored !== null) {
      return stored === "true";
    }
    return smallScreen.matches;
  };

  applyState(getInitialState());

  if (toggle && sidebar) {
    toggle.addEventListener("click", () => {
      const collapsed = !body.classList.contains("sidebar-collapsed");
      localStorage.setItem(storageKey, String(collapsed));
      applyState(collapsed);
    });
  }

  smallScreen.addEventListener("change", (event) => {
    const stored = localStorage.getItem(storageKey);
    if (stored === null) {
      applyState(event.matches);
    }
  });

  const yearEl = document.getElementById("footer-year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  const blockInspect = (event) => {
    const key = event.key.toLowerCase();
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;
    if (
      key === "f12" ||
      (ctrlOrCmd && event.shiftKey && ["i", "j", "c"].includes(key)) ||
      (ctrlOrCmd && key === "u")
    ) {
      event.preventDefault();
    }
  };

  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
  document.addEventListener("keydown", blockInspect);
})();
