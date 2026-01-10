const defaultIsEmbeddedBrowser = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent ?? '';
  const inAppRegex =
    /(FBAN|FBAV|Instagram|Line|Twitter|LinkedInApp|Snapchat|TikTok|Pinterest|WhatsApp|Messenger|; wv)/i;
  const standalone =
    typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)')?.matches;
  return inAppRegex.test(ua) || Boolean(standalone);
};

const shouldFallbackToRedirect = (error) => {
  const code = error?.code ?? '';
  return [
    'auth/popup-blocked',
    'auth/popup-closed-by-user',
    'auth/cancelled-popup-request',
    'auth/operation-not-supported-in-this-environment',
  ].includes(code);
};

export function initLoginButtons({
  googleButton,
  githubButton,
  statusElement,
  loginGooglePopup,
  loginGoogleRedirect,
  loginGithubPopup,
  loginGithubRedirect,
  handleRedirectResult,
  isEmbeddedBrowser = defaultIsEmbeddedBrowser,
}) {

  const hasGoogle = Boolean(googleButton)
  const hasGithub = Boolean(githubButton)

  if (hasGoogle && (!statusElement)) { // || !githubButton
    throw new Error('google status element is required; disable google login if not used.');
  }

  if (
    !loginGooglePopup ||
    !loginGoogleRedirect ||
    !handleRedirectResult
  ) {
    throw new Error('google handlers + redirect handler are required; disable google login if not used.');
  }

  if (hasGithub && (!loginGithubPopup || !loginGithubRedirect)) {
    throw new Error('github handlers are required; disable github login if not used.');
  }

  const setStatus = (message, tone) => {
    statusElement.textContent = message;
    statusElement.dataset.tone = tone;
  };

  const formatUserLabel = (user) => user?.displayName || user?.email || 'gebruiker';

  const startRedirect = (providerLabel, redirectFn) => {
    setStatus(`${providerLabel} logging in...`, 'pending');
    return redirectFn().catch(() => {
      setStatus(
        `${providerLabel} login failed, permission required. (check browser settings)`,
        'error',
      );
    });
  };

  const startPopup = (providerLabel, popupFn, redirectFn) => {
    if (isEmbeddedBrowser()) {
      return startRedirect(providerLabel, redirectFn);
    }

    setStatus(`${providerLabel} logging in...`, 'pending');
    return popupFn()
      .then((user) => {
        if (user) {
          setStatus(`Ingelogd als ${formatUserLabel(user)}.`, 'success');
        }
      })
      .catch((error) => {
        if (shouldFallbackToRedirect(error)) {
          return startRedirect(providerLabel, redirectFn);
        }
        setStatus(`${providerLabel} login failed.`, 'error');
      });
  };

  googleButton.addEventListener('click', () =>
    startPopup('Google', loginGooglePopup, loginGoogleRedirect),
  );

  githubButton.addEventListener('click', () =>
    startPopup('GitHub', loginGithubPopup, loginGithubRedirect),
  );

  return handleRedirectResult().then((result) => {
    if (result?.user) {
      setStatus(`logged in as ${formatUserLabel(result.user)}.`, 'success');
      return;
    }

    if (result?.error) {
      setStatus('Redirect failed.', 'error');
    }
  });
}
