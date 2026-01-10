import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const firebaseConfig = window.firebaseConfig;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const protectedEl = document.querySelector("[data-requires-auth]");

// default: hide until logged in
if (protectedEl) protectedEl.hidden = true;

onAuthStateChanged(auth, (user) => {
  const ok = Boolean(user);

  if (protectedEl) protectedEl.hidden = !ok;

  if (!ok) {
    // route:
    window.location.replace("/500/");
  }
});

