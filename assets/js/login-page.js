import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import { createGoogleAuthHandlers } from './login-auth.js';
import { initLoginPage } from './login-page-init.js';

const firebaseConfig = {
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  // ...
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const { loginGooglePopup, loginGoogleRedirect, handleRedirectResult } = createGoogleAuthHandlers({
  auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
});

const popupButton = document.querySelector('[data-login-popup]');
const redirectButton = document.querySelector('[data-login-redirect]');
const statusElement = document.querySelector('[data-login-status]');

initLoginPage({
  popupButton,
  redirectButton,
  statusElement,
  loginGooglePopup,
  loginGoogleRedirect,
  handleRedirectResult,
});
