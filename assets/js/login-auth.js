export function createGoogleAuthHandlers({
  auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
}) {
  if (!auth) {
    throw new Error('auth is required');
  }

  if (!GoogleAuthProvider) {
    throw new Error('GoogleAuthProvider is required');
  }

  if (!signInWithPopup || !signInWithRedirect || !getRedirectResult) {
    throw new Error('auth functions are required');
  }

  const loginGooglePopup = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  };

  const loginGoogleRedirect = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  const handleRedirectResult = () => getRedirectResult(auth).catch(() => {});

  return { loginGooglePopup, loginGoogleRedirect, handleRedirectResult };
}
