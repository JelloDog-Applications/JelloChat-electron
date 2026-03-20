

const ui = {
  appShell: document.querySelector('.app-shell'),
  authPanel: document.getElementById('auth-panel'),
  chatPanel: document.getElementById('chat-panel'),
  authMessage: document.getElementById('auth-message'),
  showLoginBtn: document.getElementById('show-login'),
  showRegisterBtn: document.getElementById('show-register'),
  loginForm: document.getElementById('login-form'),
  registerForm: document.getElementById('register-form'),
  loginEmail: document.getElementById('login-email'),
  loginPassword: document.getElementById('login-password'),
  rememberMe: document.getElementById('remember-me'),
  registerUsername: document.getElementById('register-username'),
  registerEmail: document.getElementById('register-email'),
  registerPassword: document.getElementById('register-password'),
  registerDob: document.getElementById('register-dob'),
  acceptTosCheckbox: document.getElementById('accept-tos'),
  acceptPrivacyCheckbox: document.getElementById('accept-privacy'),
  viewTosBtn: document.getElementById('view-tos-btn'),
  viewPrivacyBtn: document.getElementById('view-privacy-btn'),
  resendVerificationBtn: document.getElementById('resend-verification-btn'),
  forgotPasswordBtn: document.getElementById('forgot-password-btn'),
  verifyTokenBtn: document.getElementById('verify-token-btn'),
  serversList: document.getElementById('servers-list'),
  serverOptionsMenu: document.getElementById('server-options-menu'),
  serverTabGeneral: document.getElementById('server-tab-general'),
  serverTabBanned: document.getElementById('server-tab-banned'),
  serverPanelGeneral: document.getElementById('server-panel-general'),
  serverPanelBanned: document.getElementById('server-panel-banned'),
  serverNameInput: document.getElementById('server-name-input'),
  saveServerNameBtn: document.getElementById('save-server-name-btn'),
  bannedUsersList: document.getElementById('banned-users-list'),
  leaveServerBtn: document.getElementById('leave-server-btn'),
  channelsList: document.getElementById('channels-list'),
  serverTitle: document.getElementById('server-title'),
  channelTitle: document.getElementById('channel-title'),
  vcPanel: document.getElementById('vc-panel'),
  vcRoomTitle: document.getElementById('vc-room-title'),
  vcStatus: document.getElementById('vc-status'),
  vcAudioSink: document.getElementById('vc-audio-sink'),
  vcMuteBtn: document.getElementById('vc-mute-btn'),
  vcDeafenBtn: document.getElementById('vc-deafen-btn'),
  vcCloseBtn: document.getElementById('vc-close-btn'),
  vcParticipantsList: document.getElementById('vc-participants-list'),
  messagesList: document.getElementById('messages-list'),
  mobileServersToggle: document.getElementById('mobile-servers-toggle'),
  mobileUsersToggle: document.getElementById('mobile-users-toggle'),
  mobileDrawerBackdrop: document.getElementById('mobile-drawer-backdrop'),
  onlineUsersList: document.getElementById('online-users-list'),
  friendsList: document.getElementById('friends-list'),
  userOptionsMenu: document.getElementById('user-options-menu'),
  kickUserBtn: document.getElementById('kick-user-btn'),
  banUserBtn: document.getElementById('ban-user-btn'),
  messageForm: document.getElementById('message-form'),
  messageInput: document.getElementById('message-input'),
  logoutBtn: document.getElementById('logout-btn'),
  createServerBtn: document.getElementById('create-server-btn'),
  addFriendBtn: document.getElementById('add-friend-btn'),
  friendRequestsBtn: document.getElementById('friend-requests-btn'),
  friendRequestsModal: document.getElementById('friend-requests-modal'),
  friendRequestsCloseBtn: document.getElementById('friend-requests-close-btn'),
  friendRequestsList: document.getElementById('friend-requests-list'),
  joinInviteBtn: document.getElementById('join-invite-btn'),
  createInviteBtn: document.getElementById('create-invite-btn'),
  createChannelBtn: document.getElementById('create-channel-btn'),
  accountUsername: document.getElementById('account-username'),
  accountEmail: document.getElementById('account-email'),
  accountSettingsBtn: document.getElementById('account-settings-btn'),
  accountSettingsMenu: document.getElementById('account-settings-menu'),
  accountMyAccountBtn: document.getElementById('account-my-account-btn'),
  accountModal: document.getElementById('account-modal'),
  accountModalCloseBtn: document.getElementById('account-modal-close-btn'),
  accountForm: document.getElementById('account-form'),
  accountUsernameInput: document.getElementById('account-username-input'),
  accountEmailInput: document.getElementById('account-email-input'),
  accountCurrentPasswordInput: document.getElementById('account-current-password-input'),
  accountNewPasswordInput: document.getElementById('account-new-password-input'),
  accountDobInput: document.getElementById('account-dob-input'),
  accountFormMessage: document.getElementById('account-form-message'),
  accountDeleteBtn: document.getElementById('account-delete-btn'),
  dobModal: document.getElementById('dob-modal'),
  dobForm: document.getElementById('dob-form'),
  dobInput: document.getElementById('dob-input'),
  dobFormMessage: document.getElementById('dob-form-message'),
  appDialog: document.getElementById('app-dialog'),
  appDialogTitle: document.getElementById('app-dialog-title'),
  appDialogMessage: document.getElementById('app-dialog-message'),
  appDialogInput: document.getElementById('app-dialog-input'),
  appDialogCancelBtn: document.getElementById('app-dialog-cancel-btn'),
  appDialogOkBtn: document.getElementById('app-dialog-ok-btn')
};

const state = {
  user: null,
  servers: [],
  channels: [],
  selectedServerId: null,
  selectedChannelId: null,
  selectedDmUser: null,
  currentUserId: null,
  ws: null,
  wsConfig: null,
  subscribedChannelId: null,
  realtimeToken: null,
  canCreateChannels: false,
  onlineUsers: [],
  friends: [],
  mobileServersOpen: false,
  mobileUsersOpen: false,
  serverOptionsServerId: null,
  selectedModerationUserId: null,
  serverOptionsTab: 'general',
  bannedUsers: [],
  activeVoiceChannelId: null,
  voiceRoom: null,
  voiceAudioEls: new Map(),
  voiceActiveSpeakerIds: new Set(),
  isVoiceMuted: false,
  isVoiceDeafened: false,
  isDobRequired: false
};

const dialogState = {
  resolver: null
};

let authSwitchTimer = null;

function getSelectedChannel() {
  return state.channels.find((channel) => channel.id === state.selectedChannelId) || null;
}

function shouldShowVoicePanel() {
  return Boolean(state.voiceRoom && state.activeVoiceChannelId);
}

function syncVoicePanelVisibility() {
  ui.vcPanel.classList.toggle('hidden', !shouldShowVoicePanel());
}

function pickDefaultChannelId(channels) {
  if (!channels.length) {
    return null;
  }
  const textChannel = channels.find((channel) => channel.type !== 'voice');
  return (textChannel || channels[0]).id;
}

function getParticipantDisplayName(participant) {
  let metadataName = null;
  if (participant?.metadata) {
    try {
      metadataName = JSON.parse(participant.metadata || '{}')?.username || null;
    } catch (_error) {
      metadataName = null;
    }
  }
  return participant?.name || metadataName || participant?.identity || 'Unknown';
}

function isParticipantMuted(participant) {
  const publications = Array.from(participant.audioTrackPublications?.values?.() || []);
  if (!publications.length) {
    return true;
  }
  return publications.every((pub) => pub.isMuted);
}

function renderVoiceParticipants() {
  ui.vcParticipantsList.innerHTML = '';
  if (!state.voiceRoom) {
    const item = document.createElement('li');
    item.textContent = 'Not connected.';
    ui.vcParticipantsList.appendChild(item);
    return;
  }

  const participants = [state.voiceRoom.localParticipant, ...Array.from(state.voiceRoom.remoteParticipants.values())];
  if (!participants.length) {
    const item = document.createElement('li');
    item.textContent = 'No one is in this VC yet.';
    ui.vcParticipantsList.appendChild(item);
    return;
  }

  for (const participant of participants) {
    const item = document.createElement('li');
    item.className = 'vc-participant';
    if (state.voiceActiveSpeakerIds.has(participant.identity)) {
      item.classList.add('vc-speaking');
    }

    const name = document.createElement('span');
    name.textContent = getParticipantDisplayName(participant);

    const badges = document.createElement('span');
    badges.className = 'vc-badges';
    const parts = [];
    if (participant.isLocal) {
      parts.push('You');
      if (state.isVoiceMuted) {
        parts.push('Muted');
      }
      if (state.isVoiceDeafened) {
        parts.push('Deafened');
      }
    } else if (isParticipantMuted(participant)) {
      parts.push('Muted');
    }
    badges.textContent = parts.join(' · ');

    item.append(name, badges);
    ui.vcParticipantsList.appendChild(item);
  }
}

function setVcStatus(message) {
  ui.vcStatus.textContent = message;
}

function canUseMicrophoneApi() {
  const hasMediaDevices = typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
  const isLocalhost =
    typeof location !== 'undefined' &&
    (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '::1');
  const secureOk = typeof window !== 'undefined' ? window.isSecureContext || isLocalhost : false;
  return Boolean(hasMediaDevices && secureOk);
}

function updateVoiceButtons() {
  ui.vcMuteBtn.classList.toggle('vc-control-on', state.isVoiceMuted);
  ui.vcDeafenBtn.classList.toggle('vc-control-on', state.isVoiceDeafened);
  ui.vcMuteBtn.textContent = state.isVoiceMuted ? 'Unmute' : 'Mute';
  ui.vcDeafenBtn.textContent = state.isVoiceDeafened ? 'Undeafen' : 'Deafen';
}

function detachAllVoiceAudio() {
  for (const [, audioEl] of state.voiceAudioEls) {
    try {
      audioEl.remove();
    } catch (_error) {
    }
  }
  state.voiceAudioEls.clear();
}

function setAudioSinkMuted(muted) {
  for (const [, audioEl] of state.voiceAudioEls) {
    audioEl.muted = muted;
  }
}

function attachRemoteAudio(track, participant) {
  if (track.kind !== 'audio') {
    return;
  }

  const key = `${participant.identity}:${track.sid}`;
  if (state.voiceAudioEls.has(key)) {
    return;
  }

  const audioEl = track.attach();
  audioEl.autoplay = true;
  audioEl.playsInline = true;
  audioEl.muted = state.isVoiceDeafened;
  ui.vcAudioSink.appendChild(audioEl);
  state.voiceAudioEls.set(key, audioEl);
}

function detachRemoteAudio(track, participant) {
  if (!track || track.kind !== 'audio') {
    return;
  }
  const key = `${participant.identity}:${track.sid}`;
  const audioEl = state.voiceAudioEls.get(key);
  if (!audioEl) {
    return;
  }
  try {
    track.detach(audioEl);
  } catch (_error) {
  }
  audioEl.remove();
  state.voiceAudioEls.delete(key);
}

function wireRoomEvents(room) {
  const RoomEvent = window.LivekitClient?.RoomEvent;
  if (!RoomEvent) {
    return;
  }

  room.on(RoomEvent.ParticipantConnected, () => renderVoiceParticipants());
  room.on(RoomEvent.ParticipantDisconnected, () => renderVoiceParticipants());
  room.on(RoomEvent.TrackMuted, () => renderVoiceParticipants());
  room.on(RoomEvent.TrackUnmuted, () => renderVoiceParticipants());
  room.on(RoomEvent.LocalTrackPublished, () => renderVoiceParticipants());
  room.on(RoomEvent.LocalTrackUnpublished, () => renderVoiceParticipants());
  room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
    state.voiceActiveSpeakerIds = new Set((speakers || []).map((participant) => participant.identity));
    renderVoiceParticipants();
  });
  room.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
    attachRemoteAudio(track, participant);
    renderVoiceParticipants();
  });
  room.on(RoomEvent.TrackUnsubscribed, (track, _publication, participant) => {
    detachRemoteAudio(track, participant);
    renderVoiceParticipants();
  });
  room.on(RoomEvent.Disconnected, () => {
    if (state.voiceRoom === room) {
      leaveVoiceView(false);
      ui.channelTitle.textContent = 'Voice disconnected.';
    }
  });
}

function leaveVoiceView(disconnect = true) {
  if (disconnect && state.voiceRoom) {
    try {
      state.voiceRoom.disconnect();
    } catch (_error) {
    }
  }
  state.voiceRoom = null;
  detachAllVoiceAudio();
  state.voiceActiveSpeakerIds = new Set();
  state.isVoiceMuted = false;
  state.isVoiceDeafened = false;
  updateVoiceButtons();
  setVcStatus('Not connected');
  renderVoiceParticipants();
  state.activeVoiceChannelId = null;
  syncVoicePanelVisibility();
}

function renderAccountPanel() {
  ui.accountUsername.textContent = state.user?.username || 'User';
  ui.accountEmail.textContent = state.user?.email || '';
}

function closeAccountSettingsMenu() {
  ui.accountSettingsMenu.classList.add('hidden');
}

function toggleAccountSettingsMenu() {
  ui.accountSettingsMenu.classList.toggle('hidden');
}

function setAccountFormMessage(message, isError = false) {
  ui.accountFormMessage.textContent = message;
  ui.accountFormMessage.style.color = isError ? 'var(--danger)' : 'var(--muted)';
}

function setDobFormMessage(message, isError = false) {
  ui.dobFormMessage.textContent = message;
  ui.dobFormMessage.style.color = isError ? 'var(--danger)' : 'var(--muted)';
}

function normalizeDob(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : raw;
}

function isAtLeast13YearsOld(dateStr) {
  if (!dateStr) return false;
  const birth = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(birth.getTime())) return false;
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 13);
  return birth <= cutoff;
}

function userNeedsDob(user) {
  return !normalizeDob(user?.date_of_birth);
}

function animateShowOverlay(element) {
  if (!element) {
    return;
  }
  if (element.__popupTimer) {
    clearTimeout(element.__popupTimer);
    element.__popupTimer = null;
  }
  element.classList.remove('hidden');
  element.classList.remove('is-closing');
  element.classList.add('is-opening');
  element.__popupTimer = setTimeout(() => {
    element.classList.remove('is-opening');
    element.__popupTimer = null;
  }, 180);
}

function animateHideOverlay(element) {
  if (!element || element.classList.contains('hidden')) {
    return;
  }
  if (element.__popupTimer) {
    clearTimeout(element.__popupTimer);
    element.__popupTimer = null;
  }
  element.classList.remove('is-opening');
  element.classList.add('is-closing');
  element.__popupTimer = setTimeout(() => {
    element.classList.add('hidden');
    element.classList.remove('is-closing');
    element.__popupTimer = null;
  }, 150);
}

function closeAccountModal() {
  animateHideOverlay(ui.accountModal);
  setAccountFormMessage('');
  ui.accountCurrentPasswordInput.value = '';
  ui.accountNewPasswordInput.value = '';
}

function closeFriendRequestsModal() {
  animateHideOverlay(ui.friendRequestsModal);
  ui.friendRequestsList.innerHTML = '';
}

function openFriendRequestsModal() {
  animateShowOverlay(ui.friendRequestsModal);
}

function renderFriendRequests(requests) {
  ui.friendRequestsList.innerHTML = '';
  if (!requests.length) {
    const empty = document.createElement('div');
    empty.className = 'friend-request-email';
    empty.textContent = 'No pending friend requests.';
    ui.friendRequestsList.appendChild(empty);
    return;
  }

  for (const request of requests) {
    const row = document.createElement('div');
    row.className = 'friend-request-item';

    const meta = document.createElement('div');
    meta.className = 'friend-request-meta';
    meta.innerHTML = `<div class="friend-request-name">${request.username}</div>`;

    const acceptBtn = document.createElement('button');
    acceptBtn.className = 'friend-request-action friend-request-accept';
    acceptBtn.type = 'button';
    acceptBtn.title = 'Accept';
    acceptBtn.textContent = '+';
    acceptBtn.addEventListener('click', async () => {
      const result = await window.api.friends.respondRequest({ requestId: request.id, action: 'accept' });
      if (!result.ok) {
        ui.channelTitle.textContent = result.message;
        return;
      }
      const next = await window.api.friends.getRequests();
      if (next.ok) {
        renderFriendRequests(next.requests || []);
      }
      await loadFriends();
      ui.channelTitle.textContent = 'Friend request accepted.';
    });

    const rejectBtn = document.createElement('button');
    rejectBtn.className = 'friend-request-action friend-request-reject';
    rejectBtn.type = 'button';
    rejectBtn.title = 'Reject';
    rejectBtn.textContent = 'Ã¢Å Ëœ';
    rejectBtn.addEventListener('click', async () => {
      const result = await window.api.friends.respondRequest({ requestId: request.id, action: 'reject' });
      if (!result.ok) {
        ui.channelTitle.textContent = result.message;
        return;
      }
      const next = await window.api.friends.getRequests();
      if (next.ok) {
        renderFriendRequests(next.requests || []);
      }
      ui.channelTitle.textContent = 'Friend request rejected.';
    });

    row.append(meta, acceptBtn, rejectBtn);
    ui.friendRequestsList.appendChild(row);
  }
}

function openAccountModal() {
  ui.accountUsernameInput.value = state.user?.username || '';
  ui.accountEmailInput.value = state.user?.email || '';
  ui.accountDobInput.value = normalizeDob(state.user?.date_of_birth);
  ui.accountCurrentPasswordInput.value = '';
  ui.accountNewPasswordInput.value = '';
  setAccountFormMessage('');
  animateShowOverlay(ui.accountModal);
}

function openDobModal() {
  if (!ui.dobModal) {
    return;
  }
  ui.dobInput.value = normalizeDob(state.user?.date_of_birth);
  setDobFormMessage('');
  animateShowOverlay(ui.dobModal);
}

function closeDobModal() {
  if (!ui.dobModal) {
    return;
  }
  animateHideOverlay(ui.dobModal);
}

async function enforceDobIfMissing() {
  if (!userNeedsDob(state.user)) {
    state.isDobRequired = false;
    closeDobModal();
    return true;
  }
  state.isDobRequired = true;
  openDobModal();
  return false;
}

async function openVoiceView(roomLabel, channelId, tokenData) {
  const sdk = window.LivekitClient;
  if (!sdk) {
    setVcStatus('Voice SDK failed to load.');
    ui.channelTitle.textContent = 'Voice SDK failed to load.';
    return;
  }

  const { Room } = sdk;
  if (!Room) {
    setVcStatus('Voice SDK unavailable.');
    ui.channelTitle.textContent = 'Voice SDK unavailable.';
    return;
  }

  if (state.voiceRoom) {
    leaveVoiceView();
  }

  ui.channelTitle.textContent = `Connecting to ${roomLabel}...`;
  updateVoiceButtons();

  try {
    const room = new LivekitClient.Room({
      adaptiveStream: true,
      dynacast: true,
    });

    wireRoomEvents(room);

    await room.connect(tokenData.livekitUrl, tokenData.token, {
      autoSubscribe: true,
    });

    state.voiceRoom = room;
    state.activeVoiceChannelId = channelId;

    ui.vcRoomTitle.textContent = roomLabel;
    syncVoicePanelVisibility();

    state.isVoiceMuted = true;
    updateVoiceButtons();
    renderVoiceParticipants();

    let vcStatus = `Connected to ${roomLabel}`;

    if (canUseMicrophoneApi()) {
      try {
        const audioTrack = await LivekitClient.createLocalAudioTrack({
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        });
        await room.localParticipant.publishTrack(audioTrack);
        state.isVoiceMuted = false;
      } catch (micError) {
        state.isVoiceMuted = true;
        vcStatus = `Connected to ${roomLabel} (listen-only: ${micError.message})`;
      }
    } else {
      vcStatus = `Connected to ${roomLabel} (listen-only: use HTTPS or localhost for mic)`;
    }

    setVcStatus(vcStatus);
    updateVoiceButtons();
    renderVoiceParticipants();

  } catch (error) {
    state.voiceRoom = null;
    state.activeVoiceChannelId = null;
    syncVoicePanelVisibility();

    const iss = tokenData?.debug?.iss ? ` iss=${tokenData.debug.iss}` : '';
    const room = tokenData?.debug?.room ? ` room=${tokenData.debug.room}` : '';
    const url = tokenData?.livekitUrl ? ` url=${tokenData.livekitUrl}` : '';

    setVcStatus(`Failed to join voice: ${error.message}${iss}${room}${url}`);
    ui.channelTitle.textContent = `Failed to join VC: ${error.message}`;

    renderVoiceParticipants();
  }
}

function setAuthMessage(message, isError = false) {
  ui.authMessage.textContent = message;
  ui.authMessage.style.color = isError ? 'var(--danger)' : 'var(--muted)';
}

function closeAppDialog() {
  animateHideOverlay(ui.appDialog);
  ui.appDialogInput.classList.add('hidden');
  ui.appDialogInput.value = '';
}

function openAppDialog({ title, message, mode = 'alert', defaultValue = '', okLabel = 'OK', cancelLabel = 'Cancel', html = false }) {
  if (dialogState.resolver) {
    dialogState.resolver(null);
    dialogState.resolver = null;
  }

  ui.appDialogTitle.textContent = title || 'Dialog';
  if (html) {
    ui.appDialogMessage.innerHTML = message || '';
  } else {
    ui.appDialogMessage.textContent = message || '';
  }
  ui.appDialogOkBtn.textContent = okLabel;
  ui.appDialogCancelBtn.textContent = cancelLabel;

  const needsInput = mode === 'prompt';
  const needsCancel = mode !== 'alert';
  ui.appDialogInput.classList.toggle('hidden', !needsInput);
  if (needsInput) {
    ui.appDialogInput.value = defaultValue || '';
  }
  ui.appDialogCancelBtn.classList.toggle('hidden', !needsCancel);
  animateShowOverlay(ui.appDialog);
  if (needsInput) {
    ui.appDialogInput.focus();
    ui.appDialogInput.select();
  } else {
    ui.appDialogOkBtn.focus();
  }

  return new Promise((resolve) => {
    dialogState.resolver = resolve;
  });
}

async function showMessageDialog(title, message, options = {}) {
  const result = await openAppDialog({ title, message, mode: 'alert', okLabel: 'OK', ...options });
  return result;
}

async function showConfirmDialog(title, message, okLabel = 'OK', cancelLabel = 'Cancel') {
  const result = await openAppDialog({ title, message, mode: 'confirm', okLabel, cancelLabel });
  return result === true;
}

async function showPromptDialog(title, message, defaultValue = '') {
  const result = await openAppDialog({ title, message, mode: 'prompt', defaultValue, okLabel: 'Submit', cancelLabel: 'Cancel' });
  if (typeof result !== 'string') {
    return null;
  }
  return result;
}

function setupPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.password-toggle-btn');
  for (const button of toggleButtons) {
    const targetId = button.getAttribute('data-target');
    if (!targetId) {
      continue;
    }
    const input = document.getElementById(targetId);
    if (!input) {
      continue;
    }
    button.classList.toggle('is-visible', input.type !== 'password');
    button.addEventListener('click', () => {
      const nextType = input.type === 'password' ? 'text' : 'password';
      input.type = nextType;
      const isVisible = nextType !== 'password';
      button.classList.toggle('is-visible', isVisible);
      button.setAttribute('aria-label', nextType === 'password' ? 'Show password' : 'Hide password');
    });
  }
}

function showLogin() {
  ui.showLoginBtn.classList.add('tab-active');
  ui.showRegisterBtn.classList.remove('tab-active');
  switchAuthForms(ui.registerForm, ui.loginForm, 'left');
}

function showRegister() {
  ui.showRegisterBtn.classList.add('tab-active');
  ui.showLoginBtn.classList.remove('tab-active');
  switchAuthForms(ui.loginForm, ui.registerForm, 'right');
}

function resetAuthAnimationClasses(form) {
  form.classList.remove('auth-anim-out-left', 'auth-anim-out-right', 'auth-anim-in-left', 'auth-anim-in-right');
}

function switchAuthForms(fromForm, toForm, direction) {
  if (fromForm === toForm || !fromForm || !toForm) {
    return;
  }

  if (fromForm.classList.contains('auth-hidden')) {
    resetAuthAnimationClasses(fromForm);
    resetAuthAnimationClasses(toForm);
    toForm.classList.remove('auth-hidden');
    return;
  }

  if (authSwitchTimer) {
    clearTimeout(authSwitchTimer);
    authSwitchTimer = null;
  }

  const toOut = direction === 'left' ? 'auth-anim-out-right' : 'auth-anim-out-left';
  const toIn = direction === 'left' ? 'auth-anim-in-left' : 'auth-anim-in-right';

  resetAuthAnimationClasses(fromForm);
  resetAuthAnimationClasses(toForm);
  fromForm.classList.remove('auth-hidden');
  fromForm.classList.add(toOut);

  authSwitchTimer = setTimeout(() => {
    fromForm.classList.add('auth-hidden');
    resetAuthAnimationClasses(fromForm);

    toForm.classList.remove('auth-hidden');
    toForm.classList.add(toIn);

    authSwitchTimer = setTimeout(() => {
      resetAuthAnimationClasses(toForm);
      authSwitchTimer = null;
    }, 190);
  }, 170);
}

async function handleAuthDeepLinks() {
  const pathname = String(window.location.pathname || '');
  const params = new URLSearchParams(window.location.search || '');
  const token = String(params.get('token') || '').trim();
  const status = String(params.get('status') || '').trim().toLowerCase();
  const message = String(params.get('message') || '').trim();
  const verified = params.get('verified') === '1';

  if (pathname === '/verify-email' && (status || verified)) {
    openAuth();
    showLogin();

    const success = verified || status === 'success';
    const finalMessage =
      message ||
      (success ? 'Email verified successfully. You can log in now.' : 'Your verification link is invalid or expired.');

    setAuthMessage(finalMessage, !success);

    ui.authMessage.scrollIntoView({ block: 'nearest' });

    await showMessageDialog(
      success ? 'Email Verified' : 'Verification Failed',
      finalMessage
    );

    try {
      window.history.replaceState({}, '', '/');
    } catch (_error) {
    }

    if (success) {
      ui.loginEmailInput.focus();
    }
    return;
  }

  if (pathname === '/verify-email' && token) {
    openAuth();
    showLogin();

    const result = await window.api.auth.verifyEmail({ token });
    setAuthMessage(result.message || (result.ok ? 'Email verified successfully.' : 'Failed to verify email.'), !result.ok);

    await showMessageDialog(
      result.ok ? 'Email Verified' : 'Verification Failed',
      result.message || (result.ok ? 'Your email has been verified. You can log in now.' : 'Your verification link is invalid or expired.')
    );

    try {
      window.history.replaceState({}, '', '/');
    } catch (_error) {
    }

    if (result.ok) {
      ui.loginEmailInput.focus();
    }
    return;
  }

  if (pathname === '/reset-password' && token) {
    openAuth();
    showLogin();
    const newPassword = await showPromptDialog('Reset Password', 'Enter your new password (min 6 characters):', '');
    if (!newPassword) {
      setAuthMessage('Password reset canceled.', true);
      return;
    }

    const result = await window.api.auth.confirmPasswordReset({
      token,
      newPassword
    });
    setAuthMessage(result.message || (result.ok ? 'Password reset successfully.' : 'Failed to reset password.'), !result.ok);

    if (result.ok) {
      try {
        window.history.replaceState({}, '', '/');
      } catch (_error) {
      }
    }
  }
}

function openChat() {
  return new Promise((resolve) => {
    ui.authPanel.classList.add('auth-swipe-out');

    setTimeout(() => {
      ui.authPanel.classList.remove('auth-swipe-out');
      ui.authPanel.classList.add('hidden');
      ui.chatPanel.classList.remove('hidden');
      ui.chatPanel.classList.add('chat-swipe-in');
      ui.appShell.classList.add('chat-mode');

      setTimeout(() => {
        ui.chatPanel.classList.remove('chat-swipe-in');
      }, 260);

      resolve();
    }, 260);
  });
}

function openAuth() {
  ui.authPanel.classList.remove('hidden');
  ui.chatPanel.classList.add('hidden');
  ui.appShell.classList.remove('chat-mode');
  closeMobileDrawers();
  closeServerOptions();
  closeUserOptions();
  closeAccountSettingsMenu();
  closeAccountModal();
  closeFriendRequestsModal();
  closeDobModal();
  showLogin();
}

function animateLogoutTransition() {
  return new Promise((resolve) => {
    if (ui.chatPanel.classList.contains('hidden')) {
      openAuth();
      resolve();
      return;
    }

    ui.chatPanel.classList.add('chat-swipe-out');

    setTimeout(() => {
      ui.chatPanel.classList.remove('chat-swipe-out');
      ui.chatPanel.classList.add('hidden');
      ui.authPanel.classList.remove('hidden');
      ui.authPanel.classList.add('auth-swipe-in');
      ui.appShell.classList.remove('chat-mode');
      showLogin();

      setTimeout(() => {
        ui.authPanel.classList.remove('auth-swipe-in');
      }, 250);

      resolve();
    }, 240);
  });
}

async function performLogout(serverLogout = true) {
  await animateLogoutTransition();
  leaveVoiceView();
  if (serverLogout) {
    await window.api.auth.logout();
  }
  if (window.api.auth.setRemember && !ui.rememberMe.checked) {
    window.api.auth.setRemember(false);
  }
  if (state.ws) {
    state.ws.close();
  }

  state.user = null;
  state.servers = [];
  state.channels = [];
  state.selectedServerId = null;
  state.selectedChannelId = null;
  state.selectedDmUser = null;
  state.currentUserId = null;
  state.subscribedChannelId = null;
  state.realtimeToken = null;
  state.canCreateChannels = false;
  state.onlineUsers = [];
  state.friends = [];
  state.mobileServersOpen = false;
  state.mobileUsersOpen = false;
  state.serverOptionsServerId = null;
  state.selectedModerationUserId = null;
  state.activeVoiceChannelId = null;
  state.isDobRequired = false;

  ui.serversList.innerHTML = '';
  ui.channelsList.innerHTML = '';
  ui.messagesList.innerHTML = '';
  ui.onlineUsersList.innerHTML = '';
  ui.friendsList.innerHTML = '';
  ui.channelTitle.textContent = 'Select a channel';
  ui.serverTitle.textContent = 'Channels';
  updateChannelCreateButton();
  updateMobileDrawers();
  closeServerOptions();
  closeUserOptions();
  closeAccountSettingsMenu();
  closeAccountModal();
  closeFriendRequestsModal();
  closeDobModal();
  renderAccountPanel();
}

function updateChannelCreateButton() {
  const canCreate = Boolean(state.canCreateChannels && state.selectedServerId);
  ui.createChannelBtn.style.display = canCreate ? 'inline-flex' : 'none';
  ui.createInviteBtn.style.display = canCreate ? 'inline-flex' : 'none';
}

function updateMobileDrawers() {
  ui.chatPanel.classList.toggle('mobile-servers-open', state.mobileServersOpen);
  ui.chatPanel.classList.toggle('mobile-users-open', state.mobileUsersOpen);
}

function closeMobileDrawers() {
  state.mobileServersOpen = false;
  state.mobileUsersOpen = false;
  updateMobileDrawers();
}

function toggleMobileServersDrawer() {
  state.mobileServersOpen = !state.mobileServersOpen;
  if (state.mobileServersOpen) {
    state.mobileUsersOpen = false;
  }
  updateMobileDrawers();
}

function toggleMobileUsersDrawer() {
  state.mobileUsersOpen = !state.mobileUsersOpen;
  if (state.mobileUsersOpen) {
    state.mobileServersOpen = false;
  }
  updateMobileDrawers();
}

function closeServerOptions() {
  state.serverOptionsServerId = null;
  state.serverOptionsTab = 'general';
  state.bannedUsers = [];
  ui.serverOptionsMenu.classList.remove('open');
  ui.serverOptionsMenu.classList.add('hidden');
}

function setServerOptionsTab(tabName) {
  state.serverOptionsTab = tabName;
  const generalActive = tabName === 'general';
  ui.serverTabGeneral.classList.toggle('active', generalActive);
  ui.serverTabBanned.classList.toggle('active', !generalActive);
  ui.serverPanelGeneral.classList.toggle('hidden', !generalActive);
  ui.serverPanelBanned.classList.toggle('hidden', generalActive);
}

function renderBannedUsers() {
  ui.bannedUsersList.innerHTML = '';
  if (!state.bannedUsers.length) {
    const empty = document.createElement('div');
    empty.className = 'banned-user-meta';
    empty.textContent = 'No banned users.';
    ui.bannedUsersList.appendChild(empty);
    return;
  }

  for (const user of state.bannedUsers) {
    const item = document.createElement('div');
    item.className = 'banned-user-item';

    const meta = document.createElement('div');
    meta.innerHTML = `<div>${user.username}</div>`;

    const unbanBtn = document.createElement('button');
    unbanBtn.className = 'unban-btn';
    unbanBtn.type = 'button';
    unbanBtn.textContent = 'Unban';
    unbanBtn.addEventListener('click', async () => {
      const result = await window.api.chat.unbanMember({
        serverId: state.serverOptionsServerId,
        targetUserId: user.user_id
      });
      if (!result.ok) {
        ui.channelTitle.textContent = result.message;
        return;
      }
      await loadBannedUsers();
      ui.channelTitle.textContent = 'User unbanned.';
    });

    item.append(meta, unbanBtn);
    ui.bannedUsersList.appendChild(item);
  }
}

async function loadBannedUsers() {
  if (!state.serverOptionsServerId) {
    state.bannedUsers = [];
    renderBannedUsers();
    return;
  }

  const response = await window.api.chat.getBannedUsers({ serverId: state.serverOptionsServerId });
  if (!response.ok) {
    state.bannedUsers = [];
    renderBannedUsers();
    return;
  }
  state.bannedUsers = response.bannedUsers || [];
  renderBannedUsers();
}

function closeUserOptions() {
  state.selectedModerationUserId = null;
  ui.userOptionsMenu.classList.remove('open');
  ui.userOptionsMenu.classList.add('hidden');
}

function openServerOptions(serverId, buttonElement) {
  state.serverOptionsServerId = serverId;
  closeUserOptions();
  setServerOptionsTab('general');
  const selected = state.servers.find((s) => s.id === serverId);
  ui.serverNameInput.value = selected?.name || '';
  loadBannedUsers();
  const serverColumnRect = ui.serversList.closest('.servers-column').getBoundingClientRect();
  const buttonRect = buttonElement.getBoundingClientRect();

  const top = buttonRect.top - serverColumnRect.top;
  const left = buttonRect.right - serverColumnRect.left + 8;

  ui.serverOptionsMenu.style.top = `${top}px`;
  ui.serverOptionsMenu.style.left = `${left}px`;
  ui.serverOptionsMenu.classList.remove('hidden');
  requestAnimationFrame(() => {
    ui.serverOptionsMenu.classList.add('open');
  });
}

function openUserOptions(userId, buttonElement) {
  state.selectedModerationUserId = userId;
  const presenceColumnRect = ui.onlineUsersList.closest('.presence-column').getBoundingClientRect();
  const buttonRect = buttonElement.getBoundingClientRect();

  const top = buttonRect.top - presenceColumnRect.top;
  const left = buttonRect.left - presenceColumnRect.left - 160;

  ui.userOptionsMenu.style.top = `${Math.max(8, top)}px`;
  ui.userOptionsMenu.style.left = `${Math.max(8, left)}px`;
  ui.userOptionsMenu.classList.remove('hidden');
  requestAnimationFrame(() => {
    ui.userOptionsMenu.classList.add('open');
  });
}

function formatTime(input) {
  const d = new Date(input);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function sendRealtime(payload) {
  if (!state.ws || state.ws.readyState !== WebSocket.OPEN) {
    return;
  }
  state.ws.send(JSON.stringify(payload));
}

function subscribeToSelectedChannel() {
  if (!state.selectedChannelId || state.selectedDmUser) {
    return;
  }

  if (state.subscribedChannelId && state.subscribedChannelId !== state.selectedChannelId) {
    sendRealtime({ type: 'unsubscribe', channelId: state.subscribedChannelId });
  }

  state.subscribedChannelId = state.selectedChannelId;
  sendRealtime({ type: 'subscribe', channelId: state.selectedChannelId });
}

async function joinVoiceChannel(channel) {
  if (!state.selectedServerId) {
    ui.channelTitle.textContent = 'Select a server first.';
    return;
  }

  const connectionState = String(state.voiceRoom?.state || state.voiceRoom?.connectionState || '').toLowerCase();
  const isConnected = connectionState.includes('connected');
  if (state.voiceRoom && state.activeVoiceChannelId === channel.id && isConnected) {
    ui.channelTitle.textContent = `VC: ${channel.name}`;
    syncVoicePanelVisibility();
    return;
  }
  if (state.voiceRoom && !isConnected) {
    leaveVoiceView(false);
  }

  const result = await window.api.vc.getToken({
    serverId: state.selectedServerId,
    channelId: channel.id
  });
  if (!result.ok) {
    ui.channelTitle.textContent = result.message;
    return;
  }

  if (result.debug?.iss) {
    setVcStatus(`Token iss=${result.debug.iss} room=${result.debug.room || '-'}`);
  }

  ui.channelTitle.textContent = `VC: ${channel.name}`;
  await openVoiceView(`Voice Channel: ${channel.name}`, channel.id, result);
}

async function toggleVoiceMute() {
  if (!state.voiceRoom) {
    return;
  }
  if (!canUseMicrophoneApi()) {
    state.isVoiceMuted = true;
    updateVoiceButtons();
    setVcStatus('Microphone unavailable here. Use HTTPS or localhost.');
    return;
  }
  state.isVoiceMuted = !state.isVoiceMuted;
  const micEnabled = !state.isVoiceMuted && !state.isVoiceDeafened;
  await state.voiceRoom.localParticipant.setMicrophoneEnabled(micEnabled);
  updateVoiceButtons();
  renderVoiceParticipants();
}

async function toggleVoiceDeafen() {
  if (!state.voiceRoom) {
    return;
  }
  const micApiAvailable = canUseMicrophoneApi();
  state.isVoiceDeafened = !state.isVoiceDeafened;
  if (state.isVoiceDeafened) {
    state.isVoiceMuted = true;
  }
  const micEnabled = micApiAvailable && !state.isVoiceMuted && !state.isVoiceDeafened;
  await state.voiceRoom.localParticipant.setMicrophoneEnabled(micEnabled);
  if (!micApiAvailable) {
    state.isVoiceMuted = true;
    setVcStatus('Microphone unavailable here. Use HTTPS or localhost.');
  }
  setAudioSinkMuted(state.isVoiceDeafened);
  updateVoiceButtons();
  renderVoiceParticipants();
}

async function ensureRealtime(token) {
  state.realtimeToken = token;

  if (!state.wsConfig) {
    const configResult = await window.api.realtime.getConfig();
    if (!configResult.ok) {
      return;
    }
    state.wsConfig = configResult;
  }

  if (state.ws) {
    state.ws.close();
  }

  const baseWsUrl = state.wsConfig.wsUrl || `ws://127.0.0.1:${state.wsConfig.port}`;
  const url = `${baseWsUrl}?token=${encodeURIComponent(token)}`;
  state.ws = new WebSocket(url);

  state.ws.onopen = () => {
    subscribeToSelectedChannel();
  };

  state.ws.onmessage = async (event) => {
    let payload;
    try {
      payload = JSON.parse(event.data);
    } catch {
      return;
    }

    if (payload.type === 'server-created' || payload.type === 'server-membership-changed') {
      await loadServers(false);
    }

    if (payload.type === 'channel-created' && state.selectedServerId === payload.serverId) {
      await loadChannels(state.selectedServerId, false);
    }

    if (payload.type === 'presence-changed' && state.selectedServerId === payload.serverId) {
      await loadServerPresence(state.selectedServerId);
      await loadFriends();
    }

    if (payload.type === 'friends-changed' || payload.type === 'friend-requests-changed') {
      await loadFriends();
    }

    if (payload.type === 'dm-message-created' && state.selectedDmUser) {
      if (payload.fromUserId === state.selectedDmUser.id || payload.fromUserId === state.currentUserId) {
        await loadDmMessages(state.selectedDmUser.id, state.selectedDmUser.username);
      }
    }

    if (
      (payload.type === 'message-created' ||
        payload.type === 'message-updated' ||
        payload.type === 'message-deleted') &&
      state.selectedChannelId === payload.channelId
    ) {
      await loadMessages(state.selectedChannelId);
    }
  };

  state.ws.onclose = () => {
    state.ws = null;
    state.subscribedChannelId = null;
  };
}

function renderMessages(messages) {
  ui.messagesList.innerHTML = '';
  for (const msg of messages) {
    const wrapper = document.createElement('div');
    wrapper.className = `msg ${msg.user_id === state.currentUserId ? 'me' : ''}`;

    const meta = document.createElement('div');
    meta.className = 'msg-meta';

    const title = document.createElement('span');
    title.textContent = `${msg.username} Ã¢â‚¬Â¢ ${formatTime(msg.created_at)}`;
    meta.appendChild(title);

    if (msg.user_id === state.currentUserId) {
      const actions = document.createElement('div');
      actions.className = 'msg-actions';

      const editButton = document.createElement('button');
      editButton.className = 'msg-action-btn';
      editButton.type = 'button';
      editButton.textContent = 'Edit';
      editButton.addEventListener('click', async () => {
        const updated = await showPromptDialog('Edit Message', 'Update your message:', msg.content);
        if (updated === null) {
          return;
        }

        if (state.selectedDmUser) {
          ui.channelTitle.textContent = 'Editing DM messages is not supported yet.';
          return;
        }

        const result = await window.api.chat.updateMessage({
          messageId: msg.id,
          content: updated
        });

        if (!result.ok) {
          ui.channelTitle.textContent = result.message;
        }
      });

      const deleteButton = document.createElement('button');
      deleteButton.className = 'msg-action-btn';
      deleteButton.type = 'button';
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', async () => {
        const confirmed = await showConfirmDialog('Delete Message', 'Delete this message?', 'Delete', 'Cancel');
        if (!confirmed) {
          return;
        }

        if (state.selectedDmUser) {
          ui.channelTitle.textContent = 'Deleting DM messages is not supported yet.';
          return;
        }

        const result = await window.api.chat.deleteMessage({ messageId: msg.id });
        if (!result.ok) {
          ui.channelTitle.textContent = result.message;
        }
      });

      actions.append(editButton, deleteButton);
      meta.appendChild(actions);
    }

    const body = document.createElement('div');
    body.textContent = msg.content;

    wrapper.append(meta, body);
    ui.messagesList.appendChild(wrapper);
  }

  ui.messagesList.scrollTop = ui.messagesList.scrollHeight;
}

async function loadMessages(channelId) {
  const response = await window.api.chat.getMessages(channelId);
  if (!response.ok) {
    ui.channelTitle.textContent = response.message;
    return;
  }

  state.currentUserId = response.currentUserId;
  renderMessages(response.messages);
  subscribeToSelectedChannel();
}

async function loadDmMessages(partnerUserId, partnerUsername) {
  const response = await window.api.dm.getMessages({ partnerUserId });
  if (!response.ok) {
    ui.channelTitle.textContent = response.message;
    return;
  }

  state.selectedDmUser = { id: partnerUserId, username: partnerUsername || response.partner?.username || 'User' };
  state.selectedChannelId = null;
  state.currentUserId = response.currentUserId;
  ui.channelTitle.textContent = `@ ${state.selectedDmUser.username}`;
  renderMessages(response.messages || []);
  syncVoicePanelVisibility();
}

function renderChannels() {
  ui.channelsList.innerHTML = '';
  for (const channel of state.channels) {
    const channelType = String(channel.type || 'text').toLowerCase();
    const item = document.createElement('li');
    const button = document.createElement('button');
    const label = channelType === 'voice' ? `VC ${channel.name}` : `# ${channel.name}`;
    button.textContent = label;
    if (channel.id === state.selectedChannelId) {
      button.classList.add('active');
    }

    button.addEventListener('click', async () => {
      state.selectedChannelId = channel.id;
      state.selectedDmUser = null;
      renderChannels();
      if (channelType === 'voice') {
        state.subscribedChannelId = null;
        await joinVoiceChannel(channel);
        await loadMessages(channel.id);
      } else {
        ui.channelTitle.textContent = `# ${channel.name}`;
        await loadMessages(channel.id);
      }
      if (window.innerWidth <= 700) {
        closeMobileDrawers();
      }
      syncVoicePanelVisibility();
    });

    item.appendChild(button);
    ui.channelsList.appendChild(item);
  }
}

async function loadChannels(serverId, resetSelection = true) {
  const response = await window.api.chat.getChannels(serverId);
  if (!response.ok) {
    ui.channelTitle.textContent = response.message;
    state.canCreateChannels = false;
    updateChannelCreateButton();
    return;
  }

  const previousSelected = state.selectedChannelId;
  state.channels = (response.channels || []).map((channel) => ({
    ...channel,
    type: String(channel.type || 'text').toLowerCase()
  }));
  state.canCreateChannels = Boolean(response.canCreateChannels);
  updateChannelCreateButton();

  if (resetSelection) {
    state.selectedChannelId = pickDefaultChannelId(response.channels);
  } else {
    const stillExists = response.channels.some((channel) => channel.id === previousSelected);
    state.selectedChannelId = stillExists ? previousSelected : pickDefaultChannelId(response.channels);
  }

  renderChannels();

  if (state.selectedChannelId) {
    state.selectedDmUser = null;
    const selected = getSelectedChannel();
    if (selected?.type === 'voice') {
      ui.channelTitle.textContent = `VC: ${selected.name}`;
      state.subscribedChannelId = null;
      await loadMessages(state.selectedChannelId);
    } else {
      await loadMessages(state.selectedChannelId);
      ui.channelTitle.textContent = selected ? `# ${selected.name}` : 'Select a channel';
    }
  } else {
    ui.channelTitle.textContent = 'No channels available';
    ui.messagesList.innerHTML = '';
    state.subscribedChannelId = null;
  }
  syncVoicePanelVisibility();
}

function attachServerButtonInteractions(button, serverId) {
  let suppressClickOnce = false;

  const selectServer = async () => {
    state.selectedServerId = serverId;
    state.selectedDmUser = null;
    closeServerOptions();
    closeUserOptions();
    renderServers();
    const server = state.servers.find((x) => x.id === serverId);
    ui.serverTitle.textContent = server ? server.name : 'Channels';
    await loadChannels(serverId);
    await loadServerPresence(serverId);
    if (window.innerWidth <= 700) {
      closeMobileDrawers();
    }
  };

  button.addEventListener('click', async () => {
    if (suppressClickOnce) {
      suppressClickOnce = false;
      return;
    }
    await selectServer();
  });

  button.addEventListener('contextmenu', async (event) => {
    event.preventDefault();
    await selectServer();
    openServerOptions(serverId, button);
  });

  let holdTimer = null;
  button.addEventListener('touchstart', () => {
    holdTimer = setTimeout(async () => {
      await selectServer();
      openServerOptions(serverId, button);
      suppressClickOnce = true;
    }, 500);
  }, { passive: true });

  const cancelHold = () => {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
  };

  button.addEventListener('touchend', cancelHold, { passive: true });
  button.addEventListener('touchmove', cancelHold, { passive: true });
  button.addEventListener('touchcancel', cancelHold, { passive: true });
}

function renderServers() {
  ui.serversList.innerHTML = '';
  for (const server of state.servers) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.textContent = server.name.slice(0, 2).toUpperCase();
    button.title = server.name;

    if (server.id === state.selectedServerId) {
      button.classList.add('active');
    }

    attachServerButtonInteractions(button, server.id);

    item.appendChild(button);
    ui.serversList.appendChild(item);
  }
}

async function loadServers(resetSelection = true) {
  const response = await window.api.chat.getServers();
  if (!response.ok) {
    ui.channelTitle.textContent = response.message;
    return;
  }

  const previousSelected = state.selectedServerId;
  state.servers = response.servers;

  if (resetSelection) {
    state.selectedServerId = response.servers[0]?.id || null;
  } else {
    const stillExists = response.servers.some((server) => server.id === previousSelected);
    state.selectedServerId = stillExists ? previousSelected : response.servers[0]?.id || null;
  }

  renderServers();

  if (state.selectedServerId) {
    const server = state.servers.find((x) => x.id === state.selectedServerId);
    ui.serverTitle.textContent = server ? server.name : 'Channels';
    await loadChannels(state.selectedServerId, resetSelection);
    await loadServerPresence(state.selectedServerId);
  } else {
    ui.serverTitle.textContent = 'No servers available';
    ui.channelsList.innerHTML = '';
    ui.messagesList.innerHTML = '';
    state.canCreateChannels = false;
    updateChannelCreateButton();
    await loadServerPresence(null);
  }
}

function renderOnlineUsers() {
  ui.onlineUsersList.innerHTML = '';
  for (const user of state.onlineUsers) {
    if (user.id === state.currentUserId) {
      continue;
    }
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = `<span class="status-dot ${user.online ? 'online' : 'offline'}"></span>${user.username}`;
    let suppressClickOnce = false;
    button.addEventListener('click', async () => {
      if (suppressClickOnce) {
        suppressClickOnce = false;
        return;
      }
      await loadDmMessages(user.id, user.username);
      if (window.innerWidth <= 700) {
        closeMobileDrawers();
      }
    });

    if (state.canCreateChannels) {
      button.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        openUserOptions(user.id, button);
      });

      let holdTimer = null;

      button.addEventListener('touchstart', () => {
        holdTimer = setTimeout(() => {
          openUserOptions(user.id, button);
          suppressClickOnce = true;
        }, 500);
      }, { passive: true });

      const cancelHold = () => {
        if (holdTimer) {
          clearTimeout(holdTimer);
          holdTimer = null;
        }
      };

      button.addEventListener('touchend', () => {
        cancelHold();
        if (suppressClickOnce) {
          suppressClickOnce = false;
        }
      }, { passive: true });
      button.addEventListener('touchmove', cancelHold, { passive: true });
      button.addEventListener('touchcancel', cancelHold, { passive: true });
    }

    item.appendChild(button);
    ui.onlineUsersList.appendChild(item);
  }
}

function renderFriends() {
  ui.friendsList.innerHTML = '';
  for (const friend of state.friends) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = `<span class="status-dot ${friend.online ? 'online' : 'offline'}"></span>${friend.username}`;
    button.addEventListener('click', async () => {
      await loadDmMessages(friend.id, friend.username);
      if (window.innerWidth <= 700) {
        closeMobileDrawers();
      }
    });
    item.appendChild(button);
    ui.friendsList.appendChild(item);
  }
}

async function loadServerPresence(serverId) {
  if (!serverId) {
    state.onlineUsers = [];
    renderOnlineUsers();
    return;
  }

  const result = await window.api.chat.getServerPresence(serverId);
  if (!result.ok) {
    state.onlineUsers = [];
    renderOnlineUsers();
    return;
  }

  state.onlineUsers = result.users || [];
  renderOnlineUsers();
}

async function loadFriends() {
  const result = await window.api.friends.list();
  if (!result.ok) {
    state.friends = [];
    renderFriends();
    return;
  }

  state.friends = result.friends || [];
  renderFriends();
}

ui.showLoginBtn.addEventListener('click', showLogin);
ui.showRegisterBtn.addEventListener('click', showRegister);
ui.resendVerificationBtn.addEventListener('click', async () => {
  const email = await showPromptDialog('Resend Verification', 'Enter your email for a new verification link:');
  if (!email) {
    return;
  }
  const result = await window.api.auth.resendVerification({ email });
  setAuthMessage(result.message || (result.ok ? 'Verification email sent.' : 'Failed to resend verification.'), !result.ok);
});
ui.forgotPasswordBtn.addEventListener('click', async () => {
  const email = await showPromptDialog('Forgot Password', 'Enter your email for a password reset link:');
  if (!email) {
    return;
  }
  const request = await window.api.auth.requestPasswordReset({ email });
  if (!request.ok) {
    setAuthMessage(request.message, true);
    return;
  }

  const token = await showPromptDialog('Reset Token', 'Paste reset token from email (or cancel to do later):');
  if (!token) {
    setAuthMessage(request.message || 'Password reset email sent.');
    return;
  }
  const newPassword = await showPromptDialog('New Password', 'Enter new password (min 6 characters):');
  if (!newPassword) {
    return;
  }
  const confirm = await window.api.auth.confirmPasswordReset({ token, newPassword });
  setAuthMessage(confirm.message || (confirm.ok ? 'Password reset successfully.' : 'Failed to reset password.'), !confirm.ok);
});
ui.verifyTokenBtn.addEventListener('click', async () => {
  const token = await showPromptDialog('Verify Email Token', 'Paste your verification token:');
  if (!token) {
    return;
  }
  const result = await window.api.auth.verifyEmail({ token });
  setAuthMessage(result.message || (result.ok ? 'Email verified successfully.' : 'Failed to verify email.'), !result.ok);
});
ui.serverTabGeneral.addEventListener('click', () => setServerOptionsTab('general'));
ui.serverTabBanned.addEventListener('click', async () => {
  setServerOptionsTab('banned');
  await loadBannedUsers();
});
ui.mobileServersToggle.addEventListener('click', toggleMobileServersDrawer);
ui.mobileUsersToggle.addEventListener('click', toggleMobileUsersDrawer);
ui.mobileDrawerBackdrop.addEventListener('click', () => {
  closeMobileDrawers();
  closeServerOptions();
  closeUserOptions();
});

document.addEventListener('click', (event) => {
  if (!ui.serverOptionsMenu.classList.contains('hidden')) {
    const isInside = ui.serverOptionsMenu.contains(event.target);
    const clickedServerButton = ui.serversList.contains(event.target);
    if (!isInside && !clickedServerButton) {
      closeServerOptions();
    }
  }

  if (!ui.userOptionsMenu.classList.contains('hidden')) {
    const isInside = ui.userOptionsMenu.contains(event.target);
    const clickedPresenceUser = ui.onlineUsersList.contains(event.target);
    if (!isInside && !clickedPresenceUser) {
      closeUserOptions();
    }
  }

  if (!ui.accountSettingsMenu.classList.contains('hidden')) {
    const isInside = ui.accountSettingsMenu.contains(event.target);
    const clickedGear = ui.accountSettingsBtn.contains(event.target);
    if (!isInside && !clickedGear) {
      closeAccountSettingsMenu();
    }
  }
});

ui.appDialogCancelBtn.addEventListener('click', () => {
  if (!dialogState.resolver) {
    closeAppDialog();
    return;
  }
  const resolve = dialogState.resolver;
  dialogState.resolver = null;
  closeAppDialog();
  resolve(null);
});

ui.appDialogOkBtn.addEventListener('click', () => {
  if (!dialogState.resolver) {
    closeAppDialog();
    return;
  }
  const resolve = dialogState.resolver;
  dialogState.resolver = null;
  const hasInput = !ui.appDialogInput.classList.contains('hidden');
  const value = hasInput ? ui.appDialogInput.value : true;
  closeAppDialog();
  resolve(value);
});

ui.appDialog.addEventListener('click', (event) => {
  if (event.target === ui.appDialog) {
    if (!dialogState.resolver) {
      closeAppDialog();
      return;
    }
    const resolve = dialogState.resolver;
    dialogState.resolver = null;
    closeAppDialog();
    resolve(null);
  }
});

ui.appDialogInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    ui.appDialogOkBtn.click();
  }
});

ui.leaveServerBtn.addEventListener('click', async () => {
  const serverId = state.serverOptionsServerId;
  if (!serverId) {
    return;
  }

  const confirmed = await showConfirmDialog('Leave Server', 'Leave this server?', 'Leave', 'Cancel');
  if (!confirmed) {
    return;
  }

  const result = await window.api.chat.leaveServer({ serverId });
  if (!result.ok) {
    ui.channelTitle.textContent = result.message;
    return;
  }

  closeServerOptions();
  await loadServers(true);
});

ui.saveServerNameBtn.addEventListener('click', async () => {
  const serverId = state.serverOptionsServerId;
  if (!serverId) {
    return;
  }
  const name = ui.serverNameInput.value.trim();
  if (name.length < 2 || name.length > 80) {
    ui.channelTitle.textContent = 'Server name must be between 2 and 80 characters.';
    return;
  }

  const result = await window.api.chat.renameServer({ serverId, name });
  if (!result.ok) {
    ui.channelTitle.textContent = result.message;
    return;
  }

  await loadServers(false);
  ui.channelTitle.textContent = 'Server renamed.';
});

ui.kickUserBtn.addEventListener('click', async () => {
  const targetUserId = state.selectedModerationUserId;
  if (!targetUserId || !state.selectedServerId) {
    return;
  }

  const confirmed = await showConfirmDialog('Kick User', 'Kick this user from the server?', 'Kick', 'Cancel');
  if (!confirmed) {
    return;
  }

  const result = await window.api.chat.kickMember({
    serverId: state.selectedServerId,
    targetUserId
  });
  if (!result.ok) {
    ui.channelTitle.textContent = result.message;
    return;
  }

  closeUserOptions();
  await loadServerPresence(state.selectedServerId);
});

ui.banUserBtn.addEventListener('click', async () => {
  const targetUserId = state.selectedModerationUserId;
  if (!targetUserId || !state.selectedServerId) {
    return;
  }

  const reason = (await showPromptDialog('Ban User', 'Ban reason (optional):', '')) || '';
  const confirmed = await showConfirmDialog('Ban User', 'Ban this user from the server?', 'Ban', 'Cancel');
  if (!confirmed) {
    return;
  }

  const result = await window.api.chat.banMember({
    serverId: state.selectedServerId,
    targetUserId,
    reason
  });
  if (!result.ok) {
    ui.channelTitle.textContent = result.message;
    return;
  }

  closeUserOptions();
  await loadServerPresence(state.selectedServerId);
});

ui.accountSettingsBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleAccountSettingsMenu();
});

ui.accountMyAccountBtn.addEventListener('click', () => {
  closeAccountSettingsMenu();
  openAccountModal();
});

ui.accountModalCloseBtn.addEventListener('click', closeAccountModal);
ui.accountModal.addEventListener('click', (event) => {
  if (event.target === ui.accountModal) {
    closeAccountModal();
  }
});

ui.friendRequestsCloseBtn.addEventListener('click', closeFriendRequestsModal);
ui.friendRequestsModal.addEventListener('click', (event) => {
  if (event.target === ui.friendRequestsModal) {
    closeFriendRequestsModal();
  }
});

ui.accountForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = ui.accountUsernameInput.value.trim();
  const email = ui.accountEmailInput.value.trim().toLowerCase();
  const dateOfBirth = normalizeDob(ui.accountDobInput.value);
  const currentPassword = ui.accountCurrentPasswordInput.value;
  const newPassword = ui.accountNewPasswordInput.value;

  if (!dateOfBirth) {
    setAccountFormMessage('Date of birth is required.', true);
    return;
  }
  if (!isAtLeast13YearsOld(dateOfBirth)) {
    setAccountFormMessage('You must be at least 13 years old.', true);
    return;
  }

  if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
    setAccountFormMessage('Current and new password are required together.', true);
    return;
  }

  const response = await window.api.auth.updateAccount({
    username,
    email,
    dateOfBirth,
    currentPassword,
    newPassword
  });

  if (!response.ok) {
    setAccountFormMessage(response.message || 'Failed to update account.', true);
    return;
  }

  state.user = response.user;
  renderAccountPanel();
  ui.accountDobInput.value = normalizeDob(state.user?.date_of_birth);
  if (!userNeedsDob(state.user)) {
    state.isDobRequired = false;
    closeDobModal();
  }
  setAccountFormMessage(response.message || 'Account updated.');
  ui.accountCurrentPasswordInput.value = '';
  ui.accountNewPasswordInput.value = '';
});

ui.dobForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const dateOfBirth = normalizeDob(ui.dobInput.value);
  if (!dateOfBirth) {
    setDobFormMessage('Date of birth is required.', true);
    return;
  }
  if (!isAtLeast13YearsOld(dateOfBirth)) {
    setDobFormMessage('You must be at least 13 years old.', true);
    return;
  }

  const response = await window.api.auth.updateAccount({
    username: state.user?.username || '',
    email: state.user?.email || '',
    dateOfBirth
  });
  if (!response.ok) {
    setDobFormMessage(response.message || 'Failed to save date of birth.', true);
    return;
  }

  state.user = response.user;
  state.isDobRequired = false;
  renderAccountPanel();
  closeDobModal();
});

ui.accountDeleteBtn.addEventListener('click', async () => {
  const currentPassword =
    ui.accountCurrentPasswordInput.value ||
    (await showPromptDialog('Delete Account', 'Enter current password to delete account:', ''));
  if (!currentPassword) {
    setAccountFormMessage('Current password is required to delete account.', true);
    return;
  }

  const confirmed = await showConfirmDialog(
    'Delete Account',
    'Delete account permanently? This cannot be undone.',
    'Delete',
    'Cancel'
  );
  if (!confirmed) {
    return;
  }

  const response = await window.api.auth.deleteAccount({ currentPassword });
  if (!response.ok) {
    setAccountFormMessage(response.message || 'Failed to delete account.', true);
    return;
  }

  await performLogout(false);
});

ui.vcMuteBtn.addEventListener('click', async () => {
  try {
    await toggleVoiceMute();
  } catch (error) {
    ui.channelTitle.textContent = `Failed to toggle mute: ${error.message}`;
  }
});

ui.vcDeafenBtn.addEventListener('click', async () => {
  try {
    await toggleVoiceDeafen();
  } catch (error) {
    ui.channelTitle.textContent = `Failed to toggle deafen: ${error.message}`;
  }
});

ui.vcCloseBtn.addEventListener('click', () => {
  leaveVoiceView();
  const selected = getSelectedChannel();
  if (selected?.type === 'voice') {
    ui.channelTitle.textContent = `VC: ${selected.name} (left)`;
  }
});

ui.createServerBtn.addEventListener('click', async () => {
  const name = await showPromptDialog('Create Server', 'Server name:');
  if (!name) {
    return;
  }

  const result = await window.api.chat.createServer({ name });
  if (!result.ok) {
    ui.channelTitle.textContent = result.message;
    return;
  }

  await loadServers(false);
});

ui.addFriendBtn.addEventListener('click', async () => {
  const target = await showPromptDialog('Add Friend', 'Enter username or email to add as friend:');
  if (!target) {
    return;
  }

  const result = await window.api.friends.sendRequest({ target });
  if (!result.ok) {
    ui.channelTitle.textContent = result.message;
    return;
  }

  ui.channelTitle.textContent = 'Friend request sent.';
});

ui.friendRequestsBtn.addEventListener('click', async () => {
  const response = await window.api.friends.getRequests();
  if (!response.ok) {
    ui.channelTitle.textContent = response.message;
    return;
  }

  renderFriendRequests(response.requests || []);
  openFriendRequestsModal();
});

ui.joinInviteBtn.addEventListener('click', async () => {
  const codeInput = await showPromptDialog('Join by Invite', 'Enter invite code:');
  if (!codeInput) {
    return;
  }

  const result = await window.api.chat.joinByInvite({ code: codeInput });
  if (!result.ok) {
    ui.channelTitle.textContent = result.message;
    return;
  }

  const joinedServerId = result.server?.id || null;
  await loadServers(false);
  if (joinedServerId) {
    state.selectedServerId = joinedServerId;
    renderServers();
    const server = state.servers.find((item) => item.id === joinedServerId);
    ui.serverTitle.textContent = server ? server.name : 'Channels';
    await loadChannels(joinedServerId, false);
  }
});

ui.createInviteBtn.addEventListener('click', async () => {
  if (!state.selectedServerId) {
    ui.channelTitle.textContent = 'Select a server first.';
    return;
  }
  if (!state.canCreateChannels) {
    ui.channelTitle.textContent = 'Only the server owner can create invites.';
    return;
  }

  const result = await window.api.chat.createInvite({ serverId: state.selectedServerId });
  if (!result.ok) {
    ui.channelTitle.textContent = result.message;
    return;
  }

  const code = result.invite?.code || '';
  if (code && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(code);
    } catch (_error) {
    }
  }
  await showMessageDialog('Invite Code', `Invite code: ${code}${code ? '\n(Copied to clipboard when possible.)' : ''}`);
});

  ui.createChannelBtn.addEventListener('click', async () => {
  if (!state.selectedServerId) {
    ui.channelTitle.textContent = 'Select a server first.';
    return;
  }
  if (!state.canCreateChannels) {
    ui.channelTitle.textContent = 'Only the server owner can create channels.';
    return;
  }

  const name = await showPromptDialog('Create Channel', 'Channel name (without #):');
  if (!name) {
    return;
  }

  const isVoice = await showConfirmDialog('Channel Type', 'Create as voice channel?', 'Voice', 'Text');
  const type = isVoice ? 'voice' : 'text';

  const result = await window.api.chat.createChannel({
    serverId: state.selectedServerId,
    name,
    type
  });

  if (!result.ok) {
    ui.channelTitle.textContent = result.message;
    return;
  }

  await loadChannels(state.selectedServerId, false);
});

ui.loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (window.api.auth.setRemember) {
    window.api.auth.setRemember(Boolean(ui.rememberMe.checked));
  }

  const result = await window.api.auth.login({
    email: ui.loginEmail.value,
    password: ui.loginPassword.value
  });

  if (!result.ok) {
    setAuthMessage(result.message, true);
    return;
  }

  state.user = result.user;
  renderAccountPanel();
  setAuthMessage('');
  await openChat();
  await enforceDobIfMissing();
  await loadServers();
  await loadFriends();
  if (result.realtimeToken) {
    await ensureRealtime(result.realtimeToken);
  }
});

async function fetchLegalDoc(path) {
  if (window.api?.legal) {
    const fn = path === 'terms-of-service' ? window.api.legal.getTermsOfService : window.api.legal.getPrivacyPolicy;
    return fn ? await fn() : null;
  }
  try {
    const base = typeof location !== 'undefined' && location.protocol === 'file:' ? (localStorage?.getItem('jellochat_api_base') || 'http://localhost:3000') : '';
    const res = await fetch(`${base}/api/legal/${path}`);
    return await res.json();
  } catch (e) {
    return { ok: false, message: e.message || 'Failed to load.' };
  }
}

async function showTermsOfServiceDialog() {
  const result = await fetchLegalDoc('terms-of-service');
  if (!result?.ok) {
    setAuthMessage(result?.message || 'Terms of Service is not available.', true);
    return;
  }

  const raw = result.text || result.policy || '';
  const html = typeof window.marked !== 'undefined' ? await window.marked.parse(raw) : raw.replace(/\n/g, '<br>');
  await showMessageDialog('Terms of Service', html, { html: true });
}

async function showPrivacyPolicyDialog() {
  const result = await fetchLegalDoc('privacy-policy');
  if (!result?.ok) {
    setAuthMessage(result?.message || 'Privacy Policy is not available.', true);
    return;
  }

  const raw = result.text || result.policy || '';
  const html = typeof window.marked !== 'undefined' ? await window.marked.parse(raw) : raw.replace(/\n/g, '<br>');
  await showMessageDialog('Privacy Policy', html, { html: true });
}

ui.viewTosBtn?.addEventListener('click', async (event) => {
  event.preventDefault();
  event.stopPropagation();
  await showTermsOfServiceDialog();
});

ui.viewPrivacyBtn?.addEventListener('click', async (event) => {
  event.preventDefault();
  event.stopPropagation();
  await showPrivacyPolicyDialog();
});

ui.registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!ui.acceptTosCheckbox?.checked || !ui.acceptPrivacyCheckbox?.checked) {
    setAuthMessage('Please accept the Terms of Service and Privacy Policy to create an account.', true);
    return;
  }

  const dateOfBirth = normalizeDob(ui.registerDob.value);
  if (!isAtLeast13YearsOld(dateOfBirth)) {
    setAuthMessage('You must be at least 13 years old to register.', true);
    return;
  }

  const result = await window.api.auth.register({
    username: ui.registerUsername.value,
    email: ui.registerEmail.value,
    password: ui.registerPassword.value,
    dateOfBirth
  });

  if (!result.ok) {
    setAuthMessage(result.message, true);
    return;
  }

  if (result.needsVerification) {
    showLogin();
    setAuthMessage(result.message || 'Verify your email before logging in.');
    return;
  }

  state.user = result.user;
  renderAccountPanel();
  setAuthMessage('');
  await openChat();
  await enforceDobIfMissing();
  await loadServers();
  await loadFriends();
  if (result.realtimeToken) {
    await ensureRealtime(result.realtimeToken);
  }
});

ui.messageForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const content = ui.messageInput.value.trim();
  if (!content) {
    return;
  }

  if (state.selectedDmUser) {
    const dmResult = await window.api.dm.sendMessage({
      partnerUserId: state.selectedDmUser.id,
      content
    });
    if (!dmResult.ok) {
      ui.channelTitle.textContent = dmResult.message;
      return;
    }

    ui.messageInput.value = '';
    await loadDmMessages(state.selectedDmUser.id, state.selectedDmUser.username);
    return;
  }

  if (!state.selectedChannelId) {
    return;
  }

  const result = await window.api.chat.sendMessage({
    channelId: state.selectedChannelId,
    content
  });

  if (!result.ok) {
    ui.channelTitle.textContent = result.message;
    return;
  }

  ui.messageInput.value = '';
});

ui.logoutBtn.addEventListener('click', async () => {
  await performLogout(true);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 700) {
    closeMobileDrawers();
  }
  closeServerOptions();
  closeUserOptions();
});

updateChannelCreateButton();
updateMobileDrawers();
closeServerOptions();
closeUserOptions();
closeAccountSettingsMenu();
renderAccountPanel();
updateVoiceButtons();
setVcStatus('Not connected');
renderVoiceParticipants();
setupPasswordToggles();
closeDobModal();
showLogin();

handleAuthDeepLinks().catch(() => {});

(async function tryRestoreSession() {
  try {
    if (window.api.auth.getRemember) {
      ui.rememberMe.checked = window.api.auth.getRemember();
      if (!ui.rememberMe.checked) {
        return;
      }
    }

    const result = await window.api.auth.getSession();
    if (!result?.ok) {
      return;
    }

    state.user = result.user;
    renderAccountPanel();
    setAuthMessage('');
    await openChat();
    await enforceDobIfMissing();
    await loadServers();
    await loadFriends();
    if (result.realtimeToken) {
      await ensureRealtime(result.realtimeToken);
    }
  } catch (_error) {
  }
})();
