import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  getIdTokenResult,
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const firebaseConfig = window.firebaseConfig;
if (!firebaseConfig) throw new Error("window.firebaseConfig ontbreekt");

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

const $ = (sel) => document.querySelector(sel);
const setText = (sel, v) => {
  const el = $(sel);
  if (!el) return;
  el.textContent = v ?? "—";
};

const formatUserLabel = (user) => user?.displayName || user?.email || "gebruiker";

onAuthStateChanged(auth, async (user) => {
  // 1) Navbar label "Settings" -> username (alleen als element bestaat)
  document.querySelectorAll("[data-auth-nav-username]").forEach((el) => {
    el.textContent = user ? formatUserLabel(user) : "Settings";
  });

  // 2) Settings page panel
  const protectedEl = $("[data-requires-auth]");
  if (protectedEl) protectedEl.hidden = !user;

  if (!user) return;

  // Basisvelden (veilig om te tonen)
  setText("[data-auth-name]", user.displayName || "—");
  setText("[data-auth-email]", user.email || "—");
  setText("[data-auth-uid]", user.uid);
  setText("[data-auth-email-verified]", String(Boolean(user.emailVerified)));
  setText("[data-auth-phone]", user.phoneNumber || "—");
  setText("[data-auth-anon]", String(Boolean(user.isAnonymous)));
  setText("[data-auth-created]", user.metadata?.creationTime || "—");
  setText("[data-auth-last-signin]", user.metadata?.lastSignInTime || "—");

  // Provider(s)
  const providers = (user.providerData || [])
    .map((p) => p.providerId)
    .filter(Boolean)
    .join(", ");
  setText("[data-auth-providers]", providers || "—");

  // “Hoofd provider” label (optioneel)
  setText("[data-auth-provider]", providers ? `Providers: ${providers}` : "—");

  // Avatar
  const img = $("[data-auth-photo]");
  if (img) {
    if (user.photoURL) {
      img.src = user.photoURL;
      img.hidden = false;
    } else {
      img.hidden = true;
    }
  }

  // Token claims/expiry (toon géén token string)
  try {
    const tokenResult = await getIdTokenResult(user, /*forceRefresh=*/ false);
    // tokenResult.claims bevat claims; toon enkel dingen die je echt wil (geen hele dump).
    const exp = tokenResult?.expirationTime || "—";
    setText("[data-auth-token-exp]", exp);
  } catch {
    setText("[data-auth-token-exp]", "—");
  }
});
