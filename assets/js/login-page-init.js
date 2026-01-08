export function initLoginPage({
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
}) {
  if (
    !googlePopupButton ||
    !googleRedirectButton ||
    !githubPopupButton ||
    !githubRedirectButton ||
    !statusElement
  ) {
    throw new Error('login elements are required');
  }

  if (
    !loginGooglePopup ||
    !loginGoogleRedirect ||
    !loginGithubPopup ||
    !loginGithubRedirect ||
    !handleRedirectResult
  ) {
    throw new Error('login handlers are required');
  }

  const setStatus = (message, tone) => {
    statusElement.textContent = message;
    statusElement.dataset.tone = tone;
  };

  const formatUserLabel = (user) => user?.displayName || user?.email || 'gebruiker';

  const handleLogin = (promise, errorMessage) =>
    promise
      .then((user) => {
        if (user) {
          setStatus(`Ingelogd als ${formatUserLabel(user)}.`, 'success');
        }
      })
      .catch(() => {
        setStatus(errorMessage, 'error');
      });

  googlePopupButton.addEventListener('click', () => {
    setStatus('Google popup-login gestart...', 'pending');
    return handleLogin(loginGooglePopup(), 'Google popup-login mislukt. Gebruik redirect.');
  });

  googleRedirectButton.addEventListener('click', () => {
    setStatus('Google redirect-login gestart...', 'pending');
    return loginGoogleRedirect().catch(() => {
      setStatus('Google redirect-login mislukt. Controleer je browserinstellingen.', 'error');
    });
  });

  githubPopupButton.addEventListener('click', () => {
    setStatus('GitHub popup-login gestart...', 'pending');
    return handleLogin(loginGithubPopup(), 'GitHub popup-login mislukt. Gebruik redirect.');
  });

  githubRedirectButton.addEventListener('click', () => {
    setStatus('GitHub redirect-login gestart...', 'pending');
    return loginGithubRedirect().catch(() => {
      setStatus('GitHub redirect-login mislukt. Controleer je browserinstellingen.', 'error');
    });
  });

  return handleRedirectResult().then((result) => {
    if (result?.user) {
      setStatus(`Ingelogd als ${formatUserLabel(result.user)}.`, 'success');
      return;
    }

    if (result?.error) {
      setStatus('Redirect-login mislukt. Controleer de Firebase OAuth-instellingen.', 'error');
    }
  });
}
