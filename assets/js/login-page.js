import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import { createAuthHandlers } from './login-auth.js';
import { initLoginPage } from './login-page-init.js';

const firebaseConfig = {
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  // ...
};

const googleClientId = '78150871126-imnoi25btctc85q56hou7fm3ecs04kp9.apps.googleusercontent.com';

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

const googlePopupButton = document.querySelector('[data-login-google-popup]');
const googleRedirectButton = document.querySelector('[data-login-google-redirect]');
const githubPopupButton = document.querySelector('[data-login-github-popup]');
const githubRedirectButton = document.querySelector('[data-login-github-redirect]');
const statusElement = document.querySelector('[data-login-status]');

initLoginPage({
  googlePopupButton,
  googleRedirectButton,
  githubPopupButton,
  githubRedirectButton,
  statusElement,
  loginGooglePopup,
  loginGoogleRedirect,
  loginGithubPopup,
  loginGithubRedirect,
  handleRedirectResult,
});
