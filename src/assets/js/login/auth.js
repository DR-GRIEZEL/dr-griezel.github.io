export function createAuthHandlers({
  auth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  googleClientId,
}) {
  if (!auth) {
    throw new Error('auth is required');
  }

  if (!GoogleAuthProvider) {
    throw new Error('GoogleAuthProvider is required');
  }

  if (!GithubAuthProvider) {
    throw new Error('GithubAuthProvider is required');
  }

  if (!signInWithPopup || !signInWithRedirect || !getRedirectResult) {
    throw new Error('auth functions are required');
  }

  const buildGoogleProvider = () => {
    const provider = new GoogleAuthProvider();
    const parameters = {
      prompt: 'select_account',
      ...(googleClientId ? { client_id: googleClientId } : {}),
    };
    provider.setCustomParameters(parameters);
    return provider;
  };

  const buildGithubProvider = () => {
    const provider = new GithubAuthProvider();
    provider.addScope('read:user');
    provider.addScope('user:email');
    return provider;
  };

  const loginGooglePopup = async () => {
    const provider = buildGoogleProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  };

  const loginGoogleRedirect = async () => {
    const provider = buildGoogleProvider();
    await signInWithRedirect(auth, provider);
  };

  const loginGithubPopup = async () => {
    const provider = buildGithubProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  };

  const loginGithubRedirect = async () => {
    const provider = buildGithubProvider();
    await signInWithRedirect(auth, provider);
  };

  const handleRedirectResult = () =>
    getRedirectResult(auth).catch((error) => (error ? { error } : undefined));

  return {
    loginGooglePopup,
    loginGoogleRedirect,
    loginGithubPopup,
    loginGithubRedirect,
    handleRedirectResult,
  };
}
