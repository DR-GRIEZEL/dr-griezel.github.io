document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

document.addEventListener("keydown", (event) => {
  const key = event.key?.toLowerCase?.() ?? "";
  const isCtrl = event.ctrlKey || event.metaKey;
  if (key === "f12") event.preventDefault();
  if (isCtrl && (key === "u" || key === "s" || key === "p" || key === "i" || key === "j" || key === "c")) {
    event.preventDefault();
  }
});
