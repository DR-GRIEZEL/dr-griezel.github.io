export function initLoginPage({
  popupButton,
  redirectButton,
  statusElement,
  loginGooglePopup,
  loginGoogleRedirect,
  handleRedirectResult,
}) {
  if (!popupButton || !redirectButton || !statusElement) {
    throw new Error('login elements are required');
  }

  if (!loginGooglePopup || !loginGoogleRedirect || !handleRedirectResult) {
    throw new Error('login handlers are required');
  }

  const setStatus = (message, tone) => {
    statusElement.textContent = message;
    statusElement.dataset.tone = tone;
  };

  popupButton.addEventListener('click', () => {
    setStatus('Popup-login gestart...', 'pending');
    return loginGooglePopup()
      .then((user) => {
        const label = user?.displayName || user?.email || 'gebruiker';
        setStatus(`Ingelogd als ${label}.`, 'success');
      })
      .catch(() => {
        setStatus('Popup-login mislukt. Gebruik de redirect-flow.', 'error');
      });
  });

  redirectButton.addEventListener('click', () => {
    setStatus('Redirect-login gestart...', 'pending');
    return loginGoogleRedirect().catch(() => {
      setStatus('Redirect-login mislukt. Controleer je browserinstellingen.', 'error');
    });
  });

  return handleRedirectResult().then((result) => {
    if (result?.user) {
      const label = result.user.displayName || result.user.email || 'gebruiker';
      setStatus(`Ingelogd als ${label}.`, 'success');
    }
  });
}
