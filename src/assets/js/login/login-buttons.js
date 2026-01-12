import { createAuthHandlers } from './auth.js';
import { initLoginButtons } from './buttons-init.js';
import { firebaseConfig, isFirebaseConfigReady } from './firebase-config.js';
import { loadFirebaseSdk } from './firebase-sdk.js';

const googleClientId = '78150871126-imnoi25btctc85q56hou7fm3ecs04kp9.apps.googleusercontent.com';

const googleButton = document.querySelector('[data-auth-google]');
const githubButton = document.querySelector('[data-auth-github]');
const statusElement = document.querySelector('[data-auth-status]');

// Toggle visibility of elements based on auth state
const authOnly = document.querySelectorAll('[data-auth-only]');
const loggedOut = document.querySelectorAll('[data-auth-logged-out]');
const userSlots = document.querySelectorAll('[data-auth-user]');

// Setup
const isConfigReady = isFirebaseConfigReady();

if (!isConfigReady) {
  if (statusElement) {
    statusElement.textContent = 'Login is nog niet geconfigureerd.';
    statusElement.dataset.tone = 'error';
  }
} else if (googleButton && statusElement) {
  // && gitButton
  loadFirebaseSdk()
    .then(
      ({
        initializeApp,
        getAuth,
        GoogleAuthProvider,
        GithubAuthProvider,
        signInWithPopup,
        signInWithRedirect,
        getRedirectResult,
        onAuthStateChanged,
        signOut,
      }) => {
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        auth.useDeviceLanguage();

        // Toggle UI on auth state
        const formatUserLabel = (user) => user?.displayName || user?.email || 'gebruiker';
        const logoutBtn = document.querySelector('[data-auth-logout]');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', () => signOut(auth));
        }

        onAuthStateChanged(auth, (user) => {
          const loggedIn = Boolean(user);

          // Only show status on error
          if (loggedIn) {
            statusElement.textContent = '';
            statusElement.dataset.tone = '';
          }

          // Toggle auth-only / logged-out UI
          authOnly.forEach((el) => (el.hidden = !loggedIn));
          loggedOut.forEach((el) => (el.hidden = loggedIn));
          // Username slots updaten
          userSlots.forEach((el) => {
            if (loggedIn) el.textContent = formatUserLabel(user);
            // if some slots need to hold default text, use different selector for username
          });
          // (optional) status empty on succes
          if (loggedIn && statusElement) {
            statusElement.textContent = '';
            statusElement.dataset.tone = '';
          }
        });

        const {
          loginGooglePopup,
          loginGoogleRedirect,
          loginGithubPopup,
          loginGithubRedirect,
          handleRedirectResult,
        } = createAuthHandlers({
          auth,
          GoogleAuthProvider,
          GithubAuthProvider,
          signInWithPopup,
          signInWithRedirect,
          getRedirectResult,
          googleClientId,
        });

        initLoginButtons({
          googleButton,
          githubButton,
          statusElement,
          loginGooglePopup,
          loginGoogleRedirect,
          loginGithubPopup,
          loginGithubRedirect,
          handleRedirectResult,
        });
      },
    )
    .catch(() => {
      statusElement.textContent = 'Login kan niet geladen worden.';
      statusElement.dataset.tone = 'error';
    });
}
