import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import { createAuthHandlers } from './auth.js';
import { initLoginButtons } from './buttons-init.js';
import { firebaseConfig, isFirebaseConfigReady } from './firebase-config.js';

const googleClientId = '78150871126-imnoi25btctc85q56hou7fm3ecs04kp9.apps.googleusercontent.com';

const googleButton = document.querySelector('[data-auth-google]');
const githubButton = document.querySelector('[data-auth-github]');
const statusElement = document.querySelector('[data-auth-status]');

const isConfigReady = isFirebaseConfigReady();

if (!isConfigReady) {
  if (statusElement) {
    statusElement.textContent = 'Login is nog niet geconfigureerd.';
    statusElement.dataset.tone = 'error';
  }
} else if (googleButton && githubButton && statusElement) {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  auth.useDeviceLanguage();

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
}
