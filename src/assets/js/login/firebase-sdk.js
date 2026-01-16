const firebaseAppUrl = 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
const firebaseAuthUrl = 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';

const loadFirebaseSdk = async () => {
  const [appModule, authModule] = await Promise.all([
    import(firebaseAppUrl),
    import(firebaseAuthUrl),
  ]);

  return {
    getApps: appModule.getApps,
    initializeApp: appModule.initializeApp,
    getAuth: authModule.getAuth,
    GoogleAuthProvider: authModule.GoogleAuthProvider,
    GithubAuthProvider: authModule.GithubAuthProvider,
    signInWithPopup: authModule.signInWithPopup,
    signInWithRedirect: authModule.signInWithRedirect,
    getRedirectResult: authModule.getRedirectResult,
    onAuthStateChanged: authModule.onAuthStateChanged,
    signOut: authModule.signOut,
  };
};

export { loadFirebaseSdk };
