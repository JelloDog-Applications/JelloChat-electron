(function () {
  const TOKEN_KEY = 'jellochat_token';

  const tokenForm = document.getElementById('setup-token-form');
  const tokenInput = document.getElementById('setup-token-input');
  const choiceView = document.getElementById('setup-choice-view');
  const choiceFreshBtn = document.getElementById('setup-choice-fresh-btn');
  const choiceRestoreBtn = document.getElementById('setup-choice-restore-btn');
  const restoreForm = document.getElementById('setup-restore-form');
  const restoreFileInput = document.getElementById('setup-restore-file');
  const restoreBackBtn = document.getElementById('setup-restore-back-btn');
  const stepsRow = document.querySelector('.setup-steps');
  const adminForm = document.getElementById('setup-admin-form');
  const adminUsername = document.getElementById('setup-admin-username');
  const adminEmail = document.getElementById('setup-admin-email');
  const adminPassword = document.getElementById('setup-admin-password');
  const adminPasswordConfirm = document.getElementById('setup-admin-password-confirm');
  const serverForm = document.getElementById('setup-server-form');
  const instanceNameInput = document.getElementById('setup-instance-name');
  const serverNameInput = document.getElementById('setup-server-name');
  const smtpForm = document.getElementById('setup-smtp-form');
  const smtpSkipBtn = document.getElementById('setup-smtp-skip');
  const smtpHost = document.getElementById('setup-smtp-host');
  const smtpPort = document.getElementById('setup-smtp-port');
  const smtpUser = document.getElementById('setup-smtp-user');
  const smtpPass = document.getElementById('setup-smtp-pass');
  const smtpFromEmail = document.getElementById('setup-smtp-from-email');
  const smtpFromName = document.getElementById('setup-smtp-from-name');
  const livekitForm = document.getElementById('setup-livekit-form');
  const livekitSkipBtn = document.getElementById('setup-livekit-skip');
  const livekitUrl = document.getElementById('setup-livekit-url');
  const livekitKey = document.getElementById('setup-livekit-key');
  const livekitSecret = document.getElementById('setup-livekit-secret');
  const discordForm = document.getElementById('setup-discord-form');
  const discordSkipBtn = document.getElementById('setup-discord-skip');
  const discordToken = document.getElementById('setup-discord-token');
  const discordClientId = document.getElementById('setup-discord-client-id');
  const messageEl = document.getElementById('setup-message');
  const stepForms = [tokenForm, adminForm, serverForm, smtpForm, livekitForm, discordForm];
  const stepDots = [
    document.getElementById('setup-step-dot-1'),
    document.getElementById('setup-step-dot-2'),
    document.getElementById('setup-step-dot-3'),
    document.getElementById('setup-step-dot-4'),
    document.getElementById('setup-step-dot-5'),
    document.getElementById('setup-step-dot-6')
  ];

  let verifiedToken = '';
  let defaultServerChoice = { action: 'keep', name: '' };
  let smtpChoice = null;
  let livekitChoice = null;
  let discordChoice = null;

  function setMessage(text, isError) {
    messageEl.textContent = text || '';
    messageEl.style.color = isError ? 'var(--danger)' : 'var(--muted)';
  }

  function goToStep(step) {
    if (choiceView) {
      choiceView.classList.add('auth-hidden');
    }
    if (restoreForm) {
      restoreForm.classList.add('auth-hidden');
    }
    if (stepsRow) {
      stepsRow.classList.remove('auth-hidden');
    }
    stepForms.forEach((form, index) => {
      if (form) {
        form.classList.toggle('auth-hidden', index !== step - 1);
      }
    });
    stepDots.forEach((dot, index) => {
      if (dot) {
        dot.classList.toggle('setup-step-dot-active', index === step - 1);
      }
    });
  }

  function showChoiceView() {
    stepForms.forEach((form) => {
      if (form) {
        form.classList.add('auth-hidden');
      }
    });
    if (restoreForm) {
      restoreForm.classList.add('auth-hidden');
    }
    if (stepsRow) {
      stepsRow.classList.add('auth-hidden');
    }
    if (choiceView) {
      choiceView.classList.remove('auth-hidden');
    }
    setMessage('', false);
  }

  function showRestoreView() {
    stepForms.forEach((form) => {
      if (form) {
        form.classList.add('auth-hidden');
      }
    });
    if (choiceView) {
      choiceView.classList.add('auth-hidden');
    }
    if (stepsRow) {
      stepsRow.classList.add('auth-hidden');
    }
    if (restoreForm) {
      restoreForm.classList.remove('auth-hidden');
    }
    setMessage('', false);
  }

  async function postJson(url, body) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    return { status: response.status, data };
  }

  function setupPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.password-toggle-btn');
    for (const button of toggleButtons) {
      const targetId = button.getAttribute('data-target');
      const input = targetId ? document.getElementById(targetId) : null;
      if (!input) {
        continue;
      }
      button.addEventListener('click', () => {
        const nextType = input.type === 'password' ? 'text' : 'password';
        input.type = nextType;
        const isVisible = nextType !== 'password';
        button.classList.toggle('is-visible', isVisible);
        button.setAttribute('aria-label', isVisible ? 'Hide password' : 'Show password');
        const icon = button.querySelector('i');
        if (icon) {
          icon.className = isVisible ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
        }
      });
    }
  }

  async function checkExistingStatus() {
    try {
      const response = await fetch('/api/setup/status');
      const data = await response.json();
      if (data?.completed) {
        window.location.href = '/app';
      }
    } catch (_error) {
      // If the status check fails, just let the wizard proceed normally.
    }
  }

  async function finishSetup() {
    setMessage('Finishing setup...', false);
    try {
      const { status, data } = await postJson('/api/setup/complete', {
        token: verifiedToken,
        username: adminUsername.value.trim(),
        email: adminEmail.value.trim(),
        password: adminPassword.value,
        instanceName: instanceNameInput.value.trim(),
        defaultServer: defaultServerChoice,
        smtp: smtpChoice,
        livekit: livekitChoice,
        discord: discordChoice
      });
      if (status !== 200 || !data.ok) {
        setMessage(data.message || 'Setup failed.', true);
        return;
      }
      if (data.realtimeToken) {
        localStorage.setItem(TOKEN_KEY, data.realtimeToken);
      }
      setMessage('Setup complete! Redirecting...', false);
      window.location.href = '/app';
    } catch (error) {
      setMessage(`Request failed: ${error.message}`, true);
    }
  }

  tokenForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = tokenInput.value.trim();
    if (!token) {
      return;
    }
    setMessage('Checking token...', false);
    try {
      const { status, data } = await postJson('/api/setup/verify-token', { token });
      if (status !== 200 || !data.ok) {
        setMessage(data.message || 'Invalid setup token.', true);
        return;
      }
      verifiedToken = token;
      setMessage('', false);
      showChoiceView();
    } catch (error) {
      setMessage(`Request failed: ${error.message}`, true);
    }
  });

  choiceFreshBtn.addEventListener('click', () => {
    goToStep(2);
  });

  choiceRestoreBtn.addEventListener('click', () => {
    showRestoreView();
  });

  restoreBackBtn.addEventListener('click', () => {
    showChoiceView();
  });

  restoreForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const file = restoreFileInput.files[0];
    if (!file) {
      setMessage('Choose a backup archive (.zip) to restore.', true);
      return;
    }
    setMessage('Restoring... this may take a while, do not close this page.', false);
    try {
      const formData = new FormData();
      formData.append('archive', file);
      formData.append('token', verifiedToken);
      const response = await fetch('/api/setup/restore', { method: 'POST', body: formData });
      const data = await response.json().catch(() => ({}));
      if (response.status !== 200 || !data.ok) {
        setMessage(data.message || 'Restore failed.', true);
        return;
      }
      setMessage('Restore complete! Redirecting to login...', false);
      window.location.href = '/app';
    } catch (error) {
      setMessage(`Request failed: ${error.message}`, true);
    }
  });

  adminForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (adminUsername.value.trim().length < 2) {
      setMessage('Username must be at least 2 characters.', true);
      return;
    }
    if (adminPassword.value.length < 6) {
      setMessage('Password must be at least 6 characters.', true);
      return;
    }
    if (adminPassword.value !== adminPasswordConfirm.value) {
      setMessage('Passwords do not match.', true);
      return;
    }
    setMessage('', false);
    goToStep(3);
  });

  serverForm.querySelectorAll('input[name="setup-server-action"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      serverNameInput.classList.toggle('auth-hidden', radio.value !== 'rename' || !radio.checked);
    });
  });

  serverForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const instanceName = instanceNameInput.value.trim();
    if (instanceName && instanceName.length < 2) {
      setMessage('Server display name must be at least 2 characters.', true);
      return;
    }
    const selected = serverForm.querySelector('input[name="setup-server-action"]:checked');
    const action = selected ? selected.value : 'keep';
    const name = serverNameInput.value.trim();
    if (action === 'rename' && name.length < 2) {
      setMessage('Server name must be at least 2 characters.', true);
      return;
    }
    defaultServerChoice = { action, name };
    setMessage('', false);
    goToStep(4);
  });

  smtpForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const host = smtpHost.value.trim();
    const user = smtpUser.value.trim();
    const pass = smtpPass.value.trim();
    const fromEmail = smtpFromEmail.value.trim();
    const anyFilled = host || user || pass || fromEmail;
    if (anyFilled && (!host || !user || !pass || !fromEmail)) {
      setMessage('SMTP host, username, password, and from-email are all required if SMTP is being configured.', true);
      return;
    }
    smtpChoice = anyFilled
      ? { host, port: Number(smtpPort.value) || 587, user, pass, fromEmail, fromName: smtpFromName.value.trim() }
      : null;
    setMessage('', false);
    goToStep(5);
  });

  smtpSkipBtn.addEventListener('click', () => {
    smtpChoice = null;
    setMessage('', false);
    goToStep(5);
  });

  livekitForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const url = livekitUrl.value.trim();
    const apiKey = livekitKey.value.trim();
    const apiSecret = livekitSecret.value.trim();
    const anyFilled = url || apiKey || apiSecret;
    if (anyFilled && (!url || !apiKey || !apiSecret)) {
      setMessage('LiveKit URL, API key, and API secret are all required if LiveKit is being configured.', true);
      return;
    }
    livekitChoice = anyFilled ? { url, apiKey, apiSecret } : null;
    setMessage('', false);
    goToStep(6);
  });

  livekitSkipBtn.addEventListener('click', () => {
    livekitChoice = null;
    setMessage('', false);
    goToStep(6);
  });

  discordForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const botToken = discordToken.value.trim();
    const clientId = discordClientId.value.trim();
    discordChoice = (botToken || clientId) ? { botToken, clientId } : null;
    finishSetup();
  });

  discordSkipBtn.addEventListener('click', () => {
    discordChoice = null;
    finishSetup();
  });

  setupPasswordToggles();
  checkExistingStatus();
})();
