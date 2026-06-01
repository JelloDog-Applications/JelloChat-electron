

const ui = {
  appShell: document.querySelector('.app-shell'),
  authPanel: document.getElementById('auth-panel'),
  banAppealPage: document.getElementById('ban-appeal-page'),
  chatPanel: document.getElementById('chat-panel'),
  authMessage: document.getElementById('auth-message'),
  showLoginBtn: document.getElementById('show-login'),
  showRegisterBtn: document.getElementById('show-register'),
  loginForm: document.getElementById('login-form'),
  registerForm: document.getElementById('register-form'),
  loginEmail: document.getElementById('login-email'),
  loginPassword: document.getElementById('login-password'),
  loginPasskeyBtn: document.getElementById('login-passkey-btn'),
  loginCompany: document.getElementById('login-company'),
  banAppealForm: document.getElementById('ban-appeal-form'),
  banAppealEmail: document.getElementById('ban-appeal-email'),
  banAppealPassword: document.getElementById('ban-appeal-password'),
  banAppealHelp: document.getElementById('ban-appeal-help'),
  banAppealReason: document.getElementById('ban-appeal-reason'),
  banAppealMessage: document.getElementById('ban-appeal-message'),
  banAppealBackBtn: document.getElementById('ban-appeal-back-btn'),
  rememberMe: document.getElementById('remember-me'),
  registerUsername: document.getElementById('register-username'),
  registerEmail: document.getElementById('register-email'),
  registerPassword: document.getElementById('register-password'),
  registerWebsite: document.getElementById('register-website'),
  registerDob: document.getElementById('register-dob'),
  acceptTosCheckbox: document.getElementById('accept-tos'),
  acceptPrivacyCheckbox: document.getElementById('accept-privacy'),
  viewTosBtn: document.getElementById('view-tos-btn'),
  viewPrivacyBtn: document.getElementById('view-privacy-btn'),
  resendVerificationBtn: document.getElementById('resend-verification-btn'),
  forgotPasswordBtn: document.getElementById('forgot-password-btn'),
  verifyTokenBtn: document.getElementById('verify-token-btn'),
  serverUrlBtn: document.getElementById('server-url-btn'),
  serversList: document.getElementById('servers-list'),
  serverOptionsMenu: document.getElementById('server-options-menu'),
  serverTabGeneral: document.getElementById('server-tab-general'),
  serverTabRoles: document.getElementById('server-tab-roles'),
  serverTabBanned: document.getElementById('server-tab-banned'),
  serverPanelGeneral: document.getElementById('server-panel-general'),
  serverPanelRoles: document.getElementById('server-panel-roles'),
  serverPanelBanned: document.getElementById('server-panel-banned'),
  serverNameInput: document.getElementById('server-name-input'),
  saveServerNameBtn: document.getElementById('save-server-name-btn'),
  createRoleBtn: document.getElementById('create-role-btn'),
  rolesList: document.getElementById('roles-list'),
  roleNameInput: document.getElementById('role-name-input'),
  permManageServer: document.getElementById('perm-manage-server'),
  permManageRoles: document.getElementById('perm-manage-roles'),
  permManageChannels: document.getElementById('perm-manage-channels'),
  permCreateInvites: document.getElementById('perm-create-invites'),
  permModerateMembers: document.getElementById('perm-moderate-members'),
  saveRoleBtn: document.getElementById('save-role-btn'),
  deleteRoleBtn: document.getElementById('delete-role-btn'),
  roleMembersList: document.getElementById('role-members-list'),
  bannedUsersList: document.getElementById('banned-users-list'),
  leaveServerBtn: document.getElementById('leave-server-btn'),
  channelsList: document.getElementById('channels-list'),
  serverTitle: document.getElementById('server-title'),
  channelTitle: document.getElementById('channel-title'),
  friendsHomeBtn: document.getElementById('friends-home-btn'),
  friendsMenuBtn: document.getElementById('friends-menu-btn'),
  friendsHomeView: document.getElementById('friends-home-view'),
  friendsTabOnline: document.getElementById('friends-tab-online'),
  friendsTabAll: document.getElementById('friends-tab-all'),
  friendsTabPending: document.getElementById('friends-tab-pending'),
  friendsTabAdd: document.getElementById('friends-tab-add'),
  friendsCloseBtn: document.getElementById('friends-close-btn'),
  friendsSearchInput: document.getElementById('friends-search-input'),
  friendsHomeCount: document.getElementById('friends-home-count'),
  friendsHomeList: document.getElementById('friends-home-list'),
  activeNowList: document.getElementById('active-now-list'),
  vcPanel: document.getElementById('vc-panel'),
  vcRoomTitle: document.getElementById('vc-room-title'),
  vcStatus: document.getElementById('vc-status'),
  vcMicSensitivity: document.getElementById('vc-mic-sensitivity'),
  vcMicSensitivityValue: document.getElementById('vc-mic-sensitivity-value'),
  vcMicMeterFill: document.getElementById('vc-mic-meter-fill'),
  vcAudioSink: document.getElementById('vc-audio-sink'),
  vcVideoSink: document.getElementById('vc-video-sink'),
  vcVideoFullscreenBtn: document.getElementById('vc-video-fullscreen-btn'),
  vcMuteBtn: document.getElementById('vc-mute-btn'),
  vcMicSettingsBtn: document.getElementById('vc-mic-settings-btn'),
  vcDeafenBtn: document.getElementById('vc-deafen-btn'),
  vcScreenBtn: document.getElementById('vc-screen-btn'),
  vcCloseBtn: document.getElementById('vc-close-btn'),
  vcParticipantsList: document.getElementById('vc-participants-list'),
  messagesList: document.getElementById('messages-list'),
  mobileServersToggle: document.getElementById('mobile-servers-toggle'),
  mobileUsersToggle: document.getElementById('mobile-users-toggle'),
  dmCallBtn: document.getElementById('dm-call-btn'),
  mobileDrawerBackdrop: document.getElementById('mobile-drawer-backdrop'),
  onlineUsersList: document.getElementById('online-users-list'),
  friendsList: document.getElementById('friends-list'),
  accountAvatar: document.getElementById('account-avatar'),
  userOptionsMenu: document.getElementById('user-options-menu'),
  reportUserBtn: document.getElementById('report-user-btn'),
  kickUserBtn: document.getElementById('kick-user-btn'),
  banUserBtn: document.getElementById('ban-user-btn'),
  messageForm: document.getElementById('message-form'),
  messageInput: document.getElementById('message-input'),
  attachmentInput: document.getElementById('attachment-input'),
  attachmentBtn: document.getElementById('attachment-btn'),
  attachmentChip: document.getElementById('attachment-chip'),
  logoutBtn: document.getElementById('logout-btn'),
  createServerBtn: document.getElementById('create-server-btn'),
  addFriendBtn: document.getElementById('add-friend-btn'),
  friendRequestsBtn: document.getElementById('friend-requests-btn'),
  notificationsBtn: document.getElementById('notifications-btn'),
  friendRequestsModal: document.getElementById('friend-requests-modal'),
  friendRequestsCloseBtn: document.getElementById('friend-requests-close-btn'),
  friendRequestsList: document.getElementById('friend-requests-list'),
  notificationsModal: document.getElementById('notifications-modal'),
  notificationsCloseBtn: document.getElementById('notifications-close-btn'),
  notificationsEnableBtn: document.getElementById('notifications-enable-btn'),
  notificationsClearBtn: document.getElementById('notifications-clear-btn'),
  notificationsList: document.getElementById('notifications-list'),
  adminModal: document.getElementById('admin-modal'),
  adminModalCloseBtn: document.getElementById('admin-modal-close-btn'),
  adminSearchInput: document.getElementById('admin-search-input'),
  adminSearchBtn: document.getElementById('admin-search-btn'),
  adminReportFilter: document.getElementById('admin-report-filter'),
  adminReportsList: document.getElementById('admin-reports-list'),
  adminAppealFilter: document.getElementById('admin-appeal-filter'),
  adminAppealsList: document.getElementById('admin-appeals-list'),
  adminStorageRefreshBtn: document.getElementById('admin-storage-refresh-btn'),
  adminStorageConfig: document.getElementById('admin-storage-config'),
  adminStorageStats: document.getElementById('admin-storage-stats'),
  adminCleanupForm: document.getElementById('admin-cleanup-form'),
  storageMaxUploadMbInput: document.getElementById('storage-max-upload-mb-input'),
  storageExpireDaysInput: document.getElementById('storage-expire-days-input'),
  storageMaxUploadsDayInput: document.getElementById('storage-max-uploads-day-input'),
  storageQuotaMbInput: document.getElementById('storage-quota-mb-input'),
  cleanupEmptyServerDaysInput: document.getElementById('cleanup-empty-server-days-input'),
  cleanupBannedUserDaysInput: document.getElementById('cleanup-banned-user-days-input'),
  cleanupIntervalMinutesInput: document.getElementById('cleanup-interval-minutes-input'),
  adminServerSearchInput: document.getElementById('admin-server-search-input'),
  adminServerSearchBtn: document.getElementById('admin-server-search-btn'),
  adminServersList: document.getElementById('admin-servers-list'),
  adminUsersList: document.getElementById('admin-users-list'),
  adminUserDetails: document.getElementById('admin-user-details'),
  adminUserDetailsTitle: document.getElementById('admin-user-details-title'),
  adminUserDetailsMeta: document.getElementById('admin-user-details-meta'),
  adminUserServersList: document.getElementById('admin-user-servers-list'),
  adminUserReportsList: document.getElementById('admin-user-reports-list'),
  joinInviteBtn: document.getElementById('join-invite-btn'),
  createInviteBtn: document.getElementById('create-invite-btn'),
  createChannelBtn: document.getElementById('create-channel-btn'),
  accountUsername: document.getElementById('account-username'),
  accountEmail: document.getElementById('account-email'),
  accountSettingsBtn: document.getElementById('account-settings-btn'),
  accountSettingsMenu: document.getElementById('account-settings-menu'),
  accountMyAccountBtn: document.getElementById('account-my-account-btn'),
  accountAdminBtn: document.getElementById('account-admin-btn'),
  accountModal: document.getElementById('account-modal'),
  accountModalCloseBtn: document.getElementById('account-modal-close-btn'),
  accountModalAvatar: document.getElementById('account-modal-avatar'),
  accountModalUsername: document.getElementById('account-modal-username'),
  accountStandingCard: document.getElementById('account-standing-card'),
  accountStandingLabel: document.getElementById('account-standing-label'),
  accountStandingMeta: document.getElementById('account-standing-meta'),
  accountStandingBadge: document.getElementById('account-standing-badge'),
  accountStandingMeter: document.getElementById('account-standing-meter'),
  accountForm: document.getElementById('account-form'),
  accountUsernameInput: document.getElementById('account-username-input'),
  accountEmailInput: document.getElementById('account-email-input'),
  accountAvatarInput: document.getElementById('account-avatar-input'),
  accountCurrentPasswordInput: document.getElementById('account-current-password-input'),
  accountNewPasswordInput: document.getElementById('account-new-password-input'),
  accountDobInput: document.getElementById('account-dob-input'),
  passkeysPanel: document.getElementById('passkeys-panel'),
  passkeysHelp: document.getElementById('passkeys-help'),
  addPasskeyBtn: document.getElementById('add-passkey-btn'),
  passkeysList: document.getElementById('passkeys-list'),
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
  appDialogOkBtn: document.getElementById('app-dialog-ok-btn'),
  appDialogCloseBtn: document.getElementById('app-dialog-close-btn'),
  screenSourceModal: document.getElementById('screen-source-modal'),
  screenSourceGrid: document.getElementById('screen-source-grid'),
  screenSourceCancelBtn: document.getElementById('screen-source-cancel-btn')
};

const state = {
  user: null,
  servers: [],
  channels: [],
  selectedServerId: null,
  selectedChannelId: null,
  selectedDmUser: null,
  currentUserId: null,
  selectedAttachment: null,
  ws: null,
  wsConfig: null,
  subscribedChannelId: null,
  realtimeToken: null,
  canCreateChannels: false,
  onlineUsers: [],
  friends: [],
  friendRequests: [],
  isFriendsHomeOpen: false,
  friendsHomeTab: 'online',
  mobileServersOpen: false,
  mobileUsersOpen: false,
  serverOptionsServerId: null,
  selectedModerationUserId: null,
  serverOptionsTab: 'general',
  bannedUsers: [],
  serverPermissions: {
    manage_server: false,
    manage_roles: false,
    manage_channels: false,
    create_invites: false,
    moderate_members: false
  },
  serverRoles: [],
  serverRoleMembers: [],
  selectedRoleId: null,
  activeVoiceChannelId: null,
  voiceRoom: null,
  voiceAudioEls: new Map(),
  voiceVideoEls: new Map(),
  localMicMediaTrack: null,
  localMicPublication: null,
  micSourceStream: null,
  micAudioContext: null,
  micGainNode: null,
  micAnalyser: null,
  micLevelTimer: null,
  micSensitivity: 100,
  voiceActiveSpeakerIds: new Set(),
  isVoiceMuted: false,
  isVoiceDeafened: false,
  isScreenSharing: false,
  screenShareMediaTrack: null,
  localScreenVideoEl: null,
  isScreenFocused: false,
  isDobRequired: false,
  activeDmCallUserId: null,
  activeVoiceLabel: '',
  avatarPromptShown: false,
  adminUsers: [],
  adminServers: [],
  adminReports: [],
  adminAppeals: [],
  selectedAdminUserId: null,
  adminUserDetails: null,
  adminViewedServer: null,
  notifications: [],
  passkeys: [],
  passkeysSupported: false
};

const dialogState = {
  resolver: null
};

const screenSourceState = {
  resolver: null
};

let authSwitchTimer = null;
const authTiming = {
  loginShownAt: Date.now(),
  registerShownAt: Date.now()
};

function isPasskeySupportedInBrowser() {
  return typeof window.PublicKeyCredential !== 'undefined'
    && typeof navigator.credentials !== 'undefined'
    && window.isSecureContext
    && String(window.location?.protocol || '') !== 'file:';
}

function base64UrlToArrayBuffer(value) {
  const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  const binary = window.atob(`${normalized}${padding}`);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

function arrayBufferToBase64Url(value) {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value || new ArrayBuffer(0));
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function formatPasskeyDate(value) {
  if (!value) {
    return 'Never used';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Never used';
  }
  return date.toLocaleString();
}

function getSelectedChannel() {
  return state.channels.find((channel) => channel.id === state.selectedChannelId) || null;
}

function shouldShowVoicePanel() {
  return Boolean(state.voiceRoom && (state.activeVoiceChannelId || state.activeDmCallUserId));
}

function syncVoicePanelVisibility() {
  ui.vcPanel.classList.toggle('hidden', !shouldShowVoicePanel());
}

function syncDmCallButton() {
  const canCall = Boolean(ui.dmCallBtn && state.selectedDmUser);
  ui.dmCallBtn?.classList.toggle('hidden', !canCall);
}

function setFriendsHomeOpen(open) {
  state.isFriendsHomeOpen = Boolean(open);
  ui.chatPanel?.classList.toggle('friends-view-active', state.isFriendsHomeOpen);
  ui.friendsHomeView?.classList.toggle('hidden', !state.isFriendsHomeOpen);
  ui.messagesList?.classList.toggle('hidden', state.isFriendsHomeOpen);
  ui.messageForm?.classList.toggle('hidden', state.isFriendsHomeOpen);
  ui.vcPanel?.classList.toggle('friends-view-suppressed', state.isFriendsHomeOpen);
  ui.friendsHomeBtn?.classList.toggle('active', state.isFriendsHomeOpen);
}

function closeFriendsHome() {
  setFriendsHomeOpen(false);
  const selectedChannel = getSelectedChannel();
  if (selectedChannel) {
    ui.channelTitle.textContent = selectedChannel.type === 'voice' ? `VC ${selectedChannel.name}` : `# ${selectedChannel.name}`;
  } else if (state.selectedDmUser) {
    ui.channelTitle.textContent = `@ ${state.selectedDmUser.username}`;
  }
  syncVoicePanelVisibility();
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

function getInitials(name) {
  const parts = String(name || 'U')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (!parts.length) {
    return 'U';
  }
  return parts.map((part) => part[0]?.toUpperCase() || '').join('') || 'U';
}

function setAvatarContent(container, user, fallbackLabel) {
  if (!container) {
    return;
  }
  const label = fallbackLabel || user?.username || user?.email || 'User';
  const initials = getInitials(label);
  const avatarUrl = String(user?.avatar_url || user?.avatarUrl || '').trim();

  container.textContent = '';
  container.setAttribute('aria-label', `${label} avatar`);

  if (avatarUrl) {
    const img = document.createElement('img');
    img.src = avatarUrl;
    img.alt = `${label} avatar`;
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';
    img.addEventListener('error', () => {
      container.textContent = initials;
    }, { once: true });
    container.appendChild(img);
    return;
  }

  container.textContent = initials;
}

function createAvatarElement(user, className = 'avatar', fallbackLabel) {
  const avatar = document.createElement('div');
  avatar.className = className;
  setAvatarContent(avatar, user, fallbackLabel);
  return avatar;
}

function isParticipantMuted(participant) {
  const publications = Array.from(participant.audioTrackPublications?.values?.() || []);
  if (!publications.length) {
    return true;
  }
  return publications.every((pub) => pub.isMuted);
}

function isScreenSharePublication(publication) {
  const source = String(publication?.source || '').toLowerCase();
  return source.includes('screen');
}

function isParticipantScreenSharing(participant) {
  const publications = Array.from(participant.videoTrackPublications?.values?.() || []);
  return publications.some((publication) => !publication.isMuted && isScreenSharePublication(publication));
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
    item.title = getParticipantDisplayName(participant);
    if (state.voiceActiveSpeakerIds.has(participant.identity)) {
      item.classList.add('vc-speaking');
    }

    const avatar = createAvatarElement({ username: getParticipantDisplayName(participant) }, 'avatar vc-participant-avatar');
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
      if (state.isScreenSharing || isParticipantScreenSharing(participant)) {
        parts.push('Sharing');
      }
    } else if (isParticipantMuted(participant)) {
      parts.push('Muted');
    }
    if (!participant.isLocal && isParticipantScreenSharing(participant)) {
      parts.push('Sharing');
    }
    badges.textContent = parts.join(' · ');

    item.append(avatar, name, badges);
    ui.vcParticipantsList.appendChild(item);
  }
}

function renderPendingVoiceParticipants(label = 'You') {
  ui.vcParticipantsList.innerHTML = '';
  const item = document.createElement('li');
  item.className = 'vc-participant vc-speaking';
  item.title = label;
  const avatar = createAvatarElement(state.user || { username: label }, 'avatar vc-participant-avatar', label);
  const name = document.createElement('span');
  name.textContent = label;
  const badges = document.createElement('span');
  badges.className = 'vc-badges';
  badges.textContent = 'Connecting';
  item.append(avatar, name, badges);
  ui.vcParticipantsList.appendChild(item);
}

function setVcStatus(message) {
  ui.vcStatus.textContent = message;
}

function updateScreenShareLayout() {
  const hasSharedVideo = state.isScreenSharing || state.voiceVideoEls.size > 0;
  if (!hasSharedVideo) {
    state.isScreenFocused = false;
  }
  ui.vcPanel?.classList.toggle('vc-sharing', hasSharedVideo);
  ui.vcPanel?.classList.toggle('vc-screen-focused', hasSharedVideo && state.isScreenFocused);
  ui.vcPanel?.classList.toggle('voice-call-active', Boolean(state.voiceRoom));
  ui.chatPanel?.classList.toggle('screen-share-active', hasSharedVideo);
  ui.vcVideoFullscreenBtn?.classList.toggle('hidden', !hasSharedVideo);
}

function updateMicSensitivityUi() {
  if (ui.vcMicSensitivity) {
    ui.vcMicSensitivity.value = String(state.micSensitivity);
  }
  if (ui.vcMicSensitivityValue) {
    ui.vcMicSensitivityValue.textContent = `${state.micSensitivity}%`;
  }
  if (state.micGainNode) {
    state.micGainNode.gain.value = state.micSensitivity / 100;
  }
}

function updateMicMeter(level = 0) {
  if (!ui.vcMicMeterFill) {
    return;
  }
  const clamped = Math.max(0, Math.min(100, Math.round(level)));
  ui.vcMicMeterFill.style.width = `${clamped}%`;
}

function canUseMicrophoneApi() {
  const hasMediaDevices = typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
  const isLocalhost =
    typeof location !== 'undefined' &&
    (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '::1');
  const secureOk = typeof window !== 'undefined' ? window.isSecureContext || isLocalhost : false;
  return Boolean(hasMediaDevices && secureOk);
}

function setIconButtonContent(button, iconClass, label) {
  if (!button) {
    return;
  }
  const icon = document.createElement('i');
  icon.className = iconClass;
  icon.setAttribute('aria-hidden', 'true');
  icon.dataset.fallback = getIconFallback(iconClass, label);
  const text = document.createElement('span');
  text.textContent = label;
  button.replaceChildren(icon, text);
}

function setIconOnlyButtonContent(button, iconClass, label) {
  if (!button) {
    return;
  }
  const icon = document.createElement('i');
  icon.className = iconClass;
  icon.setAttribute('aria-hidden', 'true');
  icon.dataset.fallback = getIconFallback(iconClass, label);
  button.setAttribute('aria-label', label);
  button.replaceChildren(icon);
}

function getIconFallback(iconClass = '', label = '') {
  const iconName = String(iconClass || '').split(/\s+/).find((part) => part.startsWith('fa-') && part !== 'fa-solid') || '';
  const fallbacks = {
    'fa-ban': '!',
    'fa-bars': '=',
    'fa-bell': '!',
    'fa-check': '+',
    'fa-display': '[]',
    'fa-envelope-circle-check': '@',
    'fa-expand': '<>',
    'fa-eye': 'o',
    'fa-eye-slash': 'x',
    'fa-gear': '*',
    'fa-headphones': 'HP',
    'fa-key': 'key',
    'fa-lock': 'lock',
    'fa-microphone': 'mic',
    'fa-microphone-slash': 'mut',
    'fa-paper-plane': '>',
    'fa-pen': 'edit',
    'fa-phone': 'call',
    'fa-phone-slash': 'end',
    'fa-plus': '+',
    'fa-right-to-bracket': 'in',
    'fa-server': 'srv',
    'fa-shield-halved': 'ok',
    'fa-stop': 'stop',
    'fa-trash': 'del',
    'fa-triangle-exclamation': '!',
    'fa-unlock': 'open',
    'fa-unlock-keyhole': 'key',
    'fa-user-clock': 'req',
    'fa-user-minus': '-',
    'fa-user-plus': '+',
    'fa-user-shield': 'admin',
    'fa-users': 'users',
    'fa-volume-xmark': 'off',
    'fa-xmark': 'x'
  };
  return fallbacks[iconName] || String(label || '').slice(0, 3) || '?';
}

function installFontAwesomeFallback() {
  const applyFallbackLabels = () => {
    for (const icon of document.querySelectorAll('i.fa-solid')) {
      if (!icon.dataset.fallback) {
        icon.dataset.fallback = getIconFallback(icon.className, icon.closest('button')?.textContent || '');
      }
    }
  };
  applyFallbackLabels();
  const enableFallbackIfNeeded = () => {
    const testIcon = document.querySelector('i.fa-solid');
    if (!testIcon) {
      return;
    }
    const fontFamily = String(window.getComputedStyle(testIcon, '::before').fontFamily || '');
    if (!/Font Awesome/i.test(fontFamily)) {
      document.body?.classList.add('fa-fallback-icons');
    } else {
      document.body?.classList.remove('fa-fallback-icons');
    }
  };
  if (document.fonts?.ready) {
    document.fonts.ready.then(enableFallbackIfNeeded).catch(enableFallbackIfNeeded);
  } else {
    window.setTimeout(enableFallbackIfNeeded, 500);
  }
}


function updateVoiceButtons() {
  ui.vcMuteBtn.classList.toggle('vc-control-on', state.isVoiceMuted);
  ui.vcDeafenBtn.classList.toggle('vc-control-on', state.isVoiceDeafened);
  ui.vcScreenBtn?.classList.toggle('vc-control-on', state.isScreenSharing);
  updateScreenShareLayout();
  setIconButtonContent(ui.vcMuteBtn, state.isVoiceMuted ? 'fa-solid fa-microphone-slash' : 'fa-solid fa-microphone', state.isVoiceMuted ? 'Unmute' : 'Mute');
  setIconOnlyButtonContent(ui.vcMicSettingsBtn, 'fa-solid fa-chevron-down', 'Mic settings');
  ui.vcMicSettingsBtn?.setAttribute('aria-expanded', ui.vcPanel?.classList.contains('mic-settings-open') ? 'true' : 'false');
  setIconButtonContent(ui.vcDeafenBtn, state.isVoiceDeafened ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-headphones', state.isVoiceDeafened ? 'Undeafen' : 'Deafen');
  setIconButtonContent(ui.vcCloseBtn, 'fa-solid fa-phone-slash', state.activeDmCallUserId ? 'End Call' : 'Leave VC');
  if (ui.vcScreenBtn) {
    setIconButtonContent(ui.vcScreenBtn, state.isScreenSharing ? 'fa-solid fa-stop' : 'fa-solid fa-display', state.isScreenSharing ? 'Stop Sharing' : 'Share Screen');
  }
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

function stopMicLevelMeter() {
  if (state.micLevelTimer) {
    clearInterval(state.micLevelTimer);
    state.micLevelTimer = null;
  }
  updateMicMeter(0);
}

function startMicLevelMeter() {
  stopMicLevelMeter();
  if (!state.micAnalyser) {
    return;
  }

  const samples = new Uint8Array(state.micAnalyser.fftSize);
  state.micLevelTimer = setInterval(() => {
    state.micAnalyser.getByteTimeDomainData(samples);
    let sum = 0;
    for (const sample of samples) {
      const centered = (sample - 128) / 128;
      sum += centered * centered;
    }
    const rms = Math.sqrt(sum / samples.length);
    updateMicMeter(rms * 180);
  }, 100);
}

function cleanupLocalMic() {
  stopMicLevelMeter();
  if (state.localMicMediaTrack) {
    try {
      state.localMicMediaTrack.stop();
    } catch (_error) {
    }
  }
  if (state.micSourceStream) {
    for (const track of state.micSourceStream.getTracks()) {
      try {
        track.stop();
      } catch (_error) {
      }
    }
  }
  if (state.micAudioContext) {
    state.micAudioContext.close().catch(() => {});
  }
  state.localMicMediaTrack = null;
  state.localMicPublication = null;
  state.micSourceStream = null;
  state.micAudioContext = null;
  state.micGainNode = null;
  state.micAnalyser = null;
}

async function createGainControlledMicTrack() {
  const sourceStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    },
    video: false
  });

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    const [fallbackTrack] = sourceStream.getAudioTracks();
    state.micSourceStream = sourceStream;
    state.localMicMediaTrack = fallbackTrack || null;
    return fallbackTrack || null;
  }

  const audioContext = new AudioContextClass();
  const source = audioContext.createMediaStreamSource(sourceStream);
  const gainNode = audioContext.createGain();
  const analyser = audioContext.createAnalyser();
  const destination = audioContext.createMediaStreamDestination();
  analyser.fftSize = 256;

  source.connect(gainNode);
  gainNode.connect(analyser);
  analyser.connect(destination);
  gainNode.gain.value = state.micSensitivity / 100;

  const [processedTrack] = destination.stream.getAudioTracks();
  state.micSourceStream = sourceStream;
  state.micAudioContext = audioContext;
  state.micGainNode = gainNode;
  state.micAnalyser = analyser;
  state.localMicMediaTrack = processedTrack || null;
  startMicLevelMeter();
  return processedTrack || null;
}

function detachAllVoiceVideo() {
  for (const [, videoEl] of state.voiceVideoEls) {
    try {
      videoEl.remove();
    } catch (_error) {
    }
  }
  state.voiceVideoEls.clear();
  detachLocalScreenPreview();
  if (ui.vcVideoSink) {
    ui.vcVideoSink.textContent = 'No one is sharing right now.';
  }
  updateScreenShareLayout();
}

function attachLocalScreenPreview(mediaTrack) {
  if (!ui.vcVideoSink || !mediaTrack) {
    return;
  }
  detachLocalScreenPreview();
  ui.vcVideoSink.textContent = '';
  const videoEl = document.createElement('video');
  videoEl.autoplay = true;
  videoEl.playsInline = true;
  videoEl.muted = true;
  videoEl.srcObject = new MediaStream([mediaTrack]);
  videoEl.dataset.localScreenShare = 'true';
  ui.vcVideoSink.appendChild(videoEl);
  state.localScreenVideoEl = videoEl;
}

function detachLocalScreenPreview() {
  if (!state.localScreenVideoEl) {
    return;
  }
  try {
    state.localScreenVideoEl.srcObject = null;
    state.localScreenVideoEl.remove();
  } catch (_error) {
  }
  state.localScreenVideoEl = null;
}

function toggleFocusedScreenShare() {
  const hasSharedVideo = state.isScreenSharing || state.voiceVideoEls.size > 0;
  if (!hasSharedVideo) {
    return;
  }
  state.isScreenFocused = !state.isScreenFocused;
  updateScreenShareLayout();
}

async function requestScreenShareFullscreen() {
  const target = ui.vcVideoSink?.querySelector('video') || ui.vcVideoSink;
  if (!target) {
    return;
  }
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else if (target.requestFullscreen) {
      await target.requestFullscreen();
    }
  } catch (error) {
    setVcStatus(`Fullscreen failed: ${error.message || error}`);
  }
}

function setAudioSinkMuted(muted) {
  for (const [, audioEl] of state.voiceAudioEls) {
    audioEl.muted = muted;
  }
}

function attachRemoteVideo(track, participant) {
  if (!track || track.kind !== 'video') {
    return;
  }
  const key = `${participant.identity}:${track.sid}`;
  if (state.voiceVideoEls.has(key)) {
    return;
  }
  if (ui.vcVideoSink) {
    ui.vcVideoSink.textContent = '';
  }
  const videoEl = track.attach();
  videoEl.autoplay = true;
  videoEl.playsInline = true;
  videoEl.muted = true;
  ui.vcVideoSink?.appendChild(videoEl);
  state.voiceVideoEls.set(key, videoEl);
  updateScreenShareLayout();
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

function detachRemoteVideo(track, participant) {
  if (!track || track.kind !== 'video') {
    return;
  }
  const key = `${participant.identity}:${track.sid}`;
  const videoEl = state.voiceVideoEls.get(key);
  if (!videoEl) {
    return;
  }
  try {
    track.detach(videoEl);
  } catch (_error) {
  }
  videoEl.remove();
  state.voiceVideoEls.delete(key);
  if (!state.voiceVideoEls.size && ui.vcVideoSink) {
    ui.vcVideoSink.textContent = 'No one is sharing right now.';
  }
  updateScreenShareLayout();
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
  room.on(RoomEvent.LocalTrackPublished, (publication, participant) => {
    state.isScreenSharing = isParticipantScreenSharing(room.localParticipant);
    renderVoiceParticipants();
    updateVoiceButtons();
  });
  room.on(RoomEvent.LocalTrackUnpublished, (publication, participant) => {
    state.isScreenSharing = isParticipantScreenSharing(room.localParticipant);
    renderVoiceParticipants();
    updateVoiceButtons();
  });
  room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
    state.voiceActiveSpeakerIds = new Set((speakers || []).map((participant) => participant.identity));
    renderVoiceParticipants();
  });
  room.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
    attachRemoteVideo(track, participant);
    attachRemoteAudio(track, participant);
    renderVoiceParticipants();
  });
  room.on(RoomEvent.TrackUnsubscribed, (track, _publication, participant) => {
    detachRemoteVideo(track, participant);
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
  const screenShareMediaTrack = state.screenShareMediaTrack;
  state.screenShareMediaTrack = null;
  if (screenShareMediaTrack) {
    try {
      screenShareMediaTrack.stop();
    } catch (_error) {
    }
  }
  cleanupLocalMic();
  if (disconnect && state.voiceRoom) {
    try {
      state.voiceRoom.disconnect();
    } catch (_error) {
    }
  }
  state.voiceRoom = null;
  detachAllVoiceAudio();
  detachAllVoiceVideo();
  state.voiceActiveSpeakerIds = new Set();
  state.isVoiceMuted = false;
  state.isVoiceDeafened = false;
  state.isScreenSharing = false;
  state.isScreenFocused = false;
  updateVoiceButtons();
  setVcStatus('Not connected');
  renderVoiceParticipants();
  state.activeVoiceChannelId = null;
  state.activeDmCallUserId = null;
  state.activeVoiceLabel = '';
  syncVoicePanelVisibility();
}

function renderAccountPanel() {
  ui.accountUsername.textContent = state.user?.username || 'User';
  ui.accountEmail.textContent = state.user?.email || '';
  setAvatarContent(ui.accountAvatar, state.user, state.user?.username || 'User');
  if (ui.accountModalUsername) {
    ui.accountModalUsername.textContent = state.user?.username || 'User';
  }
  if (ui.accountModalAvatar) {
    setAvatarContent(ui.accountModalAvatar, state.user, state.user?.username || 'User');
  }
  ui.accountAdminBtn?.classList.toggle('hidden', !state.user?.is_platform_admin);
  ensureAccountStandingMeter();
  const standingDetails = getAccountStandingDetails(state.user);
  const violationCount = Number(state.user?.tos_violation_count || 0);
  ui.accountStandingCard.className = `account-standing-card standing-${standingDetails.key}`;
  ui.accountStandingLabel.textContent = standingDetails.label;
  ui.accountStandingBadge.textContent = standingDetails.badge;
  const dots = Array.from(ui.accountStandingMeter?.querySelectorAll('.standing-dot') || []);
  dots.forEach((dot, index) => {
    dot.classList.toggle('is-active', index === standingDetails.index);
    dot.classList.toggle('is-filled', index <= standingDetails.index);
  });
  ui.accountStandingMeta.textContent = state.user?.standing_reason
    ? `${state.user.standing_reason} (${violationCount} violation${violationCount === 1 ? '' : 's'})`
    : violationCount > 0
      ? `${violationCount} Terms of Service violation${violationCount === 1 ? '' : 's'} on record.`
      : standingDetails.description;
}

function ensureAccountStandingMeter() {
  if (!ui.accountStandingCard || ui.accountStandingMeter) {
    return;
  }

  const meter = document.createElement('div');
  meter.id = 'account-standing-meter';
  meter.className = 'account-standing-meter';
  meter.setAttribute('aria-label', 'Account standing progress');

  const levels = [
    ['standing-dot-good', 'All Good'],
    ['standing-dot-limited', 'Limited'],
    ['standing-dot-very-limited', 'Very Limited'],
    ['standing-dot-at-risk', 'At Risk'],
    ['standing-dot-suspended', 'Suspended']
  ];

  for (const [className, title] of levels) {
    const dot = document.createElement('span');
    dot.className = `standing-dot ${className}`;
    dot.title = title;
    meter.appendChild(dot);
  }

  ui.accountStandingCard.insertBefore(meter, ui.accountStandingMeta || null);
  ui.accountStandingMeter = meter;
}

function getAccountStandingDetails(user) {
  const rawStanding = String(user?.account_standing || 'good').toLowerCase();
  const violationCount = Number(user?.tos_violation_count || 0);
  const isBanned = rawStanding === 'banned' || Boolean(user?.platform_banned_at) || violationCount >= 5;

  if (isBanned) {
    return {
      key: 'suspended',
      index: 4,
      label: 'Suspended',
      badge: '5/5',
      description: 'This account is suspended from JelloChat.'
    };
  }
  if (rawStanding === 'restricted' || violationCount >= 3) {
    return {
      key: 'at-risk',
      index: 3,
      label: 'At Risk',
      badge: `${Math.min(4, Math.max(3, violationCount))}/5`,
      description: 'This account has serious limits because of repeated Terms violations.'
    };
  }
  if (violationCount >= 2) {
    return {
      key: 'very-limited',
      index: 2,
      label: 'Very Limited',
      badge: '2/5',
      description: 'This account has stronger limits because of recent Terms violations.'
    };
  }
  if (rawStanding === 'warning' || violationCount >= 1) {
    return {
      key: 'limited',
      index: 1,
      label: 'Limited',
      badge: '1/5',
      description: 'This account has a warning from a recent Terms violation.'
    };
  }
  return {
    key: 'good',
    index: 0,
    label: 'All Good',
    badge: '0/5',
    description: 'No recent Terms of Service violations.'
  };
}

function renderPasskeys() {
  if (!ui.passkeysPanel || !ui.passkeysList || !ui.passkeysHelp) {
    return;
  }

  const browserSupported = isPasskeySupportedInBrowser();
  const supported = browserSupported && state.passkeysSupported;
  ui.passkeysPanel.classList.toggle('hidden', !supported);
  ui.loginPasskeyBtn?.classList.toggle('hidden', !browserSupported);

  if (!supported) {
    ui.passkeysHelp.textContent = browserSupported
      ? 'Passkeys are not available from this app runtime.'
      : 'Passkeys need a supported secure browser session, like the web version on localhost or HTTPS.';
    ui.passkeysList.innerHTML = '';
    return;
  }

  ui.passkeysHelp.textContent = state.passkeys.length
    ? 'Use a device passkey for faster sign-in on supported browsers.'
    : 'No passkeys added yet. Add one on this device to sign in without typing your password.';
  ui.passkeysList.innerHTML = '';

  if (!state.passkeys.length) {
    const empty = document.createElement('div');
    empty.className = 'account-form-message';
    empty.textContent = 'No passkeys added yet.';
    ui.passkeysList.appendChild(empty);
    return;
  }

  for (const passkey of state.passkeys) {
    const row = document.createElement('div');
    row.className = 'passkey-item';

    const meta = document.createElement('div');
    meta.className = 'passkey-meta';

    const title = document.createElement('div');
    title.className = 'passkey-title';
    title.textContent = passkey.label || 'Passkey';

    const subtitle = document.createElement('div');
    subtitle.className = 'passkey-subtitle';
    const transports = Array.isArray(passkey.transports) && passkey.transports.length ? passkey.transports.join(', ') : 'device';
    subtitle.textContent = `Added ${formatPasskeyDate(passkey.created_at)} - Last used ${formatPasskeyDate(passkey.last_used_at)} - ${transports}`;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'passkey-remove-btn';
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', async () => {
      const confirmed = await showConfirmDialog('Remove Passkey', `Remove ${passkey.label || 'this passkey'} from your account?`, 'Remove', 'Cancel');
      if (!confirmed) {
        return;
      }
      const response = await window.api.auth.deletePasskey({ passkeyId: passkey.id });
      if (!response.ok) {
        setAccountFormMessage(response.message || 'Failed to remove passkey.', true);
        return;
      }
      state.passkeys = state.passkeys.filter((item) => item.id !== passkey.id);
      renderPasskeys();
      setAccountFormMessage('Passkey removed.');
    });

    meta.append(title, subtitle);
    row.append(meta, removeBtn);
    ui.passkeysList.appendChild(row);
  }
}

async function loadPasskeys() {
  if (!ui.passkeysPanel || !window.api?.auth?.getPasskeys) {
    return;
  }
  const browserSupported = isPasskeySupportedInBrowser();
  if (!browserSupported) {
    state.passkeysSupported = false;
    state.passkeys = [];
    renderPasskeys();
    return;
  }
  const response = await window.api.auth.getPasskeys();
  state.passkeysSupported = Boolean(response?.supported);
  state.passkeys = response?.ok ? (response.passkeys || []) : [];
  renderPasskeys();
}

async function completeSignedInState(result) {
  state.user = result.user;
  renderAccountPanel();
  setAuthMessage('');
  await openChat();
  await enforceDobIfMissing();
  await maybePromptForAvatar();
  await loadServers();
  await loadFriends();
  await handlePendingInviteLink();
  if (result.realtimeToken) {
    await ensureRealtime(result.realtimeToken);
  }
  if (result.tosNotice?.message) {
    notifyUser(result.tosNotice.title || 'Terms of Service updated', result.tosNotice.message);
    await showMessageDialog(result.tosNotice.title || 'Terms of Service updated', result.tosNotice.message);
  }
  if (result.privacyNotice?.message) {
    notifyUser(result.privacyNotice.title || 'Privacy Policy updated', result.privacyNotice.message);
    await showMessageDialog(result.privacyNotice.title || 'Privacy Policy updated', result.privacyNotice.message);
  }
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

function getAccountModalScrollState() {
  const scroller = ui.accountModal?.querySelector('.account-modal-scroll');
  const navLinks = Array.from(ui.accountModal?.querySelectorAll('.account-modal-nav a[href^="#"]') || []);
  const sections = navLinks
    .map((link) => ({
      link,
      section: document.querySelector(link.getAttribute('href'))
    }))
    .filter((item) => item.section);
  return { scroller, sections };
}

function setActiveAccountModalSection(sectionId) {
  const links = ui.accountModal?.querySelectorAll('.account-modal-nav a[href^="#"]') || [];
  links.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
  });
}

function syncActiveAccountModalSection() {
  const { scroller, sections } = getAccountModalScrollState();
  if (!scroller || !sections.length) {
    return;
  }

  const scrollerTop = scroller.getBoundingClientRect().top;
  let active = sections[0];
  for (const item of sections) {
    const top = item.section.getBoundingClientRect().top - scrollerTop;
    if (top <= 96) {
      active = item;
    }
  }

  if (active?.section?.id) {
    setActiveAccountModalSection(active.section.id);
  }
}

function scrollAccountModalToSection(sectionId) {
  const { scroller } = getAccountModalScrollState();
  const section = document.getElementById(sectionId);
  if (!scroller || !section) {
    return;
  }

  const scrollerRect = scroller.getBoundingClientRect();
  const sectionRect = section.getBoundingClientRect();
  const targetTop = sectionRect.top - scrollerRect.top + scroller.scrollTop - 8;
  setActiveAccountModalSection(sectionId);
  scroller.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
}

function closeFriendRequestsModal() {
  animateHideOverlay(ui.friendRequestsModal);
  ui.friendRequestsList.innerHTML = '';
}

function openFriendRequestsModal() {
  animateShowOverlay(ui.friendRequestsModal);
}

function closeAdminModal() {
  animateHideOverlay(ui.adminModal);
}

function openAdminModal() {
  animateShowOverlay(ui.adminModal);
}

function closeNotificationsModal() {
  animateHideOverlay(ui.notificationsModal);
}

function openNotificationsModal() {
  renderNotifications();
  animateShowOverlay(ui.notificationsModal);
}

function closeScreenSourceModal(selectedSource = null) {
  animateHideOverlay(ui.screenSourceModal);
  if (ui.screenSourceGrid) {
    ui.screenSourceGrid.innerHTML = '';
  }
  if (screenSourceState.resolver) {
    const resolve = screenSourceState.resolver;
    screenSourceState.resolver = null;
    resolve(selectedSource);
  }
}

function chooseScreenSource(sources) {
  if (!ui.screenSourceModal || !ui.screenSourceGrid) {
    return Promise.resolve(sources?.[0] || null);
  }

  ui.screenSourceGrid.innerHTML = '';
  for (const source of sources || []) {
    const button = document.createElement('button');
    button.className = 'screen-source-option';
    button.type = 'button';

    if (source.thumbnail) {
      const thumbnail = document.createElement('img');
      thumbnail.src = source.thumbnail;
      thumbnail.alt = '';
      button.appendChild(thumbnail);
    } else {
      const fallback = document.createElement('div');
      fallback.className = 'screen-source-thumb-fallback';
      fallback.textContent = 'No preview';
      button.appendChild(fallback);
    }

    const name = document.createElement('span');
    name.className = 'screen-source-name';
    name.textContent = source.name || 'Untitled source';
    button.appendChild(name);

    button.addEventListener('click', () => closeScreenSourceModal(source));
    ui.screenSourceGrid.appendChild(button);
  }

  animateShowOverlay(ui.screenSourceModal);
  const firstOption = ui.screenSourceGrid.querySelector('.screen-source-option');
  firstOption?.focus();

  return new Promise((resolve) => {
    screenSourceState.resolver = resolve;
  });
}

function pushNotificationItem(title, body) {
  state.notifications.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: String(title || 'Notification'),
    body: String(body || ''),
    createdAt: new Date().toISOString()
  });
  state.notifications = state.notifications.slice(0, 50);
  renderNotifications();
}

async function sendBrowserNotification(title, body) {
  if (typeof Notification === 'undefined') {
    return;
  }
  if (Notification.permission === 'default') {
    try {
      await Notification.requestPermission();
    } catch (_error) {
      return;
    }
  }
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, { body });
    } catch (_error) {
    }
  }
}

function notifyUser(title, body) {
  pushNotificationItem(title, body);
  sendBrowserNotification(title, body).catch(() => {});
}

function renderNotifications() {
  ui.notificationsList.innerHTML = '';
  if (!state.notifications.length) {
    const empty = document.createElement('div');
    empty.className = 'account-form-message';
    empty.textContent = 'No notifications yet.';
    ui.notificationsList.appendChild(empty);
    return;
  }

  for (const item of state.notifications) {
    const row = document.createElement('div');
    row.className = 'notification-item';

    const title = document.createElement('div');
    title.className = 'notification-title';
    title.textContent = item.title;

    const body = document.createElement('div');
    body.textContent = item.body;

    const meta = document.createElement('div');
    meta.className = 'notification-meta';
    meta.textContent = new Date(item.createdAt).toLocaleString();

    row.append(title, body, meta);
    ui.notificationsList.appendChild(row);
  }
}

function formatAdminServerJoinedAt(value) {
  if (!value) {
    return 'Joined date unavailable';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Joined date unavailable';
  }
  return `Joined ${date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

function escapeHtmlText(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeChatUrl(rawUrl) {
  const value = String(rawUrl || '').trim();
  if (!value) {
    return null;
  }
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const parsed = new URL(withProtocol);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.href;
  } catch (_error) {
    return null;
  }
}

function appendLinkedMessageText(container, value) {
  const text = String(value || '');
  const urlPattern = /((?:https?:\/\/|www\.)[^\s<]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<]*)?)/gi;
  let lastIndex = 0;
  let match;

  while ((match = urlPattern.exec(text)) !== null) {
    const rawMatch = match[0];
    const start = match.index;
    const leadingText = text.slice(lastIndex, start);
    if (leadingText) {
      container.appendChild(document.createTextNode(leadingText));
    }

    const trailingPunctuation = rawMatch.match(/[.,!?;:)\]}]+$/)?.[0] || '';
    const linkText = trailingPunctuation ? rawMatch.slice(0, -trailingPunctuation.length) : rawMatch;
    const href = normalizeChatUrl(linkText);
    if (href) {
      const link = document.createElement('a');
      link.href = href;
      link.textContent = linkText;
      link.dataset.href = href;
      link.rel = 'noopener noreferrer';
      container.appendChild(link);
    } else {
      container.appendChild(document.createTextNode(linkText));
    }
    if (trailingPunctuation) {
      container.appendChild(document.createTextNode(trailingPunctuation));
    }

    lastIndex = start + rawMatch.length;
  }

  const tail = text.slice(lastIndex);
  if (tail) {
    container.appendChild(document.createTextNode(tail));
  }
}

function formatFileSize(bytes) {
  const size = Number(bytes || 0);
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(size >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
  }
  if (size >= 1024) {
    return `${Math.ceil(size / 1024)} KB`;
  }
  return `${size} B`;
}

function formatAttachmentExpiry(expiresAt) {
  if (!expiresAt) {
    return 'No expiry';
  }
  const expires = new Date(expiresAt);
  if (Number.isNaN(expires.getTime())) {
    return 'Expiry unknown';
  }
  const msLeft = expires.getTime() - Date.now();
  if (msLeft <= 0) {
    return 'Expired';
  }
  const minutes = Math.ceil(msLeft / 60000);
  if (minutes < 60) {
    return `Expires in ${minutes} min`;
  }
  const hours = Math.ceil(minutes / 60);
  if (hours < 48) {
    return `Expires in ${hours} hr`;
  }
  const days = Math.ceil(hours / 24);
  return `Expires in ${days} day${days === 1 ? '' : 's'}`;
}

function getAttachmentUrl(attachment) {
  if (!attachment?.url) {
    return '';
  }
  if (window.api.attachments?.url) {
    return window.api.attachments.url(attachment.url);
  }
  return attachment.url;
}

function renderAttachment(container, attachment) {
  if (!attachment) {
    return;
  }

  const name = attachment.original_filename || 'Attachment';
  const mime = String(attachment.mime_type || '');
  const expiryLabel = formatAttachmentExpiry(attachment.expires_at);
  if (mime.startsWith('image/')) {
    const link = document.createElement('a');
    link.className = 'msg-attachment-image-link';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    const image = document.createElement('img');
    image.className = 'msg-attachment-image';
    image.alt = name;
    image.loading = 'lazy';
    image.dataset.attachmentId = String(attachment.id);
    image.addEventListener('error', () => {
      image.alt = 'Attachment failed to load.';
    });
    link.appendChild(image);
    const expiry = document.createElement('span');
    expiry.className = 'msg-attachment-expiry';
    expiry.textContent = expiryLabel;
    link.appendChild(expiry);
    container.appendChild(link);
    if (window.api.attachments?.objectUrl) {
      window.api.attachments.objectUrl(attachment.url).then((objectUrl) => {
        image.src = objectUrl;
        link.href = objectUrl;
      }).catch(() => {
        image.alt = 'Attachment failed to load.';
      });
    } else {
      const url = getAttachmentUrl(attachment);
      image.src = url;
      link.href = url;
    }
    return;
  }

  const link = document.createElement('a');
  link.className = 'msg-attachment-file';
  link.href = getAttachmentUrl(attachment);
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.innerHTML = '<i class="fa-solid fa-file-arrow-down" aria-hidden="true"></i>';
  link.addEventListener('click', async (event) => {
    if (!window.api.attachments?.objectUrl) {
      return;
    }
    event.preventDefault();
    try {
      const objectUrl = await window.api.attachments.objectUrl(attachment.url);
      window.open(objectUrl, '_blank', 'noopener,noreferrer');
    } catch (_error) {
      await showWarningDialog('Failed to open attachment.');
    }
  });

  const details = document.createElement('span');
  details.className = 'msg-attachment-file-details';
  const filename = document.createElement('strong');
  filename.textContent = name;
  const meta = document.createElement('small');
  meta.textContent = formatFileSize(attachment.file_size);
  const expiry = document.createElement('span');
  expiry.className = 'msg-attachment-expiry';
  expiry.textContent = expiryLabel;
  details.append(filename, meta, expiry);
  link.appendChild(details);
  container.appendChild(link);
}

function renderAttachmentChip() {
  if (!ui.attachmentChip) {
    return;
  }
  ui.attachmentChip.innerHTML = '';
  const file = state.selectedAttachment;
  ui.attachmentChip.classList.toggle('hidden', !file);
  if (!file) {
    return;
  }

  const icon = document.createElement('i');
  icon.className = 'fa-solid fa-paperclip';
  icon.setAttribute('aria-hidden', 'true');
  const text = document.createElement('span');
  text.textContent = `${file.name} (${formatFileSize(file.size)})`;
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.setAttribute('aria-label', 'Remove attachment');
  remove.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
  remove.addEventListener('click', () => {
    state.selectedAttachment = null;
    if (ui.attachmentInput) {
      ui.attachmentInput.value = '';
    }
    renderAttachmentChip();
  });
  ui.attachmentChip.append(icon, text, remove);
}

async function buildMessagePayload(basePayload, content) {
  if (!state.selectedAttachment) {
    return { ...basePayload, content };
  }

  if (window.api.attachments?.uploadMode === 'form') {
    const formData = new FormData();
    for (const [key, value] of Object.entries(basePayload)) {
      formData.append(key, value);
    }
    formData.append('content', content);
    formData.append('attachment', state.selectedAttachment);
    return formData;
  }

  if (window.api.attachments?.uploadMode === 'ipc') {
    return {
      ...basePayload,
      content,
      attachment: {
        name: state.selectedAttachment.name,
        type: state.selectedAttachment.type || 'application/octet-stream',
        size: state.selectedAttachment.size,
        bytes: await state.selectedAttachment.arrayBuffer()
      }
    };
  }

  await showWarningDialog('Attachments are not available in this app mode.');
  return null;
}

function clearSelectedAttachment() {
  state.selectedAttachment = null;
  if (ui.attachmentInput) {
    ui.attachmentInput.value = '';
  }
  renderAttachmentChip();
}

async function confirmAndOpenChatLink(link) {
  const href = link?.dataset?.href || link?.href || '';
  const destination = normalizeChatUrl(href);
  if (!destination) {
    return;
  }

  const confirmed = await showConfirmDialog(
    'Open Link',
    `This link will open:\n\n${destination}`,
    'Open',
    'Cancel'
  );
  if (!confirmed) {
    return;
  }

  window.open(destination, '_blank', 'noopener,noreferrer');
}

function sanitizeDialogHtml(html) {
  const template = document.createElement('template');
  template.innerHTML = String(html || '');
  const blockedTags = new Set(['script', 'iframe', 'object', 'embed', 'link', 'meta', 'style']);
  for (const element of template.content.querySelectorAll('*')) {
    if (blockedTags.has(element.tagName.toLowerCase())) {
      element.remove();
      continue;
    }
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      const value = String(attribute.value || '').trim().toLowerCase();
      if (name.startsWith('on') || value.startsWith('javascript:') || value.startsWith('data:text/html')) {
        element.removeAttribute(attribute.name);
      }
    }
  }
  return template.innerHTML;
}

function formatStandingLabel(standing) {
  const normalized = String(standing || 'good').replace(/_/g, ' ');
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

async function showAdminServerView(serverId) {
  const result = await window.api.admin.getServerView({ serverId });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }

  const channelItems = (result.channels || [])
    .map((channel) => `<li>#${escapeHtmlText(channel.name)} <span style="color:#94a3b8">(${escapeHtmlText(channel.type || 'text')})</span></li>`)
    .join('');
  const memberItems = (result.members || [])
    .map((member) => {
      const roleText = member.role_names?.length ? member.role_names.join(', ') : 'None';
      const badges = [member.is_owner ? 'Owner' : 'Member', member.platform_banned_at ? 'Platform Banned' : 'Active'].join(' - ');
      return `<li>${escapeHtmlText(member.username)} <span style="color:#94a3b8">(${escapeHtmlText(badges)} | Roles: ${escapeHtmlText(roleText)})</span></li>`;
    })
    .join('');
  const messageItems = (result.messages || [])
    .map((message) => {
      const content = String(message.content || '').trim() || '[file only]';
      const attachment = message.attachment
        ? `<div class="admin-server-message-attachment"><i class="fa-solid fa-paperclip" aria-hidden="true"></i>${escapeHtmlText(message.attachment.original_filename || 'Attachment')} (${escapeHtmlText(formatFileSize(message.attachment.file_size))}) <span>${escapeHtmlText(formatAttachmentExpiry(message.attachment.expires_at))}</span></div>`
        : '';
      return `
        <li class="admin-server-message-item">
          <div class="admin-server-message-topline">
            <strong>${escapeHtmlText(message.username || 'Unknown')}</strong>
            <span>#${escapeHtmlText(message.channel_name || 'channel')} - ${escapeHtmlText(new Date(message.created_at).toLocaleString())}</span>
          </div>
          <div class="admin-server-message-content">${escapeHtmlText(content)}</div>
          ${attachment}
        </li>
      `;
    })
    .join('');

  const html = `
    <p><strong>Server:</strong> ${escapeHtmlText(result.server?.name)}</p>
    <p><strong>Channels:</strong></p>
    <ul>${channelItems || '<li>No channels.</li>'}</ul>
    <p><strong>Members:</strong></p>
    <ul>${memberItems || '<li>No members.</li>'}</ul>
    <p><strong>Recent Messages:</strong></p>
    <ul class="admin-server-message-list">${messageItems || '<li>No messages.</li>'}</ul>
  `;
  await showMessageDialog(`Admin View: ${result.server?.name || 'Server'}`, html, { html: true });
}

function isAdminGhostServer(serverId = state.selectedServerId) {
  return Boolean(state.adminViewedServer?.server?.id === serverId);
}

function getAdminGhostMessagesForChannel(channelId) {
  return (state.adminViewedServer?.messages || []).filter((message) => message.channel_id === channelId);
}

function injectAdminGhostServer() {
  const server = state.adminViewedServer?.server;
  if (!server?.id) {
    return;
  }
  const ghostServer = {
    id: server.id,
    name: server.name,
    owner_user_id: server.owner_user_id,
    adminView: true
  };
  const existingIndex = state.servers.findIndex((item) => item.id === server.id);
  if (existingIndex >= 0) {
    state.servers[existingIndex] = { ...state.servers[existingIndex], ...ghostServer };
    return;
  }
  state.servers = [ghostServer, ...state.servers];
}

async function openAdminGhostServer(serverId) {
  const result = await window.api.admin.getServerView({ serverId });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }

  state.adminViewedServer = {
    server: result.server,
    channels: result.channels || [],
    members: result.members || [],
    messages: result.messages || []
  };
  injectAdminGhostServer();
  closeAdminModal();
  closeFriendsHome();
  state.selectedServerId = result.server.id;
  state.selectedDmUser = null;
  syncDmCallButton();
  closeServerOptions();
  closeUserOptions();
  renderServers();
  ui.serverTitle.textContent = `${result.server.name} (Admin View)`;
  await loadChannels(result.server.id);
  await loadServerPresence(result.server.id);
  if (window.innerWidth <= 700) {
    closeMobileDrawers();
  }
}

async function deleteAdminServer(serverId, serverName) {
  const confirmed = await showConfirmDialog('Delete Server', `Delete ${serverName}? This removes channels, messages, invites, and memberships.`, 'Delete', 'Cancel');
  if (!confirmed) {
    return;
  }

  const result = await window.api.admin.deleteServer({ serverId });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }

  ui.channelTitle.textContent = `${result.serverName || serverName} deleted.`;
  await loadAdminUsers(ui.adminSearchInput.value.trim());
  await loadAdminServers(ui.adminServerSearchInput?.value.trim() || '');
  await loadServers(false);
}

function renderAdminServers() {
  if (!ui.adminServersList) {
    return;
  }
  ui.adminServersList.innerHTML = '';
  if (!state.adminServers.length) {
    const empty = document.createElement('div');
    empty.className = 'account-form-message';
    empty.textContent = 'No servers found.';
    ui.adminServersList.appendChild(empty);
    return;
  }

  for (const server of state.adminServers) {
    const item = document.createElement('div');
    item.className = 'admin-server-item admin-server-search-item';

    const row = document.createElement('div');
    row.className = 'admin-server-row';

    const name = document.createElement('div');
    name.className = 'admin-server-name';
    name.textContent = server.name;

    const actions = document.createElement('div');
    actions.className = 'admin-server-actions';

    const viewBtn = document.createElement('button');
    viewBtn.type = 'button';
    setIconButtonContent(viewBtn, 'fa-solid fa-eye', 'Open');
    viewBtn.addEventListener('click', async () => {
      await openAdminGhostServer(server.id);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    setIconButtonContent(deleteBtn, 'fa-solid fa-trash', 'Delete');
    deleteBtn.addEventListener('click', async () => {
      await deleteAdminServer(server.id, server.name);
    });

    actions.append(viewBtn, deleteBtn);
    row.append(name, actions);

    const meta = document.createElement('div');
    meta.className = 'admin-server-meta';
    const owner = server.owner_username ? `Owner: ${server.owner_username}` : 'Owner: None';
    meta.textContent = `ID ${server.id} - ${owner} - ${server.member_count || 0} members - ${server.channel_count || 0} channels`;

    item.append(row, meta);
    ui.adminServersList.appendChild(item);
  }
}

async function loadAdminServers(query = '') {
  const result = await window.api.admin.listServers({ query });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }
  state.adminServers = result.servers || [];
  renderAdminServers();
}

function formatReportStatus(status) {
  const value = String(status || 'open');
  return value.charAt(0).toUpperCase() + value.slice(1);
}

async function updateAdminReport(report, status) {
  const note = status === 'open'
    ? ''
    : ((await showPromptDialog(
      'Review Report',
      `Add an optional note for marking this report ${formatReportStatus(status).toLowerCase()}:`,
      ''
    )) || '');
  const result = await window.api.admin.updateReport({
    reportId: report.id,
    status,
    reviewNote: note
  });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }
  await loadAdminReports(ui.adminReportFilter?.value || 'open');
  if (state.selectedAdminUserId === report.target_user_id) {
    await loadAdminUserDetails(report.target_user_id);
  }
}

function renderAdminReports() {
  if (!ui.adminReportsList) {
    return;
  }
  ui.adminReportsList.innerHTML = '';
  if (!state.adminReports.length) {
    const empty = document.createElement('div');
    empty.className = 'account-form-message';
    empty.textContent = 'No reports in this queue.';
    ui.adminReportsList.appendChild(empty);
    return;
  }

  for (const report of state.adminReports) {
    const item = document.createElement('div');
    item.className = 'admin-report-item admin-queue-report';

    const top = document.createElement('div');
    top.className = 'admin-report-topline';
    const target = document.createElement('button');
    target.type = 'button';
    target.className = 'admin-report-target-btn';
    target.textContent = report.target_username || `User ${report.target_user_id}`;
    target.addEventListener('click', async () => {
      await loadAdminUserDetails(report.target_user_id);
    });
    const status = document.createElement('span');
    status.className = `admin-report-status status-${report.status || 'open'}`;
    status.textContent = formatReportStatus(report.status);
    top.append(target, status);

    const reason = document.createElement('div');
    reason.textContent = report.reason;

    const meta = document.createElement('div');
    meta.className = 'admin-report-meta';
    const origin = report.server_name ? ` in ${report.server_name}` : '';
    meta.textContent = `Reported by ${report.reporter_username}${origin} on ${new Date(report.created_at).toLocaleString()}`;

    item.append(top, reason, meta);

    if (report.review_note || report.reviewed_by_username) {
      const review = document.createElement('div');
      review.className = 'admin-report-meta';
      const reviewedAt = report.reviewed_at ? ` on ${new Date(report.reviewed_at).toLocaleString()}` : '';
      const reviewedBy = report.reviewed_by_username ? `Reviewed by ${report.reviewed_by_username}${reviewedAt}` : 'Reviewed';
      review.textContent = report.review_note ? `${reviewedBy}: ${report.review_note}` : reviewedBy;
      item.appendChild(review);
    }

    const actions = document.createElement('div');
    actions.className = 'admin-report-actions';
    for (const action of [
      ['reviewed', 'Reviewed'],
      ['dismissed', 'Dismiss'],
      ['actioned', 'Actioned']
    ]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = action[1];
      button.disabled = report.status === action[0];
      button.addEventListener('click', async () => {
        await updateAdminReport(report, action[0]);
      });
      actions.appendChild(button);
    }
    if (report.status !== 'open') {
      const reopen = document.createElement('button');
      reopen.type = 'button';
      reopen.textContent = 'Reopen';
      reopen.addEventListener('click', async () => {
        await updateAdminReport(report, 'open');
      });
      actions.appendChild(reopen);
    }
    item.appendChild(actions);
    ui.adminReportsList.appendChild(item);
  }
}

async function updateAdminBanAppeal(appeal, status) {
  const note = ((await showPromptDialog(
    'Review Ban Appeal',
    `Add an optional note for marking this appeal ${status}:`,
    ''
  )) || '');
  const result = await window.api.admin.updateBanAppeal({
    appealId: appeal.id,
    status,
    reviewNote: note
  });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }
  await loadAdminBanAppeals(ui.adminAppealFilter?.value || 'open');
  await loadAdminUsers(ui.adminSearchInput?.value.trim() || '');
}

function renderAdminBanAppeals() {
  if (!ui.adminAppealsList) {
    return;
  }
  ui.adminAppealsList.innerHTML = '';
  if (!state.adminAppeals.length) {
    const empty = document.createElement('div');
    empty.className = 'account-form-message';
    empty.textContent = 'No ban appeals in this queue.';
    ui.adminAppealsList.appendChild(empty);
    return;
  }

  for (const appeal of state.adminAppeals) {
    const item = document.createElement('div');
    item.className = 'admin-report-item admin-queue-report';
    const top = document.createElement('div');
    top.className = 'admin-report-topline';
    const title = document.createElement('button');
    title.type = 'button';
    title.className = 'admin-report-target-btn';
    title.textContent = `${appeal.username} (${appeal.email})`;
    title.addEventListener('click', async () => {
      setAdminView('users');
      await loadAdminUserDetails(appeal.user_id);
    });
    const status = document.createElement('span');
    status.className = `admin-report-status status-${appeal.status || 'open'}`;
    status.textContent = formatReportStatus(appeal.status || 'open');
    top.append(title, status);

    const meta = document.createElement('div');
    meta.className = 'admin-report-meta';
    meta.textContent = `Submitted ${new Date(appeal.created_at).toLocaleString()}`;
    const reason = document.createElement('div');
    reason.className = 'admin-report-reason';
    reason.textContent = appeal.reason;
    item.append(top, meta, reason);

    if (appeal.review_note || appeal.reviewed_by_username) {
      const review = document.createElement('div');
      review.className = 'admin-report-meta';
      const reviewedAt = appeal.reviewed_at ? ` on ${new Date(appeal.reviewed_at).toLocaleString()}` : '';
      review.textContent = `${appeal.reviewed_by_username ? `Reviewed by ${appeal.reviewed_by_username}${reviewedAt}` : 'Reviewed'}${appeal.review_note ? `: ${appeal.review_note}` : ''}`;
      item.appendChild(review);
    }

    if (appeal.status === 'open') {
      const actions = document.createElement('div');
      actions.className = 'admin-report-actions';
      for (const [nextStatus, label] of [['reviewed', 'Reviewed'], ['dismissed', 'Dismiss'], ['approved', 'Approve + Unban']]) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.addEventListener('click', async () => updateAdminBanAppeal(appeal, nextStatus));
        actions.appendChild(button);
      }
      item.appendChild(actions);
    }
    ui.adminAppealsList.appendChild(item);
  }
}

async function loadAdminBanAppeals(status = 'open') {
  const result = await window.api.admin.listBanAppeals({ status });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }
  state.adminAppeals = result.appeals || [];
  renderAdminBanAppeals();
}

async function loadAdminReports(status = 'open') {
  const result = await window.api.admin.listReports({ status });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }
  state.adminReports = result.reports || [];
  renderAdminReports();
}

function renderAdminStorageItem(container, label, value) {
  const item = document.createElement('div');
  item.className = 'admin-storage-item';
  const title = document.createElement('div');
  title.className = 'admin-storage-label';
  title.textContent = label;
  const content = document.createElement('div');
  content.className = 'admin-storage-value';
  content.textContent = value;
  item.append(title, content);
  container.appendChild(item);
}

function renderAdminStorageEditableItem(container, label, inputId, value, options = {}) {
  const item = document.createElement('div');
  item.className = 'admin-storage-item admin-storage-editable-item';
  const title = document.createElement('label');
  title.className = 'admin-storage-label';
  title.setAttribute('for', inputId);
  title.textContent = label;
  const input = document.createElement('input');
  input.id = inputId;
  input.className = 'admin-storage-value-input';
  input.type = 'number';
  input.step = String(options.step || 1);
  input.min = String(options.min ?? 0);
  if (options.max !== undefined) {
    input.max = String(options.max);
  }
  input.value = String(value);
  item.append(title, input);
  container.appendChild(item);
}

function renderAdminStorageQuotaBar(container, activeBytes, quotaMb) {
  const item = document.createElement('div');
  item.className = 'admin-storage-item admin-storage-quota-item';
  const title = document.createElement('div');
  title.className = 'admin-storage-label';
  title.textContent = 'Storage Quota Usage';
  const summary = document.createElement('div');
  summary.className = 'admin-storage-value admin-storage-quota-summary';
  const track = document.createElement('div');
  track.className = 'admin-storage-quota-track';
  const fill = document.createElement('div');
  fill.className = 'admin-storage-quota-fill';
  track.appendChild(fill);

  const update = (nextQuotaMb) => {
    const quotaBytes = Math.max(0, Number(nextQuotaMb || 0)) * 1024 * 1024;
    const percent = quotaBytes > 0 ? Math.min(100, Math.round((Number(activeBytes || 0) / quotaBytes) * 100)) : 0;
    fill.style.width = `${percent}%`;
    fill.classList.toggle('is-warn', percent >= 70 && percent < 90);
    fill.classList.toggle('is-danger', percent >= 90);
    summary.textContent = quotaBytes > 0
      ? `${formatFileSize(activeBytes)} / ${formatFileSize(quotaBytes)} (${percent}%)`
      : `${formatFileSize(activeBytes)} / Unlimited`;
  };

  item.append(title, summary, track);
  container.appendChild(item);
  update(quotaMb);
  return update;
}

function formatStorageDate(value) {
  return value ? new Date(value).toLocaleString() : 'None';
}

function renderAdminStorage(data) {
  if (!ui.adminStorageConfig || !ui.adminStorageStats) {
    return;
  }
  const config = data?.config || {};
  const stats = data?.stats || {};
  ui.adminStorageConfig.innerHTML = '';
  ui.adminStorageStats.innerHTML = '';

  renderAdminStorageItem(ui.adminStorageConfig, 'Uploads Folder', config.attachmentsDir || 'uploads/attachments');
  renderAdminStorageEditableItem(ui.adminStorageConfig, 'Max File Size MB', 'storage-max-upload-mb-input', config.maxUploadMb ?? 10, { min: 1, max: 1024 });
  renderAdminStorageEditableItem(ui.adminStorageConfig, 'Attachment Expiry Days', 'storage-expire-days-input', config.expireDays ?? 30, { min: 1, max: 3650 });
  renderAdminStorageEditableItem(ui.adminStorageConfig, 'Daily Uploads Per User', 'storage-max-uploads-day-input', config.maxUploadsPerDay ?? 50, { min: 1, max: 10000 });
  renderAdminStorageEditableItem(ui.adminStorageConfig, 'Storage Quota MB', 'storage-quota-mb-input', config.storageQuotaMb ?? 0, { min: 0, max: 1048576 });
  const updateQuotaBar = renderAdminStorageQuotaBar(ui.adminStorageConfig, Number(stats.active_bytes || 0), config.storageQuotaMb ?? 0);
  document.getElementById('storage-quota-mb-input')?.addEventListener('input', (event) => {
    updateQuotaBar(event.target.value);
  });
  renderAdminStorageItem(ui.adminStorageConfig, 'Encryption', config.encryptionEnabled ? 'AES-256-GCM enabled' : 'Disabled');
  renderAdminStorageItem(ui.adminStorageConfig, 'Custom Key', config.encryptionKeyConfigured ? 'Configured' : 'Using fallback key');
  renderAdminStorageEditableItem(ui.adminStorageConfig, 'Cleanup Interval Minutes', 'cleanup-interval-minutes-input', config.cleanupIntervalMinutes ?? 60, { min: 5, max: 10080 });
  renderAdminStorageEditableItem(ui.adminStorageConfig, 'Empty Server Cleanup Days', 'cleanup-empty-server-days-input', config.emptyServerCleanupDays ?? 7, { min: 0, max: 3650 });
  renderAdminStorageEditableItem(ui.adminStorageConfig, 'Banned User Cleanup Days', 'cleanup-banned-user-days-input', config.bannedUserCleanupDays ?? 30, { min: 0, max: 3650 });
  renderAdminStorageItem(ui.adminStorageConfig, 'Blocked Types', (config.blockedExtensions || []).join(', '));

  renderAdminStorageItem(ui.adminStorageStats, 'Active Attachments', `${stats.active_attachments || 0}`);
  renderAdminStorageItem(ui.adminStorageStats, 'Active Size', formatFileSize(stats.active_bytes || 0));
  if (config.storageQuotaMb > 0) {
    const quotaBytes = Number(config.storageQuotaMb || 0) * 1024 * 1024;
    const activeBytes = Number(stats.active_bytes || 0);
    const percent = quotaBytes > 0 ? Math.min(100, Math.round((activeBytes / quotaBytes) * 100)) : 0;
    renderAdminStorageItem(ui.adminStorageStats, 'Quota Used', `${formatFileSize(activeBytes)} / ${formatFileSize(quotaBytes)} (${percent}%)`);
  } else {
    renderAdminStorageItem(ui.adminStorageStats, 'Quota Used', `${formatFileSize(stats.active_bytes || 0)} / Unlimited`);
  }
  renderAdminStorageItem(ui.adminStorageStats, 'Total Stored Records', `${stats.total_attachments || 0}`);
  renderAdminStorageItem(ui.adminStorageStats, 'Total Original Size', formatFileSize(stats.total_bytes || 0));
  renderAdminStorageItem(ui.adminStorageStats, 'Expired Waiting Cleanup', `${stats.expired_attachments || 0}`);
  renderAdminStorageItem(ui.adminStorageStats, 'Expiring Within 7 Days', `${stats.expiring_soon || 0}`);
  renderAdminStorageItem(ui.adminStorageStats, 'Legacy Unencrypted', `${stats.legacy_unencrypted || 0}`);
  renderAdminStorageItem(ui.adminStorageStats, 'Newest Upload', formatStorageDate(stats.newest_attachment_at));
}

async function loadAdminStorage() {
  const result = await window.api.admin.getStorageConfig();
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }
  renderAdminStorage(result);
}

async function saveAdminCleanupSettings() {
  const storageMaxUploadMbInput = document.getElementById('storage-max-upload-mb-input');
  const storageExpireDaysInput = document.getElementById('storage-expire-days-input');
  const storageMaxUploadsDayInput = document.getElementById('storage-max-uploads-day-input');
  const storageQuotaMbInput = document.getElementById('storage-quota-mb-input');
  const cleanupEmptyServerDaysInput = document.getElementById('cleanup-empty-server-days-input');
  const cleanupBannedUserDaysInput = document.getElementById('cleanup-banned-user-days-input');
  const cleanupIntervalMinutesInput = document.getElementById('cleanup-interval-minutes-input');
  const payload = {
    maxUploadMb: Number(storageMaxUploadMbInput?.value || 10),
    expireDays: Number(storageExpireDaysInput?.value || 30),
    maxUploadsPerDay: Number(storageMaxUploadsDayInput?.value || 50),
    storageQuotaMb: Number(storageQuotaMbInput?.value || 0),
    emptyServerCleanupDays: Number(cleanupEmptyServerDaysInput?.value || 0),
    bannedUserCleanupDays: Number(cleanupBannedUserDaysInput?.value || 0),
    cleanupIntervalMinutes: Number(cleanupIntervalMinutesInput?.value || 60)
  };
  const result = await window.api.admin.updateCleanupSettings(payload);
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }
  await loadAdminStorage();
  await showMessageDialog('Storage Settings Saved', 'Your storage settings were updated.', {
    okLabel: 'Done'
  });
}

function setAdminView(viewName) {
  const selected = String(viewName || 'reports');
  ui.adminModal?.querySelectorAll('.admin-modal-nav a[data-admin-view]').forEach((link) => {
    link.classList.toggle('active', link.dataset.adminView === selected);
  });
  ui.adminModal?.querySelectorAll('.admin-view-section').forEach((section) => {
    section.classList.toggle('hidden', section.id !== `admin-${selected}-view`);
  });
  if (selected === 'reports') {
    loadAdminReports(ui.adminReportFilter?.value || 'open').catch(() => {});
  } else if (selected === 'appeals') {
    loadAdminBanAppeals(ui.adminAppealFilter?.value || 'open').catch(() => {});
  } else if (selected === 'users') {
    loadAdminUsers(ui.adminSearchInput?.value.trim() || '').catch(() => {});
  } else if (selected === 'servers') {
    loadAdminServers(ui.adminServerSearchInput?.value.trim() || '').catch(() => {});
  } else if (selected === 'storage') {
    loadAdminStorage().catch(() => {});
  }
}

function renderAdminUserDetails() {
  const details = state.adminUserDetails;
  if (!details?.user) {
    ui.adminUserDetailsTitle.textContent = 'Select a user';
    ui.adminUserDetailsMeta.textContent = 'Click a user to see which servers they are in.';
    ui.adminUserServersList.innerHTML = '';
    ui.adminUserReportsList.innerHTML = '';
    return;
  }

  const user = details.user;
  const role = user.is_platform_admin ? 'Platform Admin' : 'Member';
  const banStatus = user.platform_banned_at ? 'Banned' : 'Active';
  ui.adminUserDetailsTitle.textContent = user.username;
  ui.adminUserDetailsMeta.textContent = `${user.email} - ${role} - ${banStatus} - Standing: ${formatStandingLabel(user.account_standing)} (${user.tos_violation_count || 0})`;
  ui.adminUserServersList.innerHTML = '';
  ui.adminUserReportsList.innerHTML = '';

  if (!details.servers?.length) {
    const empty = document.createElement('div');
    empty.className = 'account-form-message';
    empty.textContent = 'This user is not in any servers.';
    ui.adminUserServersList.appendChild(empty);
  } else {
    for (const server of details.servers) {
      const item = document.createElement('div');
      item.className = 'admin-server-item';

      const row = document.createElement('div');
      row.className = 'admin-server-row';

      const name = document.createElement('div');
      name.className = 'admin-server-name';
      name.textContent = server.name;

      const actions = document.createElement('div');
      actions.className = 'admin-server-actions';

      const viewBtn = document.createElement('button');
      viewBtn.type = 'button';
      setIconButtonContent(viewBtn, 'fa-solid fa-eye', 'Open');
      viewBtn.addEventListener('click', async () => {
        await openAdminGhostServer(server.id);
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      setIconButtonContent(deleteBtn, 'fa-solid fa-trash', 'Delete Server');
      deleteBtn.addEventListener('click', async () => {
        await deleteAdminServer(server.id, server.name);
      });

      actions.append(viewBtn, deleteBtn);
      row.append(name, actions);

      const meta = document.createElement('div');
      meta.className = 'admin-server-meta';
      const roleText = server.role_names?.length ? `Roles: ${server.role_names.join(', ')}` : 'Roles: None';
      meta.textContent = `${server.is_owner ? 'Owner' : 'Member'} - ${formatAdminServerJoinedAt(server.joined_at)} - ${roleText}`;

      item.append(row, meta);
      ui.adminUserServersList.appendChild(item);
    }
  }

  const reportsTitle = document.createElement('div');
  reportsTitle.className = 'admin-server-name';
  reportsTitle.textContent = 'Reports';
  ui.adminUserReportsList.appendChild(reportsTitle);

  if (!details.reports?.length) {
    const empty = document.createElement('div');
    empty.className = 'account-form-message';
    empty.textContent = 'No reports for this account.';
    ui.adminUserReportsList.appendChild(empty);
    return;
  }

  for (const report of details.reports) {
    const item = document.createElement('div');
    item.className = 'admin-report-item';

    const reason = document.createElement('div');
    reason.textContent = report.reason;

    const status = document.createElement('div');
    status.className = `admin-report-status status-${report.status || 'open'}`;
    status.textContent = formatReportStatus(report.status);

    const meta = document.createElement('div');
    meta.className = 'admin-report-meta';
    const origin = report.server_name ? ` in ${report.server_name}` : '';
    meta.textContent = `Reported by ${report.reporter_username}${origin} on ${new Date(report.created_at).toLocaleString()}`;

    item.append(reason, status, meta);
    if (report.review_note || report.reviewed_by_username) {
      const review = document.createElement('div');
      review.className = 'admin-report-meta';
      const reviewedAt = report.reviewed_at ? ` on ${new Date(report.reviewed_at).toLocaleString()}` : '';
      const reviewedBy = report.reviewed_by_username ? `Reviewed by ${report.reviewed_by_username}${reviewedAt}` : 'Reviewed';
      review.textContent = report.review_note ? `${reviewedBy}: ${report.review_note}` : reviewedBy;
      item.appendChild(review);
    }
    ui.adminUserReportsList.appendChild(item);
  }
}

async function loadAdminUserDetails(userId) {
  const result = await window.api.admin.getUserDetails({ userId });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }
  state.selectedAdminUserId = userId;
  state.adminUserDetails = result;
  renderAdminUsers();
  renderAdminUserDetails();
}

function renderAdminUsers() {
  ui.adminUsersList.innerHTML = '';
  if (!state.adminUsers.length) {
    const empty = document.createElement('div');
    empty.className = 'account-form-message';
    empty.textContent = 'No users found.';
    ui.adminUsersList.appendChild(empty);
    return;
  }

  for (const user of state.adminUsers) {
    const row = document.createElement('div');
    row.className = 'admin-user-item';
    row.classList.toggle('active', user.id === state.selectedAdminUserId);
    row.addEventListener('click', () => {
      loadAdminUserDetails(user.id);
    });
    const avatar = createAvatarElement(user);
    const meta = document.createElement('div');
    meta.className = 'admin-user-meta';
    const name = document.createElement('div');
    name.className = 'admin-user-name';
    name.textContent = user.username || 'Unknown';
    const email = document.createElement('div');
    email.className = 'admin-user-email';
    email.textContent = user.email || '';
    const flags = document.createElement('div');
    flags.className = 'admin-user-flags';
    flags.textContent = `${user.is_platform_admin ? 'Admin' : 'Member'}${user.platform_banned_at ? ' - Banned' : ''}`;
    meta.append(name, email, flags);

    const actions = document.createElement('div');
    actions.className = 'admin-user-actions';

    const warnBtn = document.createElement('button');
    warnBtn.type = 'button';
    setIconButtonContent(warnBtn, 'fa-solid fa-triangle-exclamation', 'Warn');
    warnBtn.disabled = user.id === state.user?.id;
    warnBtn.addEventListener('click', async (event) => {
      event.stopPropagation();
      const reason = (await showPromptDialog('Account Standing', `Reason for warning ${user.username}:`, 'Terms of Service warning')) || '';
      if (!reason) {
        return;
      }
      const result = await window.api.admin.updateUser({
        userId: user.id,
        accountStanding: 'warning',
        standingReason: reason,
        incrementViolations: true
      });
      if (!result.ok) {
        await showWarningDialog(result.message);
        return;
      }
      await loadAdminUsers(ui.adminSearchInput.value.trim());
      if (state.selectedAdminUserId === user.id) {
        await loadAdminUserDetails(user.id);
      }
    });

    const restrictBtn = document.createElement('button');
    restrictBtn.type = 'button';
    setIconButtonContent(restrictBtn, 'fa-solid fa-lock', 'Restrict');
    restrictBtn.disabled = user.id === state.user?.id;
    restrictBtn.addEventListener('click', async (event) => {
      event.stopPropagation();
      const reason = (await showPromptDialog('Account Standing', `Reason for restricting ${user.username}:`, 'Restricted for Terms of Service violations')) || '';
      if (!reason) {
        return;
      }
      const result = await window.api.admin.updateUser({
        userId: user.id,
        accountStanding: 'restricted',
        standingReason: reason,
        incrementViolations: true
      });
      if (!result.ok) {
        await showWarningDialog(result.message);
        return;
      }
      await loadAdminUsers(ui.adminSearchInput.value.trim());
      if (state.selectedAdminUserId === user.id) {
        await loadAdminUserDetails(user.id);
      }
    });

    const adminBtn = document.createElement('button');
    adminBtn.type = 'button';
    setIconButtonContent(adminBtn, user.is_platform_admin ? 'fa-solid fa-user-minus' : 'fa-solid fa-user-shield', user.is_platform_admin ? 'Remove Admin' : 'Make Admin');
    adminBtn.disabled = user.id === state.user?.id;
    adminBtn.addEventListener('click', async (event) => {
      event.stopPropagation();
      const result = await window.api.admin.updateUser({
        userId: user.id,
        isPlatformAdmin: !user.is_platform_admin
      });
      if (!result.ok) {
        await showWarningDialog(result.message);
        return;
      }
      await loadAdminUsers(ui.adminSearchInput.value.trim());
      if (state.selectedAdminUserId === user.id) {
        await loadAdminUserDetails(user.id);
      }
    });

    const banBtn = document.createElement('button');
    banBtn.type = 'button';
    setIconButtonContent(banBtn, user.platform_banned_at ? 'fa-solid fa-unlock' : 'fa-solid fa-ban', user.platform_banned_at ? 'Unban' : 'Ban');
    banBtn.disabled = user.id === state.user?.id;
    banBtn.addEventListener('click', async (event) => {
      event.stopPropagation();
      const reason = user.platform_banned_at
        ? ''
        : ((await showPromptDialog('Platform Ban', 'Ban reason (optional):', '')) || '');
      const result = await window.api.admin.updateUser({
        userId: user.id,
        platformBanned: !user.platform_banned_at,
        platformBanReason: reason
      });
      if (!result.ok) {
        await showWarningDialog(result.message);
        return;
      }
      await loadAdminUsers(ui.adminSearchInput.value.trim());
      if (state.selectedAdminUserId === user.id) {
        await loadAdminUserDetails(user.id);
      }
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    setIconButtonContent(deleteBtn, 'fa-solid fa-trash', 'Delete');
    deleteBtn.disabled = user.id === state.user?.id;
    deleteBtn.addEventListener('click', async (event) => {
      event.stopPropagation();
      const confirmed = await showConfirmDialog('Delete User', `Delete ${user.username}?`, 'Delete', 'Cancel');
      if (!confirmed) {
        return;
      }
      const result = await window.api.admin.deleteUser({ userId: user.id });
      if (!result.ok) {
        await showWarningDialog(result.message);
        return;
      }
      await loadAdminUsers(ui.adminSearchInput.value.trim());
      if (state.selectedAdminUserId === user.id) {
        state.selectedAdminUserId = null;
        state.adminUserDetails = null;
        renderAdminUsers();
        renderAdminUserDetails();
      }
    });

    const clearStandingBtn = document.createElement('button');
    clearStandingBtn.type = 'button';
    clearStandingBtn.textContent = 'Clear Standing';
    clearStandingBtn.disabled = user.id === state.user?.id;
    clearStandingBtn.addEventListener('click', async (event) => {
      event.stopPropagation();
      const result = await window.api.admin.updateUser({
        userId: user.id,
        accountStanding: 'good',
        standingReason: '',
        resetViolations: true
      });
      if (!result.ok) {
        await showWarningDialog(result.message);
        return;
      }
      await loadAdminUsers(ui.adminSearchInput.value.trim());
      if (state.selectedAdminUserId === user.id) {
        await loadAdminUserDetails(user.id);
      }
    });

    actions.append(warnBtn, restrictBtn, clearStandingBtn, adminBtn, banBtn, deleteBtn);
    meta.appendChild(actions);
    row.append(avatar, meta);
    ui.adminUsersList.appendChild(row);
  }
}

async function loadAdminUsers(query = '') {
  const result = await window.api.admin.listUsers({ query });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }
  state.adminUsers = result.users || [];
  if (!state.adminUsers.some((user) => user.id === state.selectedAdminUserId)) {
    state.selectedAdminUserId = null;
    state.adminUserDetails = null;
  }
  renderAdminUsers();
  renderAdminUserDetails();
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
    const name = document.createElement('div');
    name.className = 'friend-request-name';
    name.textContent = request.username || 'Unknown';
    meta.appendChild(name);
    const avatar = createAvatarElement(request);

    const acceptBtn = document.createElement('button');
    acceptBtn.className = 'friend-request-action friend-request-accept';
    acceptBtn.type = 'button';
    acceptBtn.title = 'Accept';
    setIconOnlyButtonContent(acceptBtn, 'fa-solid fa-check', 'Accept');
    acceptBtn.addEventListener('click', async () => {
      const result = await window.api.friends.respondRequest({ requestId: request.id, action: 'accept' });
      if (!result.ok) {
        await showWarningDialog(result.message);
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
    setIconOnlyButtonContent(rejectBtn, 'fa-solid fa-xmark', 'Reject');
    rejectBtn.addEventListener('click', async () => {
      const result = await window.api.friends.respondRequest({ requestId: request.id, action: 'reject' });
      if (!result.ok) {
        await showWarningDialog(result.message);
        return;
      }
      const next = await window.api.friends.getRequests();
      if (next.ok) {
        renderFriendRequests(next.requests || []);
      }
      ui.channelTitle.textContent = 'Friend request rejected.';
    });

    row.append(avatar, meta, acceptBtn, rejectBtn);
    ui.friendRequestsList.appendChild(row);
  }
}

function openAccountModal() {
  ui.accountUsernameInput.value = state.user?.username || '';
  ui.accountEmailInput.value = state.user?.email || '';
  ui.accountAvatarInput.value = state.user?.avatar_url || '';
  ui.accountDobInput.value = normalizeDob(state.user?.date_of_birth);
  ui.accountCurrentPasswordInput.value = '';
  ui.accountNewPasswordInput.value = '';
  setAccountFormMessage('');
  animateShowOverlay(ui.accountModal);
  const { scroller } = getAccountModalScrollState();
  if (scroller) {
    scroller.scrollTop = 0;
  }
  setActiveAccountModalSection('account-info-section');
  setTimeout(syncActiveAccountModalSection, 0);
  loadPasskeys().catch(() => {});
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

async function maybePromptForAvatar() {
  if (!state.user || state.avatarPromptShown || String(state.user.avatar_url || '').trim()) {
    return;
  }
  state.avatarPromptShown = true;
  const shouldOpen = await showConfirmDialog(
    'Add a Profile Picture',
    'You do not have a profile picture yet. Open account settings to add one now?',
    'Open Settings',
    'Later'
  );
  if (shouldOpen) {
    openAccountModal();
  }
}

async function startPasskeyRegistration() {
  if (!isPasskeySupportedInBrowser()) {
    setAccountFormMessage('Passkeys need a supported secure browser session.', true);
    return;
  }

  const optionsResponse = await window.api.auth.beginPasskeyRegistration();
  if (!optionsResponse.ok) {
    setAccountFormMessage(optionsResponse.message || 'Failed to start passkey setup.', true);
    return;
  }

  const options = optionsResponse.options || {};
  try {
    const credential = await navigator.credentials.create({
      publicKey: {
        ...options,
        challenge: base64UrlToArrayBuffer(options.challenge),
        user: {
          ...options.user,
          id: base64UrlToArrayBuffer(options.user?.id)
        },
        excludeCredentials: Array.isArray(options.excludeCredentials)
          ? options.excludeCredentials.map((item) => ({
            ...item,
            id: base64UrlToArrayBuffer(item.id)
          }))
          : []
      }
    });

    if (!credential || !credential.response || typeof credential.response.getPublicKey !== 'function') {
      setAccountFormMessage('This browser did not provide the passkey public key. Try a newer browser.', true);
      return;
    }

    const verifyResponse = await window.api.auth.finishPasskeyRegistration({
      id: credential.id,
      rawId: arrayBufferToBase64Url(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: arrayBufferToBase64Url(credential.response.clientDataJSON),
        authenticatorData: arrayBufferToBase64Url(credential.response.getAuthenticatorData()),
        publicKey: arrayBufferToBase64Url(credential.response.getPublicKey()),
        publicKeyAlgorithm: credential.response.getPublicKeyAlgorithm?.() ?? null,
        transports: credential.response.getTransports?.() || []
      }
    });

    if (!verifyResponse.ok) {
      setAccountFormMessage(verifyResponse.message || 'Failed to save passkey.', true);
      return;
    }

    state.passkeys.push(verifyResponse.passkey);
    renderPasskeys();
    setAccountFormMessage('Passkey added successfully.');
  } catch (error) {
    const message = error?.name === 'NotAllowedError'
      ? 'Passkey setup was canceled.'
      : `Passkey setup failed: ${error.message || error}`;
    setAccountFormMessage(message, error?.name !== 'NotAllowedError');
  }
}

async function startPasskeyLogin() {
  if (!isPasskeySupportedInBrowser()) {
    setAuthMessage('Passkeys need a supported secure browser session.', true);
    return;
  }

  const optionsResponse = await window.api.auth.beginPasskeyLogin();
  if (!optionsResponse.ok) {
    setAuthMessage(optionsResponse.message || 'Failed to start passkey sign-in.', true);
    return;
  }

  const options = optionsResponse.options || {};
  try {
    const credential = await navigator.credentials.get({
      publicKey: {
        ...options,
        challenge: base64UrlToArrayBuffer(options.challenge),
        allowCredentials: Array.isArray(options.allowCredentials)
          ? options.allowCredentials.map((item) => ({
            ...item,
            id: base64UrlToArrayBuffer(item.id)
          }))
          : []
      }
    });

    if (!credential) {
      setAuthMessage('Passkey sign-in was canceled.', true);
      return;
    }

    const verifyResponse = await window.api.auth.finishPasskeyLogin({
      id: credential.id,
      rawId: arrayBufferToBase64Url(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: arrayBufferToBase64Url(credential.response.clientDataJSON),
        authenticatorData: arrayBufferToBase64Url(credential.response.authenticatorData),
        signature: arrayBufferToBase64Url(credential.response.signature),
        userHandle: credential.response.userHandle ? arrayBufferToBase64Url(credential.response.userHandle) : ''
      }
    });

    if (!verifyResponse.ok) {
      setAuthMessage(verifyResponse.message || 'Passkey sign-in failed.', true);
      return;
    }

    await completeSignedInState(verifyResponse);
  } catch (error) {
    const message = error?.name === 'NotAllowedError'
      ? 'Passkey sign-in was canceled.'
      : `Passkey sign-in failed: ${error.message || error}`;
    setAuthMessage(message, error?.name !== 'NotAllowedError');
  }
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

async function openVoiceView(roomLabel, channelId, tokenData, options = {}) {
  const sdk = window.LivekitClient;
  if (!sdk) {
    setVcStatus('Voice SDK failed to load.');
    await showWarningDialog('Voice SDK failed to load.', 'Voice Unavailable');
    return;
  }

  const { Room } = sdk;
  if (!Room) {
    setVcStatus('Voice SDK unavailable.');
    await showWarningDialog('Voice SDK unavailable.', 'Voice Unavailable');
    return;
  }

  if (state.voiceRoom) {
    leaveVoiceView();
  }

  ui.channelTitle.textContent = `Connecting to ${roomLabel}...`;
  state.activeVoiceLabel = roomLabel;
  ui.vcRoomTitle.textContent = roomLabel;
  ui.vcPanel?.classList.add('voice-call-active');
  renderPendingVoiceParticipants(state.user?.username || 'You');
  syncVoicePanelVisibility();
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
    state.activeVoiceChannelId = channelId || null;
    state.activeDmCallUserId = Number(options.dmUserId) || null;
    state.activeVoiceLabel = roomLabel;
    state.isScreenSharing = false;

    ui.vcRoomTitle.textContent = roomLabel;
    syncVoicePanelVisibility();

    state.isVoiceMuted = true;
    updateVoiceButtons();
    renderVoiceParticipants();

    let vcStatus = `Connected to ${roomLabel}`;

    if (canUseMicrophoneApi()) {
      try {
        const audioTrack = await createGainControlledMicTrack();
        if (!audioTrack) {
          throw new Error('No microphone track was captured.');
        }
        state.localMicPublication = await room.localParticipant.publishTrack(audioTrack, {
          name: 'microphone',
          source: LivekitClient.Track?.Source?.Microphone || 'microphone'
        });
        state.isVoiceMuted = false;
      } catch (micError) {
        cleanupLocalMic();
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
    state.activeDmCallUserId = null;
    state.activeVoiceLabel = '';
    state.isScreenSharing = false;
    syncVoicePanelVisibility();

    const iss = tokenData?.debug?.iss ? ` iss=${tokenData.debug.iss}` : '';
    const room = tokenData?.debug?.room ? ` room=${tokenData.debug.room}` : '';
    const url = tokenData?.livekitUrl ? ` url=${tokenData.livekitUrl}` : '';

    setVcStatus(`Failed to join voice: ${error.message}${iss}${room}${url}`);
    await showWarningDialog(`Failed to join VC: ${error.message}`, 'Voice Unavailable');

    renderVoiceParticipants();
  }
}

function setAuthMessage(message, isError = false) {
  ui.authMessage.textContent = message;
  ui.authMessage.style.color = isError ? 'var(--danger)' : 'var(--muted)';
}

function setBanAppealMessage(message, isError = false) {
  if (!ui.banAppealMessage) {
    return;
  }
  ui.banAppealMessage.textContent = message;
  ui.banAppealMessage.style.color = isError ? 'var(--danger)' : 'var(--muted)';
}

function showBanAppealPrompt(result, email = '') {
  openBanAppealPage(result, email);
}

function openBanAppealPage(result = null, email = '') {
  ui.authPanel?.classList.add('hidden');
  ui.chatPanel?.classList.add('hidden');
  ui.banAppealPage?.classList.remove('hidden');
  ui.appShell?.classList.remove('chat-mode');
  closeMobileDrawers();
  closeServerOptions();
  closeUserOptions();
  closeAccountSettingsMenu();
  closeAccountModal();
  closeFriendRequestsModal();
  closeDobModal();
  if (email && ui.banAppealEmail) {
    ui.banAppealEmail.value = email;
  }
  if (ui.banAppealPassword && ui.loginPassword?.value) {
    ui.banAppealPassword.value = ui.loginPassword.value;
  }
  if (ui.banAppealHelp) {
    ui.banAppealHelp.textContent = result?.bannedUserCleanupDays > 0
      ? `You have ${result.bannedUserCleanupDays} day(s) before this account is deleted.`
      : 'Enter the banned account email, password, and why admins should review the ban.';
  }
  setBanAppealMessage('');
  try {
    const nextUrl = new URL('/ban-appeal', window.location.origin);
    const nextEmail = email || ui.banAppealEmail?.value || '';
    if (nextEmail) {
      nextUrl.searchParams.set('email', nextEmail);
    }
    window.history.replaceState({}, '', `${nextUrl.pathname}${nextUrl.search}`);
  } catch (_error) {
  }
  if (!ui.banAppealEmail?.value) {
    ui.banAppealEmail?.focus();
  } else if (!ui.banAppealPassword?.value) {
    ui.banAppealPassword?.focus();
  } else {
    ui.banAppealReason?.focus();
  }
}

function hideBanAppealPrompt() {
  ui.banAppealPage?.classList.add('hidden');
  if (ui.banAppealReason) {
    ui.banAppealReason.value = '';
  }
  if (ui.banAppealPassword) {
    ui.banAppealPassword.value = '';
  }
  setBanAppealMessage('');
}

function openBanAppealFromUrl() {
  const pathname = String(window.location.pathname || '');
  const params = new URLSearchParams(window.location.search);
  if (pathname !== '/ban-appeal') {
    return;
  }
  const email = params.get('email') || '';
  openBanAppealPage(null, email);
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
    ui.appDialogMessage.innerHTML = sanitizeDialogHtml(message);
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

function isRateLimitMessage(message) {
  const text = String(message || '').toLowerCase();
  return text.includes('too quickly') || text.includes('rate limit') || text.includes('slow down');
}

async function showSendBlockedDialog(message) {
  if (isRateLimitMessage(message)) {
    await showMessageDialog('WOAH THERE. WAY TOO SPICY', "You're sending messages too quickly!", {
      okLabel: 'Enter the chill zone'
    });
    return;
  }
  await showMessageDialog('Message Not Sent', message || 'That message could not be sent.', {
    okLabel: 'Got it'
  });
}

async function showWarningDialog(message, title = 'Heads Up') {
  await showMessageDialog(title, message || 'Something went wrong.', {
    okLabel: 'Got it'
  });
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
      const icon = button.querySelector('i');
      if (icon) {
        icon.className = isVisible ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
        icon.dataset.fallback = getIconFallback(icon.className, isVisible ? 'Hide password' : 'Show password');
      }
    });
  }
}

function showLogin() {
  hideBanAppealPrompt();
  ui.showLoginBtn.classList.add('tab-active');
  ui.showRegisterBtn.classList.remove('tab-active');
  authTiming.loginShownAt = Date.now();
  switchAuthForms(ui.registerForm, ui.loginForm, 'left');
}

function showRegister() {
  hideBanAppealPrompt();
  ui.showRegisterBtn.classList.add('tab-active');
  ui.showLoginBtn.classList.remove('tab-active');
  authTiming.registerShownAt = Date.now();
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

function getAuthClientSignal() {
  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    language: navigator.language || '',
    viewport: {
      width: window.innerWidth || 0,
      height: window.innerHeight || 0
    },
    touch: navigator.maxTouchPoints || 0
  };
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

function getInviteCodeFromLocation() {
  const pathname = String(window.location.pathname || '');
  const params = new URLSearchParams(window.location.search || '');
  const queryInvite = String(params.get('invite') || '').trim();
  if (queryInvite) {
    return queryInvite.toUpperCase();
  }

  const inviteMatch = pathname.match(/^\/invite\/([^/?#]+)/i);
  if (inviteMatch?.[1]) {
    return decodeURIComponent(inviteMatch[1]).trim().toUpperCase();
  }

  return '';
}

function clearInviteLinkFromLocation() {
  try {
    window.history.replaceState({}, '', '/');
  } catch (_error) {
  }
}

async function handlePendingInviteLink() {
  const inviteCode = getInviteCodeFromLocation();
  if (!inviteCode) {
    return;
  }

  if (!state.user?.id) {
    openAuth();
    showLogin();
    setAuthMessage('Log in or create an account to join this server invite.');
    return;
  }

  const result = await window.api.chat.joinByInvite({ code: inviteCode });
  clearInviteLinkFromLocation();

  if (!result.ok) {
    await showWarningDialog(result.message || 'Failed to join invite.', 'Invite Link');
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

  await showMessageDialog('Invite Accepted', `Joined ${result.server?.name || 'the server'}.`);
}

function openChat() {
  return new Promise((resolve) => {
    ui.authPanel.classList.add('auth-swipe-out');

    setTimeout(() => {
      ui.authPanel.classList.remove('auth-swipe-out');
      ui.authPanel.classList.add('hidden');
      ui.banAppealPage?.classList.add('hidden');
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
  ui.banAppealPage?.classList.add('hidden');
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
  state.activeDmCallUserId = null;
  state.activeVoiceLabel = '';
  state.isDobRequired = false;
  state.avatarPromptShown = false;
  state.adminUsers = [];
  state.adminServers = [];
  state.adminReports = [];
  state.selectedAdminUserId = null;
  state.adminUserDetails = null;
  state.notifications = [];
  state.passkeys = [];
  state.passkeysSupported = false;

  ui.serversList.innerHTML = '';
  ui.channelsList.innerHTML = '';
  ui.messagesList.innerHTML = '';
  syncDmCallButton();
  ui.onlineUsersList.innerHTML = '';
  renderPasskeys();
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
  const canCreateChannel = Boolean(state.serverPermissions.manage_channels && state.selectedServerId);
  const canCreateInvite = Boolean(state.serverPermissions.create_invites && state.selectedServerId);
  ui.createChannelBtn.style.display = canCreateChannel ? 'inline-flex' : 'none';
  ui.createInviteBtn.style.display = canCreateInvite ? 'inline-flex' : 'none';
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

function installMobileSwipeDrawers() {
  if (!ui.chatPanel) {
    return;
  }

  const edgeSize = 42;
  const minSwipeDistance = 72;
  const maxVerticalDrift = 80;
  let swipeStart = null;

  ui.chatPanel.addEventListener('touchstart', (event) => {
    if (window.innerWidth > 700 || event.touches.length !== 1) {
      swipeStart = null;
      return;
    }

    const touch = event.touches[0];
    const fromLeftEdge = touch.clientX <= edgeSize;
    const fromRightEdge = touch.clientX >= window.innerWidth - edgeSize;
    const canCloseOpenDrawer = state.mobileServersOpen || state.mobileUsersOpen;

    if (!fromLeftEdge && !fromRightEdge && !canCloseOpenDrawer) {
      swipeStart = null;
      return;
    }

    swipeStart = {
      x: touch.clientX,
      y: touch.clientY,
      fromLeftEdge,
      fromRightEdge,
      serversOpen: state.mobileServersOpen,
      usersOpen: state.mobileUsersOpen
    };
  }, { passive: true });

  ui.chatPanel.addEventListener('touchend', (event) => {
    if (!swipeStart || window.innerWidth > 700) {
      swipeStart = null;
      return;
    }

    const start = swipeStart;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    swipeStart = null;

    if (Math.abs(dx) < minSwipeDistance || Math.abs(dy) > maxVerticalDrift) {
      return;
    }

    if (dx > 0 && start.fromLeftEdge) {
      state.mobileServersOpen = true;
      state.mobileUsersOpen = false;
      updateMobileDrawers();
      return;
    }

    if (dx < 0 && start.fromRightEdge) {
      state.mobileUsersOpen = true;
      state.mobileServersOpen = false;
      updateMobileDrawers();
      return;
    }

    if (dx < 0 && start.serversOpen) {
      closeMobileDrawers();
      return;
    }

    if (dx > 0 && start.usersOpen) {
      closeMobileDrawers();
      return;
    }
  }, { passive: true });
}

function closeServerOptions() {
  state.serverOptionsServerId = null;
  state.serverOptionsTab = 'general';
  state.bannedUsers = [];
  state.serverRoles = [];
  state.serverRoleMembers = [];
  state.selectedRoleId = null;
  ui.serverOptionsMenu.classList.remove('open');
  ui.serverOptionsMenu.classList.add('hidden');
}

function setServerOptionsTab(tabName) {
  state.serverOptionsTab = tabName;
  const generalActive = tabName === 'general';
  const rolesActive = tabName === 'roles';
  ui.serverTabGeneral.classList.toggle('active', generalActive);
  ui.serverTabRoles.classList.toggle('active', rolesActive);
  ui.serverTabBanned.classList.toggle('active', tabName === 'banned');
  ui.serverPanelGeneral.classList.toggle('hidden', !generalActive);
  ui.serverPanelRoles.classList.toggle('hidden', !rolesActive);
  ui.serverPanelBanned.classList.toggle('hidden', tabName !== 'banned');
}

function getRoleEditorPermissions() {
  return {
    manage_server: ui.permManageServer.checked,
    manage_roles: ui.permManageRoles.checked,
    manage_channels: ui.permManageChannels.checked,
    create_invites: ui.permCreateInvites.checked,
    moderate_members: ui.permModerateMembers.checked
  };
}

function setRoleEditor(role) {
  const permissions = role?.permissions || {};
  ui.roleNameInput.value = role?.name || '';
  ui.permManageServer.checked = Boolean(permissions.manage_server);
  ui.permManageRoles.checked = Boolean(permissions.manage_roles);
  ui.permManageChannels.checked = Boolean(permissions.manage_channels);
  ui.permCreateInvites.checked = Boolean(permissions.create_invites);
  ui.permModerateMembers.checked = Boolean(permissions.moderate_members);

  const canManage = Boolean(state.serverPermissions.manage_roles);
  ui.createRoleBtn.disabled = !canManage;
  const isDefault = Boolean(role?.is_default);
  ui.roleNameInput.disabled = !canManage || isDefault;
  ui.permManageServer.disabled = !canManage;
  ui.permManageRoles.disabled = !canManage;
  ui.permManageChannels.disabled = !canManage;
  ui.permCreateInvites.disabled = !canManage;
  ui.permModerateMembers.disabled = !canManage;
  ui.saveRoleBtn.disabled = !canManage || !role;
  ui.deleteRoleBtn.disabled = !canManage || !role || isDefault;
}

function renderRoleMembers() {
  ui.roleMembersList.innerHTML = '';
  const role = state.serverRoles.find((item) => item.id === state.selectedRoleId);
  if (!role) {
    return;
  }

  for (const member of state.serverRoleMembers) {
    const row = document.createElement('div');
    row.className = 'role-member-row';
    const label = document.createElement('div');
    label.className = 'role-member-name';
    label.textContent = member.username;

    const toggle = document.createElement('button');
    const hasRole = (member.role_ids || []).includes(role.id);
    toggle.type = 'button';
    toggle.textContent = hasRole ? 'Remove' : 'Add';
    toggle.disabled = !state.serverPermissions.manage_roles || role.is_default || member.is_owner;
    toggle.addEventListener('click', async () => {
      const result = await window.api.roles.setMemberRole({
        serverId: state.serverOptionsServerId,
        roleId: role.id,
        targetUserId: member.id,
        enabled: !hasRole
      });
      if (!result.ok) {
        await showWarningDialog(result.message);
        return;
      }
      await loadRolesState();
    });

    row.append(label, toggle);
    ui.roleMembersList.appendChild(row);
  }
}

function renderRoles() {
  ui.rolesList.innerHTML = '';
  for (const role of state.serverRoles) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = role.name;
    button.className = role.id === state.selectedRoleId ? 'active' : '';
    button.addEventListener('click', () => {
      state.selectedRoleId = role.id;
      setRoleEditor(role);
      renderRoles();
      renderRoleMembers();
    });
    ui.rolesList.appendChild(button);
  }
  const selectedRole = state.serverRoles.find((item) => item.id === state.selectedRoleId) || null;
  setRoleEditor(selectedRole);
  renderRoleMembers();
}

async function loadRolesState() {
  if (!state.serverOptionsServerId) {
    return;
  }
  const result = await window.api.roles.getState({ serverId: state.serverOptionsServerId });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }
  state.serverPermissions = result.permissions || state.serverPermissions;
  state.serverRoles = result.roles || [];
  state.serverRoleMembers = (result.members || []).map((member) => ({
    ...member,
    role_ids: member.role_ids || [],
    is_owner: member.id === state.servers.find((server) => server.id === state.serverOptionsServerId)?.owner_user_id
  }));
  if (!state.selectedRoleId || !state.serverRoles.some((role) => role.id === state.selectedRoleId)) {
    state.selectedRoleId = state.serverRoles[0]?.id || null;
  }
  renderRoles();
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
    const name = document.createElement('div');
    name.textContent = user.username || 'Unknown';
    meta.appendChild(name);

    const unbanBtn = document.createElement('button');
    unbanBtn.className = 'unban-btn';
    unbanBtn.type = 'button';
    setIconButtonContent(unbanBtn, 'fa-solid fa-unlock', 'Unban');
    unbanBtn.addEventListener('click', async () => {
      const result = await window.api.chat.unbanMember({
        serverId: state.serverOptionsServerId,
        targetUserId: user.user_id
      });
      if (!result.ok) {
        await showWarningDialog(result.message);
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
  ui.serverNameInput.disabled = !state.serverPermissions.manage_server;
  ui.saveServerNameBtn.disabled = !state.serverPermissions.manage_server;
  loadRolesState();
  const buttonRect = buttonElement.getBoundingClientRect();
  const menuWidth = Math.min(420, Math.max(260, window.innerWidth - 24));
  const menuHeight = Math.min(520, Math.max(240, window.innerHeight - 24));
  const top = Math.min(Math.max(12, buttonRect.top), Math.max(12, window.innerHeight - menuHeight - 12));
  const left = Math.min(Math.max(12, buttonRect.right + 8), Math.max(12, window.innerWidth - menuWidth - 12));

  ui.serverOptionsMenu.style.top = `${top}px`;
  ui.serverOptionsMenu.style.left = `${left}px`;
  ui.serverOptionsMenu.classList.remove('hidden');
  requestAnimationFrame(() => {
    ui.serverOptionsMenu.classList.add('open');
  });
}

function openUserOptions(userId, buttonElement) {
  state.selectedModerationUserId = userId;
  ui.reportUserBtn?.classList.remove('hidden');
  ui.kickUserBtn?.classList.toggle('hidden', !state.serverPermissions.moderate_members);
  ui.banUserBtn?.classList.toggle('hidden', !state.serverPermissions.moderate_members);
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
    await showWarningDialog('Select a server first.');
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
    await showWarningDialog(result.message, 'Voice Unavailable');
    return;
  }

  if (result.debug?.iss) {
    setVcStatus(`Token iss=${result.debug.iss} room=${result.debug.room || '-'}`);
  }

  ui.channelTitle.textContent = `VC: ${channel.name}`;
  await openVoiceView(`Voice Channel: ${channel.name}`, channel.id, result);
}

async function startPersonalCall(partnerUserId, partnerUsername, joinOnly = false) {
  if (!partnerUserId) {
    await showWarningDialog('Select someone to call first.');
    return;
  }

  const connectionState = String(state.voiceRoom?.state || state.voiceRoom?.connectionState || '').toLowerCase();
  const isConnected = connectionState.includes('connected');
  if (state.voiceRoom && state.activeDmCallUserId === partnerUserId && isConnected) {
    ui.channelTitle.textContent = `@ ${partnerUsername}`;
    syncVoicePanelVisibility();
    return;
  }
  if (state.voiceRoom && !isConnected) {
    leaveVoiceView(false);
  }

  const fn = joinOnly ? window.api.dm.joinCall : window.api.dm.startCall;
  const result = await fn({ partnerUserId });
  if (!result.ok) {
    await showWarningDialog(result.message, 'Call Unavailable');
    return;
  }

  const label = `Personal Call: ${partnerUsername || result.partner?.username || 'User'}`;
  ui.channelTitle.textContent = `@ ${partnerUsername || result.partner?.username || 'User'}`;
  await openVoiceView(label, null, result, { dmUserId: partnerUserId });
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
  if (state.localMicMediaTrack) {
    state.localMicMediaTrack.enabled = micEnabled;
    if (micEnabled) {
      await state.localMicPublication?.track?.unmute?.();
    } else {
      await state.localMicPublication?.track?.mute?.();
    }
  } else {
    await state.voiceRoom.localParticipant.setMicrophoneEnabled(micEnabled);
  }
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
  if (state.localMicMediaTrack) {
    state.localMicMediaTrack.enabled = micEnabled;
    if (micEnabled) {
      await state.localMicPublication?.track?.unmute?.();
    } else {
      await state.localMicPublication?.track?.mute?.();
    }
  } else {
    await state.voiceRoom.localParticipant.setMicrophoneEnabled(micEnabled);
  }
  if (!micApiAvailable) {
    state.isVoiceMuted = true;
    setVcStatus('Microphone unavailable here. Use HTTPS or localhost.');
  }
  setAudioSinkMuted(state.isVoiceDeafened);
  updateVoiceButtons();
  renderVoiceParticipants();
}

async function createElectronScreenStream() {
  if (!window.api?.screen?.getSources || !navigator.mediaDevices?.getUserMedia) {
    return null;
  }

  const result = await window.api.screen.getSources();
  if (!result?.ok) {
    throw new Error(result?.message || 'Screen sources are unavailable.');
  }

  const source = await chooseScreenSource(result.sources || []);
  if (!source?.id) {
    const cancelError = new Error('Screen share was cancelled.');
    cancelError.name = 'AbortError';
    throw cancelError;
  }

  const screenWidth = Number(source.width) || Number(window.screen?.width) || 1920;
  const screenHeight = Number(source.height) || Number(window.screen?.height) || 1080;
  const captureWidth = Math.max(1280, Math.min(7680, Math.round(screenWidth)));
  const captureHeight = Math.max(720, Math.min(4320, Math.round(screenHeight)));

  return navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id,
        maxWidth: captureWidth,
        maxHeight: captureHeight,
        maxFrameRate: 30
      }
    }
  });
}

async function createScreenShareStream() {
  if (!navigator.mediaDevices) {
    throw new Error('Screen capture is unavailable in this app runtime.');
  }

  if (window.api?.screen?.getSources) {
    const stream = await createElectronScreenStream();
    if (!stream) {
      throw new Error('Screen capture is unavailable in this app runtime.');
    }
    return stream;
  }

  if (navigator.mediaDevices.getDisplayMedia) {
    return navigator.mediaDevices.getDisplayMedia({
      audio: false,
      video: {
        width: { ideal: window.screen?.width || 1920 },
        height: { ideal: window.screen?.height || 1080 },
        frameRate: { ideal: 30, max: 30 }
      }
    });
  }

  throw new Error('Screen capture is unavailable in this app runtime.');
}

async function startScreenShare() {
  const localParticipant = state.voiceRoom?.localParticipant;
  if (!localParticipant) {
    return;
  }

  const stream = await createScreenShareStream();
  const [videoTrack] = stream.getVideoTracks();
  if (!videoTrack) {
    throw new Error('No video track was captured.');
  }

  try {
    const source = window.LivekitClient?.Track?.Source?.ScreenShare || 'screen_share';
    await localParticipant.publishTrack(videoTrack, {
      name: 'screen-share',
      source
    });
  } catch (error) {
    videoTrack.stop();
    throw error;
  }

  state.screenShareMediaTrack = videoTrack;
  state.isScreenSharing = true;
  attachLocalScreenPreview(videoTrack);
  updateScreenShareLayout();

  videoTrack.addEventListener('ended', () => {
    if (!state.isScreenSharing) {
      return;
    }
    stopScreenShare().catch((error) => {
      setVcStatus(`Failed to stop sharing: ${error.message}`);
    });
  }, { once: true });
}

async function stopScreenShare() {
  const mediaTrack = state.screenShareMediaTrack;
  state.screenShareMediaTrack = null;
  state.isScreenSharing = false;

  if (mediaTrack && state.voiceRoom?.localParticipant) {
    try {
      await state.voiceRoom.localParticipant.unpublishTrack(mediaTrack, true);
    } catch (_error) {
      mediaTrack.stop();
    }
  } else if (mediaTrack) {
    mediaTrack.stop();
  }
  detachLocalScreenPreview();
  state.isScreenFocused = false;
  if (!state.voiceVideoEls.size && ui.vcVideoSink) {
    ui.vcVideoSink.textContent = 'No one is sharing right now.';
  }
  updateScreenShareLayout();
}

async function toggleScreenShare() {
  if (!state.voiceRoom) {
    return;
  }
  const nextState = !state.isScreenSharing;
  if (nextState) {
    await startScreenShare();
    setVcStatus('Sharing your screen.');
  } else {
    await stopScreenShare();
    setVcStatus(`Connected to ${state.activeVoiceLabel || 'voice room'}`);
  }
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

    if (payload.type === 'account-access-revoked') {
      const message = payload.message || 'Your account access changed. Please sign in again.';
      notifyUser(payload.title || 'Account Access Revoked', message);
      await performLogout(false);
      setAuthMessage(message, true);
      await showMessageDialog(payload.title || 'Account Access Revoked', message);
      return;
    }

    if (payload.type === 'server-banned') {
      const message = payload.message || 'You were removed from a server.';
      notifyUser(payload.title || 'Removed From Server', message);
      await loadServers(false);
      if (state.selectedServerId === payload.serverId) {
        await loadServers(false);
      }
      await showMessageDialog(payload.title || 'Removed From Server', message);
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
      if (payload.type === 'friend-requests-changed') {
        notifyUser('Friend Request Update', 'You have a new or updated friend request.');
      }
      await loadFriends();
    }

    if (payload.type === 'dm-message-created') {
      if (payload.fromUserId && payload.fromUserId !== state.currentUserId) {
        const friend = state.friends.find((entry) => entry.id === payload.fromUserId);
        notifyUser('Direct Message', `${friend?.username || 'Someone'} sent you a DM.`);
      }
      if (state.selectedDmUser && (payload.fromUserId === state.selectedDmUser.id || payload.fromUserId === state.currentUserId)) {
        await loadDmMessages(state.selectedDmUser.id, state.selectedDmUser.username);
      }
    }

    if (payload.type === 'dm-call-started' && payload.fromUserId && payload.fromUserId !== state.currentUserId) {
      const callerName = payload.fromUsername || 'Someone';
      notifyUser('Incoming Call', `${callerName} is calling you.`);
      const accepted = await showConfirmDialog(
        'Incoming Personal Call',
        `${callerName} is calling you. Join now?`,
        'Join',
        'Ignore'
      );
      if (!accepted) {
        return;
      }

      await loadDmMessages(payload.fromUserId, callerName);
      await startPersonalCall(payload.fromUserId, callerName, true);
    }

    if (
      (payload.type === 'message-created' ||
        payload.type === 'message-updated' ||
        payload.type === 'message-deleted') &&
      state.selectedChannelId === payload.channelId
    ) {
      await loadMessages(state.selectedChannelId);
    }
    if (payload.type === 'message-created' && payload.message?.user_id !== state.currentUserId && state.selectedChannelId !== payload.channelId) {
      notifyUser('New Channel Message', `${payload.message?.username || 'Someone'} sent a message in another channel.`);
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
    const row = document.createElement('div');
    row.className = 'msg-row';
    const avatar = createAvatarElement(msg);

    const meta = document.createElement('div');
    meta.className = 'msg-meta';

    const title = document.createElement('span');
    title.textContent = `${msg.username} - ${formatTime(msg.created_at)}`;
    meta.appendChild(title);

    if (msg.user_id === state.currentUserId) {
      const actions = document.createElement('div');
      actions.className = 'msg-actions';

      const editButton = document.createElement('button');
      editButton.className = 'msg-action-btn';
      editButton.type = 'button';
      setIconButtonContent(editButton, 'fa-solid fa-pen', 'Edit');
      editButton.addEventListener('click', async () => {
        const updated = await showPromptDialog('Edit Message', 'Update your message:', msg.content);
        if (updated === null) {
          return;
        }

        if (state.selectedDmUser) {
          await showWarningDialog('Editing DM messages is not supported yet.');
          return;
        }

        const result = await window.api.chat.updateMessage({
          messageId: msg.id,
          content: updated
        });

        if (!result.ok) {
          await showWarningDialog(result.message);
        }
      });

      const deleteButton = document.createElement('button');
      deleteButton.className = 'msg-action-btn';
      deleteButton.type = 'button';
      setIconButtonContent(deleteButton, 'fa-solid fa-trash', 'Delete');
      deleteButton.addEventListener('click', async () => {
        const confirmed = await showConfirmDialog('Delete Message', 'Delete this message?', 'Delete', 'Cancel');
        if (!confirmed) {
          return;
        }

        if (state.selectedDmUser) {
          await showWarningDialog('Deleting DM messages is not supported yet.');
          return;
        }

        const result = await window.api.chat.deleteMessage({ messageId: msg.id });
        if (!result.ok) {
          await showWarningDialog(result.message);
        }
      });

      actions.append(editButton, deleteButton);
      meta.appendChild(actions);
    }

    const body = document.createElement('div');
    body.className = 'msg-body';
    appendLinkedMessageText(body, msg.content);
    renderAttachment(body, msg.attachment);

    const content = document.createElement('div');
    content.append(meta, body);
    row.append(avatar, content);
    wrapper.append(row);
    ui.messagesList.appendChild(wrapper);
  }

  ui.messagesList.scrollTop = ui.messagesList.scrollHeight;
}

async function loadMessages(channelId) {
  if (isAdminGhostServer()) {
    renderMessages(getAdminGhostMessagesForChannel(channelId));
    state.subscribedChannelId = null;
    return;
  }

  const response = await window.api.chat.getMessages(channelId);
  if (!response.ok) {
    await showWarningDialog(response.message);
    return;
  }

  state.currentUserId = response.currentUserId;
  renderMessages(response.messages);
  subscribeToSelectedChannel();
}

async function loadDmMessages(partnerUserId, partnerUsername) {
  closeFriendsHome();
  const response = await window.api.dm.getMessages({ partnerUserId });
  if (!response.ok) {
    await showWarningDialog(response.message);
    return;
  }

  state.selectedDmUser = {
    id: partnerUserId,
    username: partnerUsername || response.partner?.username || 'User',
    avatar_url: response.partner?.avatar_url || ''
  };
  state.selectedChannelId = null;
  state.currentUserId = response.currentUserId;
  ui.channelTitle.textContent = `@ ${state.selectedDmUser.username}`;
  syncDmCallButton();
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
      closeFriendsHome();
      state.selectedChannelId = channel.id;
      state.selectedDmUser = null;
      syncDmCallButton();
      renderChannels();
      if (channelType === 'voice') {
        state.subscribedChannelId = null;
        if (!isAdminGhostServer()) {
          await joinVoiceChannel(channel);
        }
        await loadMessages(channel.id);
      } else {
        ui.channelTitle.textContent = isAdminGhostServer() ? `# ${channel.name} - Admin View` : `# ${channel.name}`;
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
  if (isAdminGhostServer(serverId)) {
    const previousSelected = state.selectedChannelId;
    state.channels = (state.adminViewedServer.channels || []).map((channel) => ({
      ...channel,
      type: String(channel.type || 'text').toLowerCase()
    }));
    state.canCreateChannels = false;
    state.serverPermissions = {
      manage_server: false,
      manage_roles: false,
      manage_channels: false,
      create_invites: false,
      moderate_members: false
    };
    updateChannelCreateButton();
    if (resetSelection) {
      state.selectedChannelId = pickDefaultChannelId(state.channels);
    } else {
      const stillExists = state.channels.some((channel) => channel.id === previousSelected);
      state.selectedChannelId = stillExists ? previousSelected : pickDefaultChannelId(state.channels);
    }
    renderChannels();
    if (state.selectedChannelId) {
      state.selectedDmUser = null;
      syncDmCallButton();
      const selected = getSelectedChannel();
      await loadMessages(state.selectedChannelId);
      ui.channelTitle.textContent = selected ? `# ${selected.name} - Admin View` : 'Select a channel';
    } else {
      ui.channelTitle.textContent = 'No channels available';
      ui.messagesList.innerHTML = '';
      state.subscribedChannelId = null;
    }
    syncVoicePanelVisibility();
    return;
  }

  const response = await window.api.chat.getChannels(serverId);
  if (!response.ok) {
    await showWarningDialog(response.message);
    state.canCreateChannels = false;
    state.serverPermissions = {
      manage_server: false,
      manage_roles: false,
      manage_channels: false,
      create_invites: false,
      moderate_members: false
    };
    updateChannelCreateButton();
    return;
  }

  const previousSelected = state.selectedChannelId;
  state.channels = (response.channels || []).map((channel) => ({
    ...channel,
    type: String(channel.type || 'text').toLowerCase()
  }));
  state.canCreateChannels = Boolean(response.canCreateChannels);
  state.serverPermissions = response.permissions || state.serverPermissions;
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
    syncDmCallButton();
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
    closeFriendsHome();
    state.selectedServerId = serverId;
    state.selectedDmUser = null;
    syncDmCallButton();
    closeServerOptions();
    closeUserOptions();
    renderServers();
    const server = state.servers.find((x) => x.id === serverId);
    ui.serverTitle.textContent = server ? `${server.name}${server.adminView ? ' (Admin View)' : ''}` : 'Channels';
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
    if (state.servers.find((server) => server.id === serverId)?.adminView) {
      return;
    }
    openServerOptions(serverId, button);
  });

  let holdTimer = null;
  button.addEventListener('touchstart', () => {
    holdTimer = setTimeout(async () => {
      await selectServer();
      if (state.servers.find((server) => server.id === serverId)?.adminView) {
        suppressClickOnce = true;
        return;
      }
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
    button.title = server.adminView ? `${server.name} (Admin View)` : server.name;
    if (server.adminView) {
      button.classList.add('admin-ghost-server');
    }

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
    await showWarningDialog(response.message);
    return;
  }

  const previousSelected = state.selectedServerId;
  state.servers = response.servers;
  injectAdminGhostServer();

  if (resetSelection) {
    state.selectedServerId = state.servers[0]?.id || null;
  } else {
    const stillExists = state.servers.some((server) => server.id === previousSelected);
    state.selectedServerId = stillExists ? previousSelected : state.servers[0]?.id || null;
  }

  renderServers();

  if (state.selectedServerId) {
    const server = state.servers.find((x) => x.id === state.selectedServerId);
    ui.serverTitle.textContent = server ? `${server.name}${server.adminView ? ' (Admin View)' : ''}` : 'Channels';
    await loadChannels(state.selectedServerId, resetSelection);
    await loadServerPresence(state.selectedServerId);
  } else {
    ui.serverTitle.textContent = 'No servers available';
    ui.channelsList.innerHTML = '';
    ui.messagesList.innerHTML = '';
    state.canCreateChannels = false;
    state.serverPermissions = {
      manage_server: false,
      manage_roles: false,
      manage_channels: false,
      create_invites: false,
      moderate_members: false
    };
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
    const status = document.createElement('span');
    status.className = `status-dot ${user.online ? 'online' : 'offline'}`;
    const avatar = createAvatarElement(user);
    const label = document.createElement('span');
    label.className = 'list-user-label';
    label.textContent = user.username;
    button.classList.add('list-user-button');
    button.append(status, avatar, label);
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
    const status = document.createElement('span');
    status.className = `status-dot ${friend.online ? 'online' : 'offline'}`;
    const avatar = createAvatarElement(friend);
    const label = document.createElement('span');
    label.className = 'list-user-label';
    label.textContent = friend.username;
    button.classList.add('list-user-button');
    button.append(status, avatar, label);
    button.addEventListener('click', async () => {
      await loadDmMessages(friend.id, friend.username);
      if (window.innerWidth <= 700) {
        closeMobileDrawers();
      }
    });
    item.appendChild(button);
    ui.friendsList.appendChild(item);
  }
  renderFriendsHome();
}

function getFriendsHomeFilteredItems() {
  const query = String(ui.friendsSearchInput?.value || '').trim().toLowerCase();
  let items = [];
  if (state.friendsHomeTab === 'pending') {
    items = state.friendRequests.map((request) => ({
      ...request,
      id: request.sender_user_id,
      pendingRequestId: request.id,
      pending: true,
      online: false
    }));
  } else {
    items = state.friends.filter((friend) => state.friendsHomeTab === 'all' || friend.online);
  }
  if (!query) {
    return items;
  }
  return items.filter((item) => String(item.username || '').toLowerCase().includes(query));
}

function renderActiveNow() {
  if (!ui.activeNowList) {
    return;
  }
  ui.activeNowList.innerHTML = '';
  const activeFriends = state.friends.filter((friend) => friend.online);
  if (!activeFriends.length) {
    const empty = document.createElement('div');
    empty.className = 'active-now-empty';
    empty.textContent = 'No one is active right now.';
    ui.activeNowList.appendChild(empty);
    return;
  }
  for (const friend of activeFriends.slice(0, 8)) {
    const card = document.createElement('button');
    card.className = 'active-now-card';
    card.type = 'button';
    const avatar = createAvatarElement(friend, 'avatar avatar-lg');
    const meta = document.createElement('div');
    meta.className = 'active-now-meta';
    const name = document.createElement('div');
    name.className = 'active-now-name';
    name.textContent = friend.username || 'Unknown';
    const status = document.createElement('div');
    status.className = 'active-now-status';
    status.textContent = 'Online';
    meta.append(name, status);
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-message';
    icon.setAttribute('aria-hidden', 'true');
    icon.dataset.fallback = getIconFallback(icon.className, 'Message');
    card.append(avatar, meta, icon);
    card.addEventListener('click', async () => {
      await loadDmMessages(friend.id, friend.username);
    });
    ui.activeNowList.appendChild(card);
  }
}

function renderFriendsHome() {
  if (!ui.friendsHomeView) {
    return;
  }
  const tabs = {
    online: ui.friendsTabOnline,
    all: ui.friendsTabAll,
    pending: ui.friendsTabPending,
    add: ui.friendsTabAdd
  };
  for (const [tabName, button] of Object.entries(tabs)) {
    button?.classList.toggle('active', state.friendsHomeTab === tabName);
  }
  const items = getFriendsHomeFilteredItems();
  const tabLabel = state.friendsHomeTab === 'pending' ? 'Pending' : state.friendsHomeTab === 'all' ? 'All Friends' : 'Online';
  if (ui.friendsHomeCount) {
    ui.friendsHomeCount.textContent = `${tabLabel} - ${items.length}`;
  }
  if (!ui.friendsHomeList) {
    return;
  }
  ui.friendsHomeList.innerHTML = '';

  if (state.friendsHomeTab === 'add') {
    const addCard = document.createElement('div');
    addCard.className = 'friends-add-card';
    const title = document.createElement('h3');
    title.textContent = 'Add Friend';
    const copy = document.createElement('p');
    copy.textContent = 'Send a friend request with their username or email.';
    const button = document.createElement('button');
    button.type = 'button';
    setIconButtonContent(button, 'fa-solid fa-user-plus', 'Add Friend');
    button.addEventListener('click', promptAddFriend);
    addCard.append(title, copy, button);
    ui.friendsHomeList.appendChild(addCard);
    renderActiveNow();
    return;
  }

  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'friends-empty';
    empty.textContent = state.friendsHomeTab === 'pending' ? 'No pending friend requests.' : 'No friends found.';
    ui.friendsHomeList.appendChild(empty);
    renderActiveNow();
    return;
  }

  for (const friend of items) {
    const row = document.createElement('div');
    row.className = 'friends-home-row';
    const avatarWrap = document.createElement('div');
    avatarWrap.className = 'friends-row-avatar-wrap';
    const avatar = createAvatarElement(friend, 'avatar avatar-lg');
    const status = document.createElement('span');
    status.className = `status-dot ${friend.online ? 'online' : 'offline'}`;
    avatarWrap.append(avatar, status);

    const meta = document.createElement('div');
    meta.className = 'friends-row-meta';
    const name = document.createElement('div');
    name.className = 'friends-row-name';
    name.textContent = friend.username || 'Unknown';
    const sub = document.createElement('div');
    sub.className = 'friends-row-subtitle';
    sub.textContent = friend.pending ? 'Incoming friend request' : friend.online ? 'Online' : 'Offline';
    meta.append(name, sub);

    const actions = document.createElement('div');
    actions.className = 'friends-row-actions';
    if (friend.pending) {
      const accept = document.createElement('button');
      accept.type = 'button';
      accept.title = 'Accept';
      accept.className = 'friends-round-action accept';
      setIconOnlyButtonContent(accept, 'fa-solid fa-check', 'Accept');
      accept.addEventListener('click', async () => {
        const result = await window.api.friends.respondRequest({ requestId: friend.pendingRequestId, action: 'accept' });
        if (!result.ok) {
          await showWarningDialog(result.message);
          return;
        }
        await loadFriendRequestsForHome();
        await loadFriends();
      });
      const reject = document.createElement('button');
      reject.type = 'button';
      reject.title = 'Reject';
      reject.className = 'friends-round-action reject';
      setIconOnlyButtonContent(reject, 'fa-solid fa-xmark', 'Reject');
      reject.addEventListener('click', async () => {
        const result = await window.api.friends.respondRequest({ requestId: friend.pendingRequestId, action: 'reject' });
        if (!result.ok) {
          await showWarningDialog(result.message);
          return;
        }
        await loadFriendRequestsForHome();
        renderFriendsHome();
      });
      actions.append(accept, reject);
    } else {
      const message = document.createElement('button');
      message.type = 'button';
      message.title = 'Message';
      message.className = 'friends-round-action';
      setIconOnlyButtonContent(message, 'fa-solid fa-message', 'Message');
      message.addEventListener('click', async () => {
        await loadDmMessages(friend.id, friend.username);
      });
      const call = document.createElement('button');
      call.type = 'button';
      call.title = 'Call';
      call.className = 'friends-round-action';
      setIconOnlyButtonContent(call, 'fa-solid fa-phone', 'Call');
      call.addEventListener('click', async () => {
        await loadDmMessages(friend.id, friend.username);
        await startPersonalCall(friend.id, friend.username);
      });
      actions.append(message, call);
    }
    row.append(avatarWrap, meta, actions);
    ui.friendsHomeList.appendChild(row);
  }
  renderActiveNow();
}

async function loadFriendRequestsForHome() {
  const response = await window.api.friends.getRequests();
  state.friendRequests = response.ok ? response.requests || [] : [];
  renderFriendsHome();
}

async function openFriendsHome(tab = 'online') {
  state.selectedDmUser = null;
  state.selectedChannelId = null;
  state.friendsHomeTab = tab;
  ui.channelTitle.textContent = 'Friends';
  syncDmCallButton();
  renderChannels();
  setFriendsHomeOpen(true);
  if (tab === 'pending') {
    await loadFriendRequestsForHome();
  }
  await loadFriends();
  renderFriendsHome();
}

async function loadServerPresence(serverId) {
  if (!serverId) {
    state.onlineUsers = [];
    renderOnlineUsers();
    return;
  }

  if (isAdminGhostServer(serverId)) {
    state.onlineUsers = (state.adminViewedServer.members || [])
      .filter((member) => member.id !== state.currentUserId && !member.platform_banned_at)
      .map((member) => ({ ...member, online: false }));
    state.serverPermissions = {
      manage_server: false,
      manage_roles: false,
      manage_channels: false,
      create_invites: false,
      moderate_members: false
    };
    updateChannelCreateButton();
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
  state.serverPermissions = result.permissions || state.serverPermissions;
  updateChannelCreateButton();
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
ui.banAppealBackBtn?.addEventListener('click', () => {
  try {
    window.history.replaceState({}, '', '/app');
  } catch (_error) {
  }
  hideBanAppealPrompt();
  openAuth();
});
ui.serverUrlBtn?.addEventListener('click', async () => {
  const key = 'jellochat_api_base';
  const current = String(localStorage?.getItem(key) || 'https://chat.jellodog.com').trim();
  const next = await showPromptDialog('Server URL', 'Enter the JelloChat server URL:', current);
  if (!next) {
    return;
  }
  const normalized = String(next).trim().replace(/\/+$/, '');
  if (!/^https:\/\/[^/\s]+/i.test(normalized)) {
    setAuthMessage('Use a valid HTTPS server URL.', true);
    return;
  }
  localStorage.setItem(key, normalized);
  setAuthMessage(`Server URL set to ${normalized}`);
});
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
ui.serverTabRoles.addEventListener('click', async () => {
  setServerOptionsTab('roles');
  await loadRolesState();
});
ui.serverTabBanned.addEventListener('click', async () => {
  setServerOptionsTab('banned');
  await loadBannedUsers();
});
ui.notificationsBtn?.addEventListener('click', openNotificationsModal);
ui.notificationsCloseBtn?.addEventListener('click', closeNotificationsModal);
ui.notificationsModal?.addEventListener('click', (event) => {
  if (event.target === ui.notificationsModal) {
    closeNotificationsModal();
  }
});
ui.notificationsEnableBtn?.addEventListener('click', async () => {
  if (typeof Notification === 'undefined') {
    await showWarningDialog('Browser notifications are not available here.', 'Notifications');
    return;
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      ui.channelTitle.textContent = 'Browser notifications enabled.';
    } else {
      await showWarningDialog('Browser notifications were not enabled.', 'Notifications');
    }
  } catch (_error) {
    await showWarningDialog('Could not enable browser notifications.', 'Notifications');
  }
});
ui.notificationsClearBtn?.addEventListener('click', () => {
  state.notifications = [];
  renderNotifications();
});
ui.friendsHomeBtn?.addEventListener('click', async () => {
  await openFriendsHome('online');
  if (window.innerWidth <= 700) {
    closeMobileDrawers();
  }
});
ui.friendsTabOnline?.addEventListener('click', async () => {
  state.friendsHomeTab = 'online';
  await loadFriends();
});
ui.friendsTabAll?.addEventListener('click', async () => {
  state.friendsHomeTab = 'all';
  await loadFriends();
});
ui.friendsTabPending?.addEventListener('click', async () => {
  state.friendsHomeTab = 'pending';
  await loadFriendRequestsForHome();
});
ui.friendsTabAdd?.addEventListener('click', () => {
  state.friendsHomeTab = 'add';
  renderFriendsHome();
});
ui.friendsCloseBtn?.addEventListener('click', () => {
  closeFriendsHome();
});
ui.friendsMenuBtn?.addEventListener('click', toggleMobileServersDrawer);
ui.friendsSearchInput?.addEventListener('input', renderFriendsHome);
ui.mobileServersToggle.addEventListener('click', toggleMobileServersDrawer);
ui.mobileUsersToggle.addEventListener('click', toggleMobileUsersDrawer);
ui.mobileDrawerBackdrop.addEventListener('click', () => {
  closeMobileDrawers();
  closeServerOptions();
  closeUserOptions();
});

document.addEventListener('click', (event) => {
  if (ui.vcPanel?.classList.contains('mic-settings-open')) {
    const clickedInsideMicSettings = ui.vcPanel.contains(event.target)
      && (event.target.closest?.('.vc-mic-panel') || event.target.closest?.('.vc-mute-split'));
    if (!clickedInsideMicSettings) {
      ui.vcPanel.classList.remove('mic-settings-open');
      ui.vcMicSettingsBtn?.setAttribute('aria-expanded', 'false');
    }
  }

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

ui.appDialogCloseBtn?.addEventListener('click', () => {
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

ui.screenSourceCancelBtn?.addEventListener('click', () => {
  closeScreenSourceModal(null);
});

ui.screenSourceModal?.addEventListener('click', (event) => {
  if (event.target === ui.screenSourceModal) {
    closeScreenSourceModal(null);
  }
});

ui.screenSourceModal?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeScreenSourceModal(null);
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
    await showWarningDialog(result.message);
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
    await showWarningDialog('Server name must be between 2 and 80 characters.');
    return;
  }

  const result = await window.api.chat.renameServer({ serverId, name });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }

  await loadServers(false);
  ui.channelTitle.textContent = 'Server renamed.';
});

ui.createRoleBtn.addEventListener('click', async () => {
  if (!state.serverOptionsServerId) {
    return;
  }
  const name = await showPromptDialog('Create Role', 'Role name:');
  if (!name) {
    return;
  }
  const result = await window.api.roles.create({ serverId: state.serverOptionsServerId, name });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }
  await loadRolesState();
});

ui.saveRoleBtn.addEventListener('click', async () => {
  if (!state.serverOptionsServerId || !state.selectedRoleId) {
    return;
  }
  const result = await window.api.roles.update({
    serverId: state.serverOptionsServerId,
    roleId: state.selectedRoleId,
    name: ui.roleNameInput.value.trim(),
    permissions: getRoleEditorPermissions()
  });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }
  await loadRolesState();
});

ui.deleteRoleBtn.addEventListener('click', async () => {
  if (!state.serverOptionsServerId || !state.selectedRoleId) {
    return;
  }
  const confirmed = await showConfirmDialog('Delete Role', 'Delete this role?', 'Delete', 'Cancel');
  if (!confirmed) {
    return;
  }
  const result = await window.api.roles.delete({
    serverId: state.serverOptionsServerId,
    roleId: state.selectedRoleId
  });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }
  await loadRolesState();
});

ui.reportUserBtn?.addEventListener('click', async () => {
  const targetUserId = state.selectedModerationUserId;
  if (!targetUserId) {
    return;
  }

  const reason = await showPromptDialog('Report User', 'What happened? Please include a short reason:', '');
  if (!reason) {
    return;
  }

  const result = await window.api.reports.createUserReport({
    targetUserId,
    serverId: state.selectedServerId || null,
    reason
  });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }

  closeUserOptions();
  ui.channelTitle.textContent = 'User reported to the admins.';
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
    await showWarningDialog(result.message);
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
    await showWarningDialog(result.message);
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

ui.addPasskeyBtn?.addEventListener('click', async () => {
  await startPasskeyRegistration();
});

ui.accountAdminBtn?.addEventListener('click', async () => {
  closeAccountSettingsMenu();
  openAdminModal();
  setAdminView('reports');
});

ui.accountModalCloseBtn.addEventListener('click', closeAccountModal);
ui.accountModal.addEventListener('click', (event) => {
  if (event.target === ui.accountModal) {
    closeAccountModal();
  }
});

ui.accountModal?.querySelector('.account-modal-scroll')?.addEventListener('scroll', () => {
  if (ui.accountModal.__accountScrollSpyTimer) {
    cancelAnimationFrame(ui.accountModal.__accountScrollSpyTimer);
  }
  ui.accountModal.__accountScrollSpyTimer = requestAnimationFrame(() => {
    syncActiveAccountModalSection();
    ui.accountModal.__accountScrollSpyTimer = null;
  });
});

ui.accountModal?.querySelectorAll('.account-modal-nav a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const sectionId = String(link.getAttribute('href') || '').replace(/^#/, '');
    scrollAccountModalToSection(sectionId);
  });
});

ui.messagesList?.addEventListener('click', async (event) => {
  const link = event.target.closest?.('.msg-body a');
  if (!link) {
    return;
  }
  if (link.classList.contains('msg-attachment-image-link') || link.classList.contains('msg-attachment-file')) {
    return;
  }
  event.preventDefault();
  await confirmAndOpenChatLink(link);
});

ui.attachmentBtn?.addEventListener('click', () => {
  ui.attachmentInput?.click();
});

ui.attachmentInput?.addEventListener('change', () => {
  const file = ui.attachmentInput.files?.[0] || null;
  state.selectedAttachment = file;
  renderAttachmentChip();
});

ui.adminModalCloseBtn?.addEventListener('click', closeAdminModal);
ui.adminModal?.addEventListener('click', (event) => {
  if (event.target === ui.adminModal) {
    closeAdminModal();
  }
});

ui.adminSearchBtn?.addEventListener('click', async () => {
  await loadAdminUsers(ui.adminSearchInput.value.trim());
});

ui.adminSearchInput?.addEventListener('keydown', async (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    await loadAdminUsers(ui.adminSearchInput.value.trim());
  }
});

ui.adminServerSearchBtn?.addEventListener('click', async () => {
  await loadAdminServers(ui.adminServerSearchInput.value.trim());
});

ui.adminServerSearchInput?.addEventListener('keydown', async (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    await loadAdminServers(ui.adminServerSearchInput.value.trim());
  }
});

ui.adminReportFilter?.addEventListener('change', async () => {
  await loadAdminReports(ui.adminReportFilter.value);
});

ui.adminAppealFilter?.addEventListener('change', async () => {
  await loadAdminBanAppeals(ui.adminAppealFilter.value);
});

ui.adminStorageRefreshBtn?.addEventListener('click', async () => {
  await loadAdminStorage();
});

ui.adminCleanupForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  await saveAdminCleanupSettings();
});

ui.adminModal?.querySelectorAll('.admin-modal-nav a[data-admin-view]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    setAdminView(link.dataset.adminView);
  });
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
  const avatarUrl = ui.accountAvatarInput.value.trim();
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
    avatarUrl,
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
  if (String(state.user?.avatar_url || '').trim()) {
    state.avatarPromptShown = true;
  }
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
    await showWarningDialog(`Failed to toggle mute: ${error.message}`, 'Voice Unavailable');
  }
});

ui.vcMicSettingsBtn?.addEventListener('click', (event) => {
  event.stopPropagation();
  ui.vcPanel?.classList.toggle('mic-settings-open');
  ui.vcMicSettingsBtn?.setAttribute('aria-expanded', ui.vcPanel?.classList.contains('mic-settings-open') ? 'true' : 'false');
});

ui.vcDeafenBtn.addEventListener('click', async () => {
  try {
    await toggleVoiceDeafen();
  } catch (error) {
    await showWarningDialog(`Failed to toggle deafen: ${error.message}`, 'Voice Unavailable');
  }
});

ui.vcScreenBtn?.addEventListener('click', async () => {
  try {
    await toggleScreenShare();
  } catch (error) {
    if (String(error?.name || '') === 'AbortError') {
      setVcStatus(`Connected to ${state.activeVoiceLabel || 'voice room'}`);
      return;
    }
    await showWarningDialog(`Failed to share screen: ${error.message}`, 'Voice Unavailable');
  }
});

ui.vcVideoSink?.addEventListener('click', () => {
  toggleFocusedScreenShare();
});

ui.vcVideoFullscreenBtn?.addEventListener('click', async (event) => {
  event.stopPropagation();
  await requestScreenShareFullscreen();
});

ui.vcMicSensitivity?.addEventListener('input', () => {
  const value = Number(ui.vcMicSensitivity.value);
  state.micSensitivity = Number.isFinite(value) ? Math.max(0, Math.min(200, value)) : 100;
  updateMicSensitivityUi();
});

ui.vcCloseBtn.addEventListener('click', () => {
  const activeDmCallUserId = state.activeDmCallUserId;
  leaveVoiceView();
  if (activeDmCallUserId && state.selectedDmUser?.id === activeDmCallUserId) {
    ui.channelTitle.textContent = `@ ${state.selectedDmUser.username} (call ended)`;
    return;
  }
  const selected = getSelectedChannel();
  if (selected?.type === 'voice') {
    ui.channelTitle.textContent = `VC: ${selected.name} (left)`;
  }
});

ui.dmCallBtn?.addEventListener('click', async () => {
  if (!state.selectedDmUser) {
    return;
  }
  await startPersonalCall(state.selectedDmUser.id, state.selectedDmUser.username);
});

ui.createServerBtn.addEventListener('click', async () => {
  const name = await showPromptDialog('Create Server', 'Server name:');
  if (!name) {
    return;
  }

  const result = await window.api.chat.createServer({ name });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }

  await loadServers(false);
});

async function promptAddFriend() {
  const target = await showPromptDialog('Add Friend', 'Enter username or email to add as friend:');
  if (!target) {
    return;
  }

  const result = await window.api.friends.sendRequest({ target });
  if (!result.ok) {
        await showWarningDialog(result.message);
    return;
  }

  ui.channelTitle.textContent = 'Friend request sent.';
}

async function showFriendRequestsModal() {
  const response = await window.api.friends.getRequests();
  if (!response.ok) {
    await showWarningDialog(response.message);
    return;
  }

  renderFriendRequests(response.requests || []);
  openFriendRequestsModal();
}

ui.addFriendBtn?.addEventListener('click', promptAddFriend);
ui.friendRequestsBtn?.addEventListener('click', showFriendRequestsModal);

ui.joinInviteBtn.addEventListener('click', async () => {
  const codeInput = await showPromptDialog('Join by Invite', 'Enter invite code or paste an invite link:');
  if (!codeInput) {
    return;
  }

  const result = await window.api.chat.joinByInvite({ code: codeInput });
  if (!result.ok) {
        await showWarningDialog(result.message);
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
    await showWarningDialog('Select a server first.');
    return;
  }
  if (!state.serverPermissions.create_invites) {
    await showWarningDialog('You do not have permission to create invites.');
    return;
  }

  const result = await window.api.chat.createInvite({ serverId: state.selectedServerId });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }

  const inviteUrl = result.invite?.url || '';
  const code = result.invite?.code || '';
  const clipboardValue = inviteUrl || code;
  if (clipboardValue && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(clipboardValue);
    } catch (_error) {
    }
  }
  await showMessageDialog(
    'Server Invite Link',
    `${inviteUrl ? `Invite link: ${inviteUrl}\n\n` : ''}Invite code: ${code}${clipboardValue ? '\n\n(Copied to clipboard when possible.)' : ''}`
  );
});

  ui.createChannelBtn.addEventListener('click', async () => {
  if (!state.selectedServerId) {
    await showWarningDialog('Select a server first.');
    return;
  }
  if (!state.serverPermissions.manage_channels) {
    await showWarningDialog('You do not have permission to create channels.');
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
    await showWarningDialog(result.message);
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
    password: ui.loginPassword.value,
    company: ui.loginCompany?.value || '',
    clientSignal: getAuthClientSignal(),
    clientElapsedMs: Math.max(0, Date.now() - authTiming.loginShownAt)
  });

  if (!result.ok) {
    setAuthMessage(result.message, true);
    if (result.banned) {
      showBanAppealPrompt(result, ui.loginEmail.value);
    } else {
      hideBanAppealPrompt();
    }
    return;
  }

  await completeSignedInState(result);
});

ui.banAppealForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  setBanAppealMessage('Submitting appeal...');
  const result = await window.api.appeals.submitBanAppeal({
    email: ui.banAppealEmail?.value || ui.loginEmail.value,
    password: ui.banAppealPassword?.value || ui.loginPassword.value,
    reason: ui.banAppealReason.value
  });
  setBanAppealMessage(result.message || (result.ok ? 'Appeal submitted.' : 'Failed to submit appeal.'), !result.ok);
  if (result.ok) {
    ui.banAppealReason.value = '';
  }
});

ui.loginPasskeyBtn?.addEventListener('click', async () => {
  await startPasskeyLogin();
});

async function fetchLegalDoc(path) {
  if (window.api?.legal) {
    const fn = path === 'terms-of-service' ? window.api.legal.getTermsOfService : window.api.legal.getPrivacyPolicy;
    return fn ? await fn() : null;
  }
  try {
    const base = typeof location !== 'undefined' && location.protocol === 'file:' ? (localStorage?.getItem('jellochat_api_base') || 'https://chat.jellodog.com') : '';
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

function getPublicPageUrl(pathname) {
  if (typeof location !== 'undefined' && location.protocol !== 'file:') {
    return pathname;
  }
  const base = String(localStorage?.getItem('jellochat_api_base') || 'https://chat.jellodog.com').trim().replace(/\/+$/, '');
  return `${base}${pathname}`;
}

ui.viewTosBtn?.addEventListener('click', async (event) => {
  event.preventDefault();
  event.stopPropagation();
  window.open(getPublicPageUrl('/terms-of-service'), '_blank', 'noopener');
});

ui.viewPrivacyBtn?.addEventListener('click', async (event) => {
  event.preventDefault();
  event.stopPropagation();
  window.open(getPublicPageUrl('/privacy-policy'), '_blank', 'noopener');
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
    dateOfBirth,
    website: ui.registerWebsite?.value || '',
    clientSignal: getAuthClientSignal(),
    clientElapsedMs: Math.max(0, Date.now() - authTiming.registerShownAt)
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

  await completeSignedInState(result);
});

ui.messageForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const content = ui.messageInput.value.trim();
  if (!content && !state.selectedAttachment) {
    return;
  }

  if (isAdminGhostServer()) {
    await showSendBlockedDialog('Admin view is read-only.');
    return;
  }

  if (state.selectedDmUser) {
    const payload = await buildMessagePayload({ partnerUserId: state.selectedDmUser.id }, content);
    if (!payload) {
      return;
    }
    const dmResult = await window.api.dm.sendMessage(payload);
    if (!dmResult.ok) {
      await showSendBlockedDialog(dmResult.message);
      return;
    }

    ui.messageInput.value = '';
    clearSelectedAttachment();
    await loadDmMessages(state.selectedDmUser.id, state.selectedDmUser.username);
    return;
  }

  if (!state.selectedChannelId) {
    return;
  }

  const payload = await buildMessagePayload({ channelId: state.selectedChannelId }, content);
  if (!payload) {
    return;
  }
  const result = await window.api.chat.sendMessage(payload);

  if (!result.ok) {
    await showSendBlockedDialog(result.message);
    return;
  }

  ui.messageInput.value = '';
  clearSelectedAttachment();
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
installMobileSwipeDrawers();
closeServerOptions();
closeUserOptions();
closeAccountSettingsMenu();
syncDmCallButton();
renderAccountPanel();
updateVoiceButtons();
updateMicSensitivityUi();
setVcStatus('Not connected');
if (ui.vcVideoSink) {
  ui.vcVideoSink.textContent = 'No one is sharing right now.';
}
renderVoiceParticipants();
setupPasswordToggles();
installFontAwesomeFallback();
closeDobModal();
showLogin();
openBanAppealFromUrl();

function normalizeUiArtifactsInText(value) {
  return String(value || '')
    .replace(/ÃƒÂ¢Ã…Â Ã‹Å“/g, 'x')
    .replace(/ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢|Â·/g, '-');
}

function normalizeBrokenUiText(value) {
  return String(value || '')
    .replace(/(?:Ã¢Å Ëœ|ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã‚Â Ãƒâ€¹Ã…â€œ)/g, 'x')
    .replace(/(?:Ã¢â‚¬Â¢|ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢|Ã‚Â·)/g, '-');
}

function sanitizeTextUiArtifacts(root = document.body) {
  if (!root || root.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  const textTargets = [root, ...root.querySelectorAll('*')];
  for (const element of textTargets) {
    if (element.children.length === 0 && element.textContent) {
      const normalized = normalizeBrokenUiText(element.textContent);
      if (normalized !== element.textContent) {
        element.textContent = normalized;
      }
    }
  }
}

sanitizeTextUiArtifacts();
renderPasskeys();

const textUiObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'characterData') {
      const normalized = normalizeBrokenUiText(mutation.target.textContent);
      if (normalized !== mutation.target.textContent) {
        mutation.target.textContent = normalized;
      }
      continue;
    }

    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const normalized = normalizeBrokenUiText(node.textContent);
        if (normalized !== node.textContent) {
          node.textContent = normalized;
        }
        continue;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        sanitizeTextUiArtifacts(node);
      }
    }
  }
});

textUiObserver.observe(document.body, {
  childList: true,
  characterData: true,
  subtree: true
});

function setupAndroidAppPrompt() {
  const prompt = document.getElementById('android-app-prompt');
  const openBtn = document.getElementById('android-app-open');
  const continueBtn = document.getElementById('android-app-continue');
  const dontAsk = document.getElementById('android-app-dont-ask');
  if (!prompt || !openBtn || !continueBtn || !dontAsk) {
    return;
  }

  const userAgent = String(navigator.userAgent || '').toLowerCase();
  const isAndroid = userAgent.includes('android');
  const isAppWebView = userAgent.includes('jellochatandroidapp');
  const canPromptHere = ['http:', 'https:'].includes(window.location.protocol);
  if (!isAndroid || isAppWebView || !canPromptHere) {
    return;
  }

  try {
    if (window.localStorage.getItem('jellochat_android_app_prompt_hidden') === '1') {
      return;
    }
  } catch (_error) {
  }

  const rememberChoice = () => {
    if (!dontAsk.checked) {
      return;
    }
    try {
      window.localStorage.setItem('jellochat_android_app_prompt_hidden', '1');
    } catch (_error) {
    }
  };

  const closePrompt = () => {
    prompt.classList.add('hidden');
  };

  continueBtn.addEventListener('click', () => {
    rememberChoice();
    closePrompt();
  });

  openBtn.addEventListener('click', () => {
    rememberChoice();
    window.location.href = '/download/android';
  });

  window.setTimeout(() => {
    prompt.classList.remove('hidden');
  }, 700);
}

setupAndroidAppPrompt();

if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  });
}


handleAuthDeepLinks().catch(() => {});

(async function tryRestoreSession() {
  try {
    if (String(window.location.pathname || '') === '/ban-appeal') {
      return;
    }
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

    await completeSignedInState(result);
  } catch (_error) {
  }
})();
