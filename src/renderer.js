

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
  serverOptionsCloseBtn: document.getElementById('server-options-close-btn'),
  serverTabGeneral: document.getElementById('server-tab-general'),
  serverTabRoles: document.getElementById('server-tab-roles'),
  serverTabPermissions: document.getElementById('server-tab-permissions'),
  serverTabBanned: document.getElementById('server-tab-banned'),
  serverProfilePreviewIcon: document.getElementById('server-profile-preview-icon'),
  serverProfilePreviewName: document.getElementById('server-profile-preview-name'),
  serverPanelGeneral: document.getElementById('server-panel-general'),
  serverPanelRoles: document.getElementById('server-panel-roles'),
  serverPanelPermissions: document.getElementById('server-panel-permissions'),
  serverPanelBanned: document.getElementById('server-panel-banned'),
  serverNameInput: document.getElementById('server-name-input'),
  serverIconInput: document.getElementById('server-icon-input'),
  saveServerNameBtn: document.getElementById('save-server-name-btn'),
  createRoleBtn: document.getElementById('create-role-btn'),
  rolesList: document.getElementById('roles-list'),
  roleNameInput: document.getElementById('role-name-input'),
  roleColorInput: document.getElementById('role-color-input'),
  roleColorValue: document.getElementById('role-color-value'),
  permViewChannels: document.getElementById('perm-view-channels'),
  permManageServer: document.getElementById('perm-manage-server'),
  permManageRoles: document.getElementById('perm-manage-roles'),
  permManageChannels: document.getElementById('perm-manage-channels'),
  permCreateInvites: document.getElementById('perm-create-invites'),
  permSendMessages: document.getElementById('perm-send-messages'),
  permAttachFiles: document.getElementById('perm-attach-files'),
  permReadMessageHistory: document.getElementById('perm-read-message-history'),
  permManageMessages: document.getElementById('perm-manage-messages'),
  permConnectVoice: document.getElementById('perm-connect-voice'),
  permSpeakVoice: document.getElementById('perm-speak-voice'),
  permViewMembers: document.getElementById('perm-view-members'),
  permKickMembers: document.getElementById('perm-kick-members'),
  permBanMembers: document.getElementById('perm-ban-members'),
  permViewBans: document.getElementById('perm-view-bans'),
  permissionScopeSelect: document.getElementById('permission-scope-select'),
  permissionTargetTypeSelect: document.getElementById('permission-target-type-select'),
  permissionTargetSelect: document.getElementById('permission-target-select'),
  permissionOverrideList: document.getElementById('permission-override-list'),
  permissionOverrideEditor: document.getElementById('permission-override-editor'),
  savePermissionOverrideBtn: document.getElementById('save-permission-override-btn'),
  deletePermissionOverrideBtn: document.getElementById('delete-permission-override-btn'),
  saveRoleBtn: document.getElementById('save-role-btn'),
  deleteRoleBtn: document.getElementById('delete-role-btn'),
  roleMembersList: document.getElementById('role-members-list'),
  bannedUsersList: document.getElementById('banned-users-list'),
  leaveServerBtn: document.getElementById('leave-server-btn'),
  channelsList: document.getElementById('channels-list'),
  channelSettingsModal: document.getElementById('channel-settings-modal'),
  channelSettingsTitle: document.getElementById('channel-settings-title'),
  channelSettingsKind: document.getElementById('channel-settings-kind'),
  channelSettingsOverviewTab: document.getElementById('channel-settings-overview-tab'),
  channelSettingsPermissionsTab: document.getElementById('channel-settings-permissions-tab'),
  channelSettingsDeleteTab: document.getElementById('channel-settings-delete-tab'),
  channelSettingsCloseBtn: document.getElementById('channel-settings-close-btn'),
  channelSettingsOverviewPanel: document.getElementById('channel-settings-overview-panel'),
  channelSettingsPermissionsPanel: document.getElementById('channel-settings-permissions-panel'),
  channelSettingsNameLabel: document.getElementById('channel-settings-name-label'),
  channelSettingsName: document.getElementById('channel-settings-name'),
  channelSettingsCategoryLabel: document.getElementById('channel-settings-category-label'),
  channelSettingsCategory: document.getElementById('channel-settings-category'),
  channelSettingsChannelExtra: document.getElementById('channel-settings-channel-extra'),
  channelSettingsTopic: document.getElementById('channel-settings-topic'),
  channelSettingsSlowmode: document.getElementById('channel-settings-slowmode'),
  channelSettingsMeta: document.getElementById('channel-settings-meta'),
  channelSettingsSaveBtn: document.getElementById('channel-settings-save-btn'),
  channelSettingsPermissionsTitle: document.getElementById('channel-settings-permissions-title'),
  channelSettingsPermissionsCopy: document.getElementById('channel-settings-permissions-copy'),
  channelSettingsPrivateTitle: document.getElementById('channel-settings-private-title'),
  channelSettingsPrivateCopy: document.getElementById('channel-settings-private-copy'),
  channelSettingsPrivateToggle: document.getElementById('channel-settings-private-toggle'),
  channelSettingsAccessHeading: document.getElementById('channel-settings-access-heading'),
  channelSettingsAccessList: document.getElementById('channel-settings-access-list'),
  channelSettingsPermissionTargetType: document.getElementById('channel-settings-permission-target-type'),
  channelSettingsPermissionTarget: document.getElementById('channel-settings-permission-target'),
  channelSettingsPermissionRows: document.getElementById('channel-settings-permission-rows'),
  channelSettingsPermissionSaveBtn: document.getElementById('channel-settings-permission-save-btn'),
  channelSettingsPermissionDeleteBtn: document.getElementById('channel-settings-permission-delete-btn'),
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
  userOptionsProfile: document.getElementById('user-options-profile'),
  userOptionsRoles: document.getElementById('user-options-roles'),
  reportUserBtn: document.getElementById('report-user-btn'),
  kickUserBtn: document.getElementById('kick-user-btn'),
  banUserBtn: document.getElementById('ban-user-btn'),
  messageForm: document.getElementById('message-form'),
  messageInput: document.getElementById('message-input'),
  mentionSuggestions: document.getElementById('mention-suggestions'),
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
  notificationsSavePrefsBtn: document.getElementById('notifications-save-prefs-btn'),
  notificationsClearBtn: document.getElementById('notifications-clear-btn'),
  notificationsList: document.getElementById('notifications-list'),
  notifPrefDm: document.getElementById('notif-pref-dm'),
  notifPrefMentions: document.getElementById('notif-pref-mentions'),
  notifPrefChannel: document.getElementById('notif-pref-channel'),
  notifPrefFriends: document.getElementById('notif-pref-friends'),
  notifPrefCalls: document.getElementById('notif-pref-calls'),
  notifPrefModeration: document.getElementById('notif-pref-moderation'),
  adminModal: document.getElementById('admin-modal'),
  adminModalCloseBtn: document.getElementById('admin-modal-close-btn'),
  adminSearchInput: document.getElementById('admin-search-input'),
  adminSearchBtn: document.getElementById('admin-search-btn'),
  adminReportFilter: document.getElementById('admin-report-filter'),
  adminReportsList: document.getElementById('admin-reports-list'),
  adminAppealFilter: document.getElementById('admin-appeal-filter'),
  adminAppealsList: document.getElementById('admin-appeals-list'),
  adminStorageRefreshBtn: document.getElementById('admin-storage-refresh-btn'),
  adminStorageBackfillBtn: document.getElementById('admin-storage-backfill-btn'),
  adminStorageBackfillStatus: document.getElementById('admin-storage-backfill-status'),
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
  createCategoryBtn: document.getElementById('create-category-btn'),
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
  serverUrlModal: document.getElementById('server-url-modal'),
  serverUrlCloseBtn: document.getElementById('server-url-close-btn'),
  serverUrlCurrent: document.getElementById('server-url-current'),
  serverUrlForm: document.getElementById('server-url-form'),
  serverUrlInput: document.getElementById('server-url-input'),
  serverUrlList: document.getElementById('server-url-list'),
  serverUrlResetBtn: document.getElementById('server-url-reset-btn'),
  serverUrlMessage: document.getElementById('server-url-message'),
  screenSourceModal: document.getElementById('screen-source-modal'),
  screenSourceGrid: document.getElementById('screen-source-grid'),
  screenSourceCancelBtn: document.getElementById('screen-source-cancel-btn')
};

const SERVER_PERMISSION_DEFINITIONS = [
  { key: 'view_channels', label: 'View Channels', group: 'General', input: 'permViewChannels' },
  { key: 'manage_server', label: 'Manage Server', group: 'General', input: 'permManageServer' },
  { key: 'manage_roles', label: 'Manage Roles', group: 'General', input: 'permManageRoles' },
  { key: 'manage_channels', label: 'Manage Channels', group: 'General', input: 'permManageChannels' },
  { key: 'create_invites', label: 'Create Invites', group: 'General', input: 'permCreateInvites' },
  { key: 'send_messages', label: 'Send Messages', group: 'Text', input: 'permSendMessages' },
  { key: 'attach_files', label: 'Attach Files', group: 'Text', input: 'permAttachFiles' },
  { key: 'read_message_history', label: 'Read Message History', group: 'Text', input: 'permReadMessageHistory' },
  { key: 'manage_messages', label: 'Manage Messages', group: 'Text', input: 'permManageMessages' },
  { key: 'connect_voice', label: 'Connect', group: 'Voice', input: 'permConnectVoice' },
  { key: 'speak_voice', label: 'Speak', group: 'Voice', input: 'permSpeakVoice' },
  { key: 'view_members', label: 'View Members', group: 'Moderation', input: 'permViewMembers' },
  { key: 'kick_members', label: 'Kick Members', group: 'Moderation', input: 'permKickMembers' },
  { key: 'ban_members', label: 'Ban Members', group: 'Moderation', input: 'permBanMembers' },
  { key: 'view_bans', label: 'View Bans', group: 'Moderation', input: 'permViewBans' }
];

const SERVER_PERMISSION_KEYS = SERVER_PERMISSION_DEFINITIONS.map((permission) => permission.key);

function emptyServerPermissions() {
  return Object.fromEntries(SERVER_PERMISSION_KEYS.map((key) => [key, false]));
}

const API_BASE_KEY = 'jellochat_api_base';
const API_BASES_KEY = 'jellochat_api_bases';
const DEFAULT_SERVER_BASE = 'https://chat.jellodog.com';

const state = {
  user: null,
  servers: [],
  channelCategories: [],
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
  serverPermissions: emptyServerPermissions(),
  serverRoles: [],
  serverRoleMembers: [],
  permissionOverrideState: null,
  selectedPermissionOverrideId: null,
  selectedRoleId: null,
  channelDrag: null,
  channelDragSuppressClick: false,
  channelSettingsTarget: null,
  channelSettingsTab: 'overview',
  channelSettingsPermissionState: null,
  selectedChannelSettingsOverrideId: null,
  pendingPermissionScope: null,
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
  notificationPreferences: {
    dm_messages: true,
    mentions: true,
    channel_messages: false,
    friend_requests: true,
    calls: true,
    moderation: true
  },
  unread: {
    channels: {},
    dms: {},
    notifications: 0
  },
  mentionPicker: {
    open: false,
    activeIndex: 0,
    triggerStart: -1,
    triggerEnd: -1,
    items: [],
    candidates: [],
    serverId: null
  },
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

function resetMentionCandidates() {
  state.mentionPicker.candidates = [];
  state.mentionPicker.serverId = null;
}

function hideMentionSuggestions() {
  state.mentionPicker.open = false;
  state.mentionPicker.items = [];
  state.mentionPicker.activeIndex = 0;
  state.mentionPicker.triggerStart = -1;
  state.mentionPicker.triggerEnd = -1;
  ui.mentionSuggestions?.classList.add('hidden');
  if (ui.mentionSuggestions) {
    ui.mentionSuggestions.innerHTML = '';
  }
}

function getMentionTrigger(input) {
  const caret = input.selectionStart ?? input.value.length;
  const beforeCaret = input.value.slice(0, caret);
  const match = beforeCaret.match(/(^|\s)@([^\s@]{0,40})$/);
  if (!match) {
    return null;
  }
  const triggerStart = beforeCaret.length - match[2].length - 1;
  return {
    triggerStart,
    triggerEnd: caret,
    query: match[2].toLowerCase()
  };
}

function normalizeMentionText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function candidateMatchesQuery(candidate, query) {
  if (!query) {
    return true;
  }
  const haystack = `${candidate.name} ${candidate.username || ''}`.toLowerCase();
  return haystack.includes(query);
}

function makeMentionCandidatesFromRolesState(result) {
  const members = (result?.members || [])
    .filter((member) => Number(member.id) !== Number(state.currentUserId) && !member.platform_banned_at)
    .map((member) => ({
      type: 'member',
      id: Number(member.id),
      name: normalizeMentionText(member.username),
      username: normalizeMentionText(member.username),
      color: '#99aab5',
      online: Boolean(member.online)
    }));
  const roles = (result?.roles || [])
    .filter((role) => normalizeMentionText(role.name) && !role.is_default)
    .map((role) => ({
      type: 'role',
      id: Number(role.id),
      name: normalizeMentionText(role.name),
      color: role.color || '#99aab5'
    }));
  return [...members, ...roles];
}

async function ensureMentionCandidates() {
  if (!state.selectedServerId || state.selectedDmUser || isAdminGhostServer()) {
    return [];
  }
  if (state.mentionPicker.serverId === state.selectedServerId && state.mentionPicker.candidates.length) {
    return state.mentionPicker.candidates;
  }
  let candidates = [];
  if (window.api?.roles?.getState) {
    const result = await window.api.roles.getState({ serverId: state.selectedServerId });
    if (result?.ok) {
      candidates = makeMentionCandidatesFromRolesState(result);
    }
  }
  if (!candidates.length) {
    candidates = (state.onlineUsers || [])
      .filter((member) => Number(member.id) !== Number(state.currentUserId) && !member.platform_banned_at)
      .map((member) => ({
        type: 'member',
        id: Number(member.id),
        name: normalizeMentionText(member.username),
        username: normalizeMentionText(member.username),
        color: '#99aab5',
        online: Boolean(member.online)
      }));
  }
  state.mentionPicker.serverId = state.selectedServerId;
  state.mentionPicker.candidates = candidates;
  return candidates;
}

function renderMentionSuggestions() {
  if (!ui.mentionSuggestions) {
    return;
  }
  ui.mentionSuggestions.innerHTML = '';
  if (!state.mentionPicker.open || !state.mentionPicker.items.length) {
    ui.mentionSuggestions.classList.add('hidden');
    return;
  }
  state.mentionPicker.items.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mention-suggestion-item';
    button.classList.toggle('active', index === state.mentionPicker.activeIndex);
    button.setAttribute('role', 'option');
    button.setAttribute('aria-selected', index === state.mentionPicker.activeIndex ? 'true' : 'false');
    const avatar = document.createElement('span');
    avatar.className = `mention-suggestion-avatar ${item.type}`;
    avatar.style.setProperty('--mention-color', item.color || '#99aab5');
    avatar.textContent = item.type === 'role' ? '@' : item.name.slice(0, 1).toUpperCase();
    const label = document.createElement('span');
    label.className = 'mention-suggestion-label';
    label.textContent = item.name;
    const meta = document.createElement('span');
    meta.className = 'mention-suggestion-meta';
    meta.textContent = item.type === 'role' ? 'Role' : (item.online ? 'Online' : 'Member');
    button.append(avatar, label, meta);
    button.addEventListener('mousedown', (event) => {
      event.preventDefault();
      applyMentionSuggestion(item);
    });
    ui.mentionSuggestions.appendChild(button);
  });
  ui.mentionSuggestions.classList.remove('hidden');
}

async function updateMentionSuggestions() {
  if (!ui.messageInput || document.activeElement !== ui.messageInput) {
    hideMentionSuggestions();
    return;
  }
  const trigger = getMentionTrigger(ui.messageInput);
  const serverId = state.selectedServerId;
  if (!trigger) {
    hideMentionSuggestions();
    return;
  }
  const candidates = await ensureMentionCandidates();
  const currentTrigger = getMentionTrigger(ui.messageInput);
  if (
    !currentTrigger ||
    serverId !== state.selectedServerId ||
    currentTrigger.triggerStart !== trigger.triggerStart ||
    currentTrigger.triggerEnd !== trigger.triggerEnd ||
    currentTrigger.query !== trigger.query
  ) {
    return;
  }
  const items = candidates
    .filter((candidate) => candidate.name && candidateMatchesQuery(candidate, trigger.query))
    .slice(0, 8);
  if (!items.length) {
    hideMentionSuggestions();
    return;
  }
  state.mentionPicker.open = true;
  state.mentionPicker.triggerStart = trigger.triggerStart;
  state.mentionPicker.triggerEnd = trigger.triggerEnd;
  state.mentionPicker.items = items;
  state.mentionPicker.activeIndex = Math.min(state.mentionPicker.activeIndex, items.length - 1);
  renderMentionSuggestions();
}

function applyMentionSuggestion(item) {
  if (!ui.messageInput || state.mentionPicker.triggerStart < 0) {
    return;
  }
  const input = ui.messageInput;
  const before = input.value.slice(0, state.mentionPicker.triggerStart);
  const after = input.value.slice(input.selectionStart ?? state.mentionPicker.triggerEnd);
  const mention = `@${item.name} `;
  input.value = `${before}${mention}${after}`;
  const nextCaret = before.length + mention.length;
  input.focus();
  input.setSelectionRange(nextCaret, nextCaret);
  hideMentionSuggestions();
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

function setServerIconContent(container, server) {
  if (!container) {
    return;
  }
  const label = server?.name || 'Server';
  const initials = getServerInitials(label);
  const iconUrl = String(server?.icon_url || server?.iconUrl || '').trim();
  container.textContent = '';
  container.setAttribute('aria-label', `${label} server icon`);
  if (iconUrl) {
    const img = document.createElement('img');
    img.src = iconUrl;
    img.alt = `${label} server icon`;
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
      description: 'This account is suspended from JelloDog Chat.'
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
  state.currentUserId = result.user?.id || null;
  renderAccountPanel();
  setAuthMessage('');
  await openChat();
  await enforceDobIfMissing();
  await maybePromptForAvatar();
  await loadNotificationState();
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

function normalizeUnreadSummary(unread = {}) {
  const channels = {};
  const dms = {};
  for (const item of unread.channels || []) {
    channels[Number(item.channel_id)] = {
      count: Number(item.count || 0),
      mentions: Number(item.mentions || 0)
    };
  }
  for (const item of unread.dms || []) {
    dms[Number(item.partner_user_id)] = Number(item.count || 0);
  }
  return {
    channels,
    dms,
    notifications: Number(unread.notifications || 0)
  };
}

function applyUnreadSummary(unread) {
  state.unread = normalizeUnreadSummary(unread);
  renderUnreadBadges();
}

function getNotificationPreferencesFromInputs() {
  return {
    dm_messages: Boolean(ui.notifPrefDm?.checked),
    mentions: Boolean(ui.notifPrefMentions?.checked),
    channel_messages: Boolean(ui.notifPrefChannel?.checked),
    friend_requests: Boolean(ui.notifPrefFriends?.checked),
    calls: Boolean(ui.notifPrefCalls?.checked),
    moderation: Boolean(ui.notifPrefModeration?.checked)
  };
}

function syncNotificationPreferenceInputs() {
  const prefs = state.notificationPreferences || {};
  if (ui.notifPrefDm) ui.notifPrefDm.checked = prefs.dm_messages !== false;
  if (ui.notifPrefMentions) ui.notifPrefMentions.checked = prefs.mentions !== false;
  if (ui.notifPrefChannel) ui.notifPrefChannel.checked = Boolean(prefs.channel_messages);
  if (ui.notifPrefFriends) ui.notifPrefFriends.checked = prefs.friend_requests !== false;
  if (ui.notifPrefCalls) ui.notifPrefCalls.checked = prefs.calls !== false;
  if (ui.notifPrefModeration) ui.notifPrefModeration.checked = prefs.moderation !== false;
}

function makeUnreadBadge(count) {
  const normalized = typeof count === 'object' && count !== null
    ? Number(count.mentions || count.count || 0)
    : Number(count || 0);
  if (normalized <= 0) {
    return null;
  }
  const badge = document.createElement('span');
  badge.className = 'unread-badge';
  badge.textContent = normalized > 99 ? '99+' : String(normalized);
  return badge;
}

function makeChannelUnreadIndicator(unreadInfo) {
  const count = typeof unreadInfo === 'object' && unreadInfo !== null
    ? Number(unreadInfo.count || 0)
    : Number(unreadInfo || 0);
  const mentions = typeof unreadInfo === 'object' && unreadInfo !== null
    ? Number(unreadInfo.mentions || 0)
    : 0;
  if (mentions > 0) {
    const badge = document.createElement('span');
    badge.className = 'unread-badge mention-count';
    badge.textContent = mentions > 99 ? '99+' : String(mentions);
    return badge;
  }
  if (count > 0) {
    const marker = document.createElement('span');
    marker.className = 'unread-badge message-marker';
    marker.setAttribute('aria-label', `${count} unread message${count === 1 ? '' : 's'}`);
    return marker;
  }
  return null;
}

function renderUnreadBadges() {
  const notificationCount = Number(state.unread?.notifications || 0);
  ui.notificationsBtn?.classList.toggle('has-unread', notificationCount > 0);
  ui.notificationsBtn?.setAttribute('data-count', notificationCount > 99 ? '99+' : String(notificationCount || ''));
  if (ui.channelsList?.children.length) {
    renderChannels();
  }
  if (ui.friendsList?.children.length) {
    renderFriends();
  }
  renderFriendsHome();
}

async function refreshUnreadState() {
  if (!window.api?.notifications?.getUnread || !state.user) {
    return;
  }
  const result = await window.api.notifications.getUnread();
  if (result?.ok) {
    applyUnreadSummary(result.unread);
  }
}

async function loadNotificationState() {
  if (!window.api?.notifications?.list) {
    return;
  }
  const result = await window.api.notifications.list();
  if (!result?.ok) {
    return;
  }
  state.notifications = result.notifications || [];
  state.notificationPreferences = result.preferences || state.notificationPreferences;
  applyUnreadSummary(result.unread);
  syncNotificationPreferenceInputs();
  renderNotifications();
}

async function markActiveChannelRead(channelId) {
  if (!window.api?.notifications?.markChannelRead || !channelId || isAdminGhostServer()) {
    return;
  }
  const result = await window.api.notifications.markChannelRead({ channelId });
  if (result?.ok) {
    applyUnreadSummary(result.unread);
  }
}

async function markActiveDmRead(partnerUserId) {
  if (!window.api?.notifications?.markDmRead || !partnerUserId) {
    return;
  }
  const result = await window.api.notifications.markDmRead({ partnerUserId });
  if (result?.ok) {
    applyUnreadSummary(result.unread);
  }
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

function pushNotificationItem(title, body, options = {}) {
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: options.type || 'local',
    title: String(title || 'Notification'),
    body: String(body || ''),
    data: options.data || {},
    read_at: options.read_at || null,
    createdAt: new Date().toISOString()
  };
  state.notifications.unshift(item);
  state.notifications = state.notifications.slice(0, 50);
  renderNotifications();
  if (!item.read_at) {
    state.unread.notifications = Number(state.unread.notifications || 0) + 1;
    renderUnreadBadges();
  }
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
    row.className = `notification-item ${item.read_at ? '' : 'unread'}`.trim();

    const title = document.createElement('div');
    title.className = 'notification-title';
    title.textContent = item.title;

    const body = document.createElement('div');
    body.textContent = item.body;

    const meta = document.createElement('div');
    meta.className = 'notification-meta';
    meta.textContent = new Date(item.created_at || item.createdAt).toLocaleString();

    row.append(title, body, meta);
    if (!item.read_at && Number(item.id) && window.api?.notifications?.markRead) {
      row.addEventListener('click', async () => {
        const result = await window.api.notifications.markRead({ notificationId: item.id });
        if (result?.ok) {
          item.read_at = new Date().toISOString();
          applyUnreadSummary(result.unread);
          renderNotifications();
        }
      });
    }
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

function normalizeMentionName(value) {
  return String(value || '').split('#')[0].trim().toLowerCase();
}

function getCurrentUserMentionNames() {
  const names = new Set();
  const username = normalizeMentionName(state.user?.username);
  if (username) {
    names.add(username);
  }
  if (state.selectedServerId) {
    const self = (state.onlineUsers || []).find((member) => Number(member.id) === Number(state.currentUserId));
    for (const roleName of self?.role_names || []) {
      const normalized = normalizeMentionName(roleName);
      if (normalized) {
        names.add(normalized);
      }
    }
  }
  return names;
}

function messageMentionsCurrentUser(value) {
  const names = getCurrentUserMentionNames();
  if (!names.size) {
    return false;
  }
  const mentionPattern = /(^|\s)@([^\s@.,!?;:)\]}]+(?:\s+[^\s@.,!?;:)\]}]+)*)(?=$|\s|[.,!?;:)\]}])/gi;
  let match;
  while ((match = mentionPattern.exec(String(value || ''))) !== null) {
    if (names.has(normalizeMentionName(match[2]))) {
      return true;
    }
  }
  return false;
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

function appendMentionAwareText(container, text, highlightNames) {
  const mentionPattern = /(^|\s)@([^\s@.,!?;:)\]}]+(?:\s+[^\s@.,!?;:)\]}]+)*)(?=$|\s|[.,!?;:)\]}])/gi;
  let lastIndex = 0;
  let match;
  while ((match = mentionPattern.exec(text)) !== null) {
    const mentionText = match[0];
    const leadingWhitespace = match[1] || '';
    const mentionName = match[2] || '';
    const mentionStart = match.index + leadingWhitespace.length;
    if (mentionStart > lastIndex) {
      container.appendChild(document.createTextNode(text.slice(lastIndex, mentionStart)));
    }
    const span = document.createElement('span');
    span.className = 'message-mention';
    if (highlightNames?.has(normalizeMentionName(mentionName))) {
      span.classList.add('is-self');
    }
    span.textContent = `@${mentionName}`;
    container.appendChild(span);
    lastIndex = match.index + mentionText.length;
  }
  if (lastIndex < text.length) {
    container.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
}

function appendLinkedMessageText(container, value) {
  const text = String(value || '');
  const urlPattern = /((?:https?:\/\/|www\.)[^\s<]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<]*)?)/gi;
  const highlightNames = getCurrentUserMentionNames();
  let lastIndex = 0;
  let match;

  while ((match = urlPattern.exec(text)) !== null) {
    const rawMatch = match[0];
    const start = match.index;
    const leadingText = text.slice(lastIndex, start);
    if (leadingText) {
      appendMentionAwareText(container, leadingText, highlightNames);
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
    appendMentionAwareText(container, tail, highlightNames);
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
    categories: result.categories || [],
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
    const cleanupText = formatEmptyServerCleanupText(server);
    meta.textContent = `ID ${server.id} - ${owner} - ${server.member_count || 0} members - ${server.channel_count || 0} channels${cleanupText ? ` - ${cleanupText}` : ''}`;

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
  renderAdminStorageItem(ui.adminStorageConfig, 'Compression', config.compressionEnabled ? `${config.compressionAlgorithm || 'brotli'} auto when useful` : 'Disabled');
  renderAdminStorageItem(ui.adminStorageConfig, 'Custom Key', config.encryptionKeyConfigured ? 'Configured' : 'Using fallback key');
  renderAdminStorageEditableItem(ui.adminStorageConfig, 'Cleanup Interval Minutes', 'cleanup-interval-minutes-input', config.cleanupIntervalMinutes ?? 60, { min: 5, max: 10080 });
  renderAdminStorageEditableItem(ui.adminStorageConfig, 'Empty Server Cleanup Days', 'cleanup-empty-server-days-input', config.emptyServerCleanupDays ?? 7, { min: 0, max: 3650 });
  renderAdminStorageEditableItem(ui.adminStorageConfig, 'Banned User Cleanup Days', 'cleanup-banned-user-days-input', config.bannedUserCleanupDays ?? 30, { min: 0, max: 3650 });
  renderAdminStorageItem(ui.adminStorageConfig, 'Blocked Types', (config.blockedExtensions || []).join(', '));

  renderAdminStorageItem(ui.adminStorageStats, 'Active Attachments', `${stats.active_attachments || 0}`);
  renderAdminStorageItem(ui.adminStorageStats, 'Active Stored Size', formatFileSize(stats.active_bytes || 0));
  renderAdminStorageItem(ui.adminStorageStats, 'Active Original Size', formatFileSize(stats.active_original_bytes || stats.active_bytes || 0));
  renderAdminStorageItem(ui.adminStorageStats, 'Active Compression Saved', formatFileSize(stats.active_compression_saved_bytes || 0));
  const activeOriginalBytes = Number(stats.active_original_bytes || stats.active_bytes || 0);
  const activeStoredBytes = Number(stats.active_bytes || 0);
  const compressionRatio = activeOriginalBytes > 0 ? Math.round((1 - (activeStoredBytes / activeOriginalBytes)) * 100) : 0;
  renderAdminStorageItem(ui.adminStorageStats, 'Compression Ratio', `${Math.max(0, compressionRatio)}% saved`);
  if (config.storageQuotaMb > 0) {
    const quotaBytes = Number(config.storageQuotaMb || 0) * 1024 * 1024;
    const activeBytes = Number(stats.active_bytes || 0);
    const percent = quotaBytes > 0 ? Math.min(100, Math.round((activeBytes / quotaBytes) * 100)) : 0;
    renderAdminStorageItem(ui.adminStorageStats, 'Quota Used', `${formatFileSize(activeBytes)} / ${formatFileSize(quotaBytes)} (${percent}%)`);
  } else {
    renderAdminStorageItem(ui.adminStorageStats, 'Quota Used', `${formatFileSize(stats.active_bytes || 0)} / Unlimited`);
  }
  renderAdminStorageItem(ui.adminStorageStats, 'Total Stored Records', `${stats.total_attachments || 0}`);
  renderAdminStorageItem(ui.adminStorageStats, 'Total Original Size', formatFileSize(stats.total_original_bytes || stats.total_bytes || 0));
  renderAdminStorageItem(ui.adminStorageStats, 'Total Stored Size', formatFileSize(stats.total_stored_bytes || stats.total_bytes || 0));
  renderAdminStorageItem(ui.adminStorageStats, 'Total Compression Saved', formatFileSize(stats.compression_saved_bytes || 0));
  renderAdminStorageItem(ui.adminStorageStats, 'Compressed Attachments', `${stats.compressed_attachments || 0}`);
  renderAdminStorageItem(ui.adminStorageStats, 'Compression Pending', `${stats.compression_pending_attachments || 0}`);
  renderAdminStorageItem(ui.adminStorageStats, 'Expired Waiting Cleanup', `${stats.expired_attachments || 0}`);
  renderAdminStorageItem(ui.adminStorageStats, 'Expiring Within 7 Days', `${stats.expiring_soon || 0}`);
  renderAdminStorageItem(ui.adminStorageStats, 'Banned Accounts Retained', `${stats.banned_accounts_retained || 0}`);
  renderAdminStorageItem(ui.adminStorageStats, 'Banned Accounts Waiting Delete', `${stats.banned_accounts_waiting_delete || 0}`);
  renderAdminStorageItem(ui.adminStorageStats, 'Empty Servers Retained', `${stats.empty_servers_retained || 0}`);
  renderAdminStorageItem(ui.adminStorageStats, 'Empty Servers Waiting Delete', `${stats.empty_servers_waiting_delete || 0}`);
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

async function runAdminAttachmentCompressionBackfill() {
  if (!window.api.admin?.runAttachmentCompressionBackfill) {
    await showWarningDialog('Attachment compression backfill is not available in this build.');
    return;
  }
  if (ui.adminStorageBackfillBtn) {
    ui.adminStorageBackfillBtn.disabled = true;
  }
  if (ui.adminStorageBackfillStatus) {
    ui.adminStorageBackfillStatus.textContent = 'Compressing old attachments...';
  }
  const result = await window.api.admin.runAttachmentCompressionBackfill({ limit: 25 });
  if (ui.adminStorageBackfillBtn) {
    ui.adminStorageBackfillBtn.disabled = false;
  }
  if (!result.ok) {
    if (ui.adminStorageBackfillStatus) {
      ui.adminStorageBackfillStatus.textContent = '';
    }
    await showWarningDialog(result.message);
    return;
  }
  renderAdminStorage(result);
  const summary = result.summary || {};
  if (ui.adminStorageBackfillStatus) {
    ui.adminStorageBackfillStatus.textContent = `Backfill scanned ${summary.scanned || 0}, compressed ${summary.compressed || 0}, skipped ${summary.skipped || 0}, failed ${summary.failed || 0}, saved ${formatFileSize(summary.bytesSaved || 0)}.`;
  }
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
  const banCleanupText = formatBannedAccountCleanupText(user);
  ui.adminUserDetailsTitle.textContent = user.username;
  ui.adminUserDetailsMeta.textContent = `${user.email} - ${role} - ${banStatus}${banCleanupText ? ` - ${banCleanupText}` : ''} - Standing: ${formatStandingLabel(user.account_standing)} (${user.tos_violation_count || 0})`;
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
  } else {
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

  const appealsTitle = document.createElement('div');
  appealsTitle.className = 'admin-server-name';
  appealsTitle.textContent = 'Ban Appeals';
  ui.adminUserReportsList.appendChild(appealsTitle);

  if (!details.appeals?.length) {
    const empty = document.createElement('div');
    empty.className = 'account-form-message';
    empty.textContent = 'No ban appeals for this account.';
    ui.adminUserReportsList.appendChild(empty);
    return;
  }

  for (const appeal of details.appeals) {
    const item = document.createElement('div');
    item.className = 'admin-report-item';

    const reason = document.createElement('div');
    reason.textContent = appeal.reason;

    const status = document.createElement('div');
    status.className = `admin-report-status status-${appeal.status || 'open'}`;
    status.textContent = formatReportStatus(appeal.status || 'open');

    const meta = document.createElement('div');
    meta.className = 'admin-report-meta';
    meta.textContent = `Submitted on ${new Date(appeal.created_at).toLocaleString()}`;

    item.append(reason, status, meta);
    if (appeal.review_note || appeal.reviewed_by_username) {
      const review = document.createElement('div');
      review.className = 'admin-report-meta';
      const reviewedAt = appeal.reviewed_at ? ` on ${new Date(appeal.reviewed_at).toLocaleString()}` : '';
      const reviewedBy = appeal.reviewed_by_username ? `Reviewed by ${appeal.reviewed_by_username}${reviewedAt}` : 'Reviewed';
      review.textContent = appeal.review_note ? `${reviewedBy}: ${appeal.review_note}` : reviewedBy;
      item.appendChild(review);
    }
    ui.adminUserReportsList.appendChild(item);
  }
}

function formatEmptyServerCleanupText(server) {
  if (!server?.empty_since) {
    return '';
  }
  const cleanupDays = Number(server.empty_cleanup_days || 0);
  if (cleanupDays <= 0) {
    return 'Empty server auto-delete disabled';
  }
  const remaining = Number(server.empty_delete_days_remaining);
  if (!Number.isFinite(remaining)) {
    return '';
  }
  if (remaining <= 0) {
    return 'Empty - deletes on next cleanup';
  }
  return `Empty - ${remaining} day${remaining === 1 ? '' : 's'} left`;
}

function formatBannedAccountCleanupText(user) {
  if (!user?.platform_banned_at) {
    return '';
  }
  const cleanupDays = Number(user.banned_cleanup_days || 0);
  if (cleanupDays <= 0) {
    return 'Auto-delete disabled';
  }
  const remaining = Number(user.banned_delete_days_remaining);
  if (!Number.isFinite(remaining)) {
    return '';
  }
  if (remaining <= 0) {
    return 'Deletes on next cleanup';
  }
  return `${remaining} day${remaining === 1 ? '' : 's'} left`;
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
    const banCleanupText = formatBannedAccountCleanupText(user);
    flags.textContent = `${user.is_platform_admin ? 'Admin' : 'Member'}${user.platform_banned_at ? ` - Banned${banCleanupText ? ` - ${banCleanupText}` : ''}` : ''}`;
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

async function showDiscordMigrationDialog({ inviteUrl = '', code = '' } = {}) {
  const command = code ? `/jello-pair ${code}` : '/jello-pair';

  if (dialogState.resolver) {
    dialogState.resolver(null);
    dialogState.resolver = null;
  }

  ui.appDialogTitle.textContent = 'Discord Migration';
  ui.appDialogMessage.textContent = '';
  ui.appDialogOkBtn.textContent = 'Done';
  ui.appDialogCancelBtn.classList.add('hidden');
  ui.appDialogInput.classList.add('hidden');
  ui.appDialogInput.value = '';

  const body = document.createElement('div');
  body.className = 'migration-dialog';

  const statusSection = document.createElement('div');
  statusSection.className = 'migration-status-row';
  const statusPill = document.createElement('span');
  statusPill.className = 'migration-status-pill pending';
  statusPill.textContent = 'Waiting';
  const statusText = document.createElement('span');
  statusText.className = 'migration-status-text';
  statusText.textContent = 'Waiting for the Discord bot to pair with this code.';
  statusSection.append(statusPill, statusText);

  const inviteSection = document.createElement('div');
  inviteSection.className = 'migration-dialog-section';

  const inviteTitle = document.createElement('strong');
  inviteTitle.textContent = 'Invite the Discord bot';
  inviteSection.appendChild(inviteTitle);

  if (inviteUrl) {
    const inviteButton = document.createElement('button');
    inviteButton.type = 'button';
    inviteButton.className = 'migration-invite-btn';
    setIconButtonContent(inviteButton, 'fa-brands fa-discord', 'Invite Bot');
    inviteButton.addEventListener('click', () => {
      window.open(inviteUrl, '_blank', 'noopener,noreferrer');
    });
    inviteSection.appendChild(inviteButton);
  } else {
    const missingInvite = document.createElement('p');
    missingInvite.textContent = 'Discord bot invite is not configured yet. Set DISCORD_BOT_CLIENT_ID.';
    inviteSection.appendChild(missingInvite);
  }

  const codeSection = document.createElement('div');
  codeSection.className = 'migration-dialog-section';

  const codeTitle = document.createElement('strong');
  codeTitle.textContent = 'Pair this migration';
  codeSection.appendChild(codeTitle);

  const codeHelp = document.createElement('p');
  codeHelp.textContent = 'Run this slash command in the Discord server. The bot will send a Start JelloChat Migration button.';
  codeSection.appendChild(codeHelp);

  const codeBox = document.createElement('div');
  codeBox.className = 'migration-code-box';

  const codeInput = document.createElement('input');
  codeInput.type = 'text';
  codeInput.readOnly = true;
  codeInput.value = command;
  codeInput.setAttribute('aria-label', 'Discord migration pair command');
  codeInput.addEventListener('focus', () => {
    codeInput.select();
  });
  codeInput.addEventListener('click', () => {
    codeInput.select();
  });

  const copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.className = 'migration-copy-btn';
  setIconButtonContent(copyButton, 'fa-solid fa-copy', 'Copy');
  copyButton.addEventListener('click', async () => {
    if (!navigator.clipboard?.writeText) {
      codeInput.focus();
      codeInput.select();
      return;
    }
    try {
      await navigator.clipboard.writeText(command);
      setIconButtonContent(copyButton, 'fa-solid fa-check', 'Copied');
      window.setTimeout(() => setIconButtonContent(copyButton, 'fa-solid fa-copy', 'Copy'), 1400);
    } catch (_error) {
      codeInput.focus();
      codeInput.select();
    }
  });

  codeBox.append(codeInput, copyButton);
  codeSection.appendChild(codeBox);

  const scopeNote = document.createElement('p');
  scopeNote.className = 'migration-scope-note';
  scopeNote.textContent = 'Only categories and text/voice channels are imported.';
  codeSection.appendChild(scopeNote);

  body.append(statusSection, inviteSection, codeSection);
  ui.appDialogMessage.appendChild(body);

  animateShowOverlay(ui.appDialog);
  if (inviteUrl) {
    ui.appDialogMessage.querySelector('.migration-invite-btn')?.focus();
  } else {
    codeInput.focus();
  }

  return new Promise((resolve) => {
    const resolveDialog = resolve;
    dialogState.resolver = resolveDialog;
    if (!code || !window.api?.chat?.getDiscordMigrationStatus) {
      return;
    }

    let isPolling = false;
    const updateStatus = async () => {
      if (dialogState.resolver !== resolveDialog || isPolling) {
        return;
      }
      isPolling = true;
      try {
        const result = await window.api.chat.getDiscordMigrationStatus(code);
        if (!result.ok) {
          statusPill.className = 'migration-status-pill failed';
          statusPill.textContent = 'Error';
          statusText.textContent = result.message || 'Could not load migration status.';
          return;
        }

        const session = result.session || {};
        const guildName = session.discordGuildName || 'Discord server';
        if (session.status === 'paired') {
          statusPill.className = 'migration-status-pill linked';
          statusPill.textContent = 'Linked';
          statusText.textContent = `${guildName} is linked. Click Start JelloChat Migration in Discord.`;
        } else if (session.status === 'importing') {
          statusPill.className = 'migration-status-pill importing';
          statusPill.textContent = 'Migrating';
          statusText.textContent = `Importing categories and channels from ${guildName}.`;
        } else if (session.status === 'imported') {
          statusPill.className = 'migration-status-pill linked';
          statusPill.textContent = 'Done';
          statusText.textContent = `Migration complete. Opening ${guildName} in JelloChat.`;
          window.clearInterval(pollTimer);
          if (session.importedServerId) {
            state.selectedServerId = Number(session.importedServerId);
            await loadServers(false);
          }
          if (dialogState.resolver === resolveDialog) {
            dialogState.resolver = null;
            closeAppDialog();
            resolveDialog(true);
          }
        } else if (session.status === 'failed') {
          statusPill.className = 'migration-status-pill failed';
          statusPill.textContent = 'Failed';
          statusText.textContent = session.errorMessage || 'Migration failed.';
          window.clearInterval(pollTimer);
        } else if (session.status === 'expired') {
          statusPill.className = 'migration-status-pill failed';
          statusPill.textContent = 'Expired';
          statusText.textContent = 'This pairing code expired. Start a new migration to get a fresh code.';
          window.clearInterval(pollTimer);
        }
      } catch (_error) {
        statusPill.className = 'migration-status-pill failed';
        statusPill.textContent = 'Offline';
        statusText.textContent = 'Waiting to reconnect to migration status.';
      } finally {
        isPolling = false;
      }
    };
    const pollTimer = window.setInterval(() => {
      if (dialogState.resolver !== resolveDialog) {
        window.clearInterval(pollTimer);
        return;
      }
      updateStatus();
    }, 1500);
    updateStatus();
  });
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
  state.channelCategories = [];
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
  state.notificationPreferences = {
    dm_messages: true,
    mentions: true,
    channel_messages: false,
    friend_requests: true,
    calls: true,
    moderation: true
  };
  state.unread = {
    channels: {},
    dms: {},
    notifications: 0
  };
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
  ui.createCategoryBtn.style.display = canCreateChannel ? 'inline-flex' : 'none';
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

function getServerInitials(name) {
  const text = String(name || 'JC').trim();
  if (!text) {
    return 'JC';
  }
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  return text.slice(0, 2).toUpperCase();
}

function normalizeRoleColor(value) {
  const color = String(value || '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color.toLowerCase() : '#99aab5';
}

function setServerOptionsTab(tabName) {
  state.serverOptionsTab = tabName;
  const generalActive = tabName === 'general';
  const rolesActive = tabName === 'roles';
  const permissionsActive = tabName === 'permissions';
  ui.serverTabGeneral.classList.toggle('active', generalActive);
  ui.serverTabRoles.classList.toggle('active', rolesActive);
  ui.serverTabPermissions?.classList.toggle('active', permissionsActive);
  ui.serverTabBanned.classList.toggle('active', tabName === 'banned');
  ui.serverPanelGeneral.classList.toggle('hidden', !generalActive);
  ui.serverPanelRoles.classList.toggle('hidden', !rolesActive);
  ui.serverPanelPermissions?.classList.toggle('hidden', !permissionsActive);
  ui.serverPanelBanned.classList.toggle('hidden', tabName !== 'banned');
  if (permissionsActive) {
    loadPermissionOverridesState().catch((error) => showWarningDialog(error.message || 'Failed to load channel permissions.'));
  }
}

function getRoleEditorPermissions() {
  return Object.fromEntries(SERVER_PERMISSION_DEFINITIONS.map((permission) => [
    permission.key,
    Boolean(ui[permission.input]?.checked)
  ]));
}

function setRoleEditor(role) {
  const permissions = role?.permissions || {};
  const color = normalizeRoleColor(role?.color);
  ui.roleNameInput.value = role?.name || '';
  if (ui.roleColorInput) {
    ui.roleColorInput.value = color;
  }
  if (ui.roleColorValue) {
    ui.roleColorValue.textContent = color;
  }
  for (const permission of SERVER_PERMISSION_DEFINITIONS) {
    if (ui[permission.input]) {
      ui[permission.input].checked = Boolean(permissions[permission.key]);
    }
  }

  const canManage = Boolean(state.serverPermissions.manage_roles);
  ui.createRoleBtn.disabled = !canManage;
  const isDefault = Boolean(role?.is_default);
  ui.roleNameInput.disabled = !canManage || isDefault;
  if (ui.roleColorInput) {
    ui.roleColorInput.disabled = !canManage || !role;
  }
  for (const permission of SERVER_PERMISSION_DEFINITIONS) {
    if (ui[permission.input]) {
      ui[permission.input].disabled = !canManage;
    }
  }
  ui.saveRoleBtn.disabled = !canManage || !role;
  ui.deleteRoleBtn.disabled = !canManage || !role || isDefault;
}

function getPermissionStateForKey(key) {
  const selected = state.permissionOverrideState?.overrides?.find((override) => override.id === state.selectedPermissionOverrideId);
  if (selected?.allow?.[key]) {
    return 'allow';
  }
  if (selected?.deny?.[key]) {
    return 'deny';
  }
  return 'inherit';
}

function setPermissionStateForKey(key, value) {
  const selected = state.permissionOverrideState?.overrides?.find((override) => override.id === state.selectedPermissionOverrideId);
  if (!selected) {
    return;
  }
  selected.allow = selected.allow || {};
  selected.deny = selected.deny || {};
  selected.allow[key] = value === 'allow';
  selected.deny[key] = value === 'deny';
  renderPermissionOverrideEditor();
}

function getCurrentPermissionScope() {
  const [scopeType, rawId] = String(ui.permissionScopeSelect?.value || '').split(':');
  return { scopeType, scopeId: Number(rawId) };
}

function getPermissionOverrideLabel(override) {
  const data = state.permissionOverrideState;
  const scope = override.scope_type === 'category'
    ? data?.categories?.find((item) => item.id === override.category_id)
    : data?.channels?.find((item) => item.id === override.channel_id);
  const target = override.target_type === 'role'
    ? data?.roles?.find((item) => item.id === override.role_id)
    : data?.members?.find((item) => item.id === override.user_id);
  return `${override.scope_type === 'category' ? 'Category' : 'Channel'}: ${scope?.name || 'Unknown'} -> ${override.target_type === 'role' ? 'Role' : 'Member'}: ${target?.name || target?.username || 'Unknown'}`;
}

function syncPermissionTargetOptions() {
  const targetType = ui.permissionTargetTypeSelect?.value || 'role';
  const targets = targetType === 'role' ? (state.permissionOverrideState?.roles || []) : (state.permissionOverrideState?.members || []);
  ui.permissionTargetSelect.innerHTML = '';
  for (const target of targets) {
    const option = document.createElement('option');
    option.value = String(target.id);
    option.textContent = target.name || target.username || `#${target.id}`;
    ui.permissionTargetSelect.appendChild(option);
  }
}

function renderPermissionOverrideEditor() {
  if (!ui.permissionOverrideEditor) {
    return;
  }
  ui.permissionOverrideEditor.innerHTML = '';
  let selected = state.permissionOverrideState?.overrides?.find((override) => override.id === state.selectedPermissionOverrideId);
  if (!selected) {
    const scope = getCurrentPermissionScope();
    selected = {
      id: 'draft',
      scope_type: scope.scopeType,
      category_id: scope.scopeType === 'category' ? scope.scopeId : null,
      channel_id: scope.scopeType === 'channel' ? scope.scopeId : null,
      target_type: ui.permissionTargetTypeSelect?.value || 'role',
      role_id: ui.permissionTargetTypeSelect?.value === 'role' ? Number(ui.permissionTargetSelect?.value) : null,
      user_id: ui.permissionTargetTypeSelect?.value === 'member' ? Number(ui.permissionTargetSelect?.value) : null,
      allow: {},
      deny: {}
    };
    state.permissionOverrideState.overrides.push(selected);
    state.selectedPermissionOverrideId = selected.id;
  }
  ui.deletePermissionOverrideBtn.disabled = selected.id === 'draft';

  for (const group of [...new Set(SERVER_PERMISSION_DEFINITIONS.map((permission) => permission.group))]) {
    const groupEl = document.createElement('div');
    groupEl.className = 'permission-state-group';
    const title = document.createElement('h3');
    title.textContent = group;
    groupEl.appendChild(title);
    for (const permission of SERVER_PERMISSION_DEFINITIONS.filter((item) => item.group === group)) {
      const row = document.createElement('div');
      row.className = 'permission-state-row';
      const label = document.createElement('span');
      label.textContent = permission.label;
      row.appendChild(label);
      for (const value of ['inherit', 'allow', 'deny']) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'permission-state-btn';
        button.classList.toggle('active', getPermissionStateForKey(permission.key) === value);
        button.textContent = value[0].toUpperCase() + value.slice(1);
        button.addEventListener('click', () => setPermissionStateForKey(permission.key, value));
        row.appendChild(button);
      }
      groupEl.appendChild(row);
    }
    ui.permissionOverrideEditor.appendChild(groupEl);
  }
}

function renderPermissionOverrides() {
  const data = state.permissionOverrideState;
  if (!data || !ui.permissionScopeSelect) {
    return;
  }
  ui.permissionScopeSelect.innerHTML = '';
  for (const category of data.categories || []) {
    const option = document.createElement('option');
    option.value = `category:${category.id}`;
    option.textContent = `Category: ${category.name}`;
    ui.permissionScopeSelect.appendChild(option);
  }
  for (const channel of data.channels || []) {
    const option = document.createElement('option');
    option.value = `channel:${channel.id}`;
    option.textContent = `${channel.type === 'voice' ? 'Voice' : 'Text'}: ${channel.name}`;
    ui.permissionScopeSelect.appendChild(option);
  }
  syncPermissionTargetOptions();

  ui.permissionOverrideList.innerHTML = '';
  for (const override of data.overrides || []) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'permission-override-item';
    button.classList.toggle('active', override.id === state.selectedPermissionOverrideId);
    button.textContent = getPermissionOverrideLabel(override);
    button.addEventListener('click', () => {
      state.selectedPermissionOverrideId = override.id;
      if (ui.permissionTargetTypeSelect) {
        ui.permissionTargetTypeSelect.value = override.target_type;
        syncPermissionTargetOptions();
        ui.permissionTargetSelect.value = String(override.target_type === 'role' ? override.role_id : override.user_id);
      }
      if (ui.permissionScopeSelect) {
        ui.permissionScopeSelect.value = `${override.scope_type}:${override.scope_type === 'category' ? override.category_id : override.channel_id}`;
      }
      renderPermissionOverrides();
      renderPermissionOverrideEditor();
    });
    ui.permissionOverrideList.appendChild(button);
  }
  renderPermissionOverrideEditor();
}

async function loadPermissionOverridesState() {
  if (!state.serverOptionsServerId || !window.api.permissions?.getOverrides) {
    return;
  }
  const result = await window.api.permissions.getOverrides({ serverId: state.serverOptionsServerId });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }
  state.permissionOverrideState = result;
  state.selectedPermissionOverrideId = result.overrides?.[0]?.id || null;
  renderPermissionOverrides();
  applyPendingPermissionScope();
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
      await refreshSelectedServerPresence();
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
    const colorDot = document.createElement('span');
    colorDot.className = 'role-color-dot';
    colorDot.style.backgroundColor = normalizeRoleColor(role.color);
    const label = document.createElement('span');
    label.textContent = role.name;
    button.append(colorDot, label);
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
  if (state.serverOptionsServerId === state.selectedServerId) {
    resetMentionCandidates();
  }
  renderRoles();
}

async function refreshSelectedServerPresence() {
  if (state.selectedServerId) {
    await loadServerPresence(state.selectedServerId);
  }
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

function closeChannelSettings() {
  state.channelSettingsTarget = null;
  state.channelSettingsTab = 'overview';
  state.channelSettingsPermissionState = null;
  state.selectedChannelSettingsOverrideId = null;
  ui.channelSettingsModal?.classList.add('hidden');
}

function populateChannelSettingsCategorySelect(selectedCategoryId = null) {
  if (!ui.channelSettingsCategory) {
    return;
  }
  ui.channelSettingsCategory.innerHTML = '';
  const none = document.createElement('option');
  none.value = '';
  none.textContent = 'No Category';
  ui.channelSettingsCategory.appendChild(none);
  for (const category of orderedCategories()) {
    const option = document.createElement('option');
    option.value = String(category.id);
    option.textContent = category.name;
    ui.channelSettingsCategory.appendChild(option);
  }
  ui.channelSettingsCategory.value = selectedCategoryId ? String(selectedCategoryId) : '';
}

function openChannelSettings(kind, id) {
  if (!state.serverPermissions.manage_channels || isAdminGhostServer()) {
    return;
  }
  const isCategory = kind === 'category';
  const target = isCategory
    ? state.channelCategories.find((category) => Number(category.id) === Number(id))
    : state.channels.find((channel) => Number(channel.id) === Number(id));
  if (!target) {
    return;
  }

  closeUserOptions();
  state.channelSettingsTarget = { kind, id: Number(id) };
  state.channelSettingsPermissionState = null;
  state.selectedChannelSettingsOverrideId = null;
  ui.channelSettingsTitle.textContent = 'Overview';
  if (ui.channelSettingsKind) {
    ui.channelSettingsKind.textContent = isCategory ? `${target.name} Category` : `${target.name} Channel`;
  }
  if (ui.channelSettingsNameLabel) {
    ui.channelSettingsNameLabel.textContent = isCategory ? 'Category Name' : 'Channel Name';
  }
  setChannelSettingsTab('overview');
  if (ui.channelSettingsDeleteTab) {
    ui.channelSettingsDeleteTab.textContent = isCategory ? 'Delete Category' : 'Delete Channel';
  }
  ui.channelSettingsName.value = target.name || '';
  ui.channelSettingsMeta.textContent = isCategory
    ? 'Deleting a category moves its channels to the top level.'
    : `${String(target.type || 'text').toUpperCase()} channel settings`;
  ui.channelSettingsChannelExtra?.classList.toggle('hidden', isCategory);
  ui.channelSettingsCategoryLabel?.classList.toggle('hidden', isCategory);
  ui.channelSettingsCategory?.classList.toggle('hidden', isCategory);
  if (!isCategory) {
    populateChannelSettingsCategorySelect(target.category_id);
    if (ui.channelSettingsTopic) {
      ui.channelSettingsTopic.value = target.topic || '';
    }
    if (ui.channelSettingsSlowmode) {
      ui.channelSettingsSlowmode.value = String(target.slowmode_seconds || 0);
    }
  }
  ui.channelSettingsModal?.classList.remove('hidden');
  requestAnimationFrame(() => ui.channelSettingsName?.focus());
}

function getChannelSettingsPermissionScope() {
  const target = state.channelSettingsTarget;
  if (!target) {
    return null;
  }
  return {
    scopeType: target.kind,
    scopeId: target.id
  };
}

function getChannelSettingsTargetObject() {
  const target = state.channelSettingsTarget;
  if (!target) {
    return null;
  }
  return target.kind === 'category'
    ? state.channelCategories.find((category) => Number(category.id) === Number(target.id))
    : state.channels.find((channel) => Number(channel.id) === Number(target.id));
}

function setChannelSettingsTab(tab) {
  state.channelSettingsTab = tab;
  ui.channelSettingsOverviewTab?.classList.toggle('active', tab === 'overview');
  ui.channelSettingsPermissionsTab?.classList.toggle('active', tab === 'permissions');
  ui.channelSettingsDeleteTab?.classList.remove('active');
  ui.channelSettingsOverviewPanel?.classList.toggle('hidden', tab !== 'overview');
  ui.channelSettingsPermissionsPanel?.classList.toggle('hidden', tab !== 'permissions');
  if (tab === 'overview') {
    requestAnimationFrame(() => ui.channelSettingsName?.focus());
  }
}

function channelSettingsOverrideMatchesScope(override, scope = getChannelSettingsPermissionScope()) {
  if (!override || !scope || override.scope_type !== scope.scopeType) {
    return false;
  }
  const overrideScopeId = scope.scopeType === 'category' ? override.category_id : override.channel_id;
  return Number(overrideScopeId) === Number(scope.scopeId);
}

function channelSettingsOverrideMatchesTarget(override, targetType, targetId) {
  if (!override || override.target_type !== targetType) {
    return false;
  }
  const overrideTargetId = targetType === 'role' ? override.role_id : override.user_id;
  return Number(overrideTargetId) === Number(targetId);
}

function getChannelSettingsDefaultRole() {
  return (state.channelSettingsPermissionState?.roles || []).find((role) => role.is_default)
    || (state.channelSettingsPermissionState?.roles || [])[0]
    || null;
}

function getChannelSettingsTargetName(targetType, targetId) {
  const data = state.channelSettingsPermissionState;
  const target = targetType === 'role'
    ? (data?.roles || []).find((role) => Number(role.id) === Number(targetId))
    : (data?.members || []).find((member) => Number(member.id) === Number(targetId));
  return target?.name || target?.username || `#${targetId}`;
}

function syncChannelSettingsPermissionTargets() {
  if (!ui.channelSettingsPermissionTarget || !ui.channelSettingsPermissionTargetType) {
    return;
  }
  const targetType = ui.channelSettingsPermissionTargetType.value || 'role';
  const targets = targetType === 'role'
    ? (state.channelSettingsPermissionState?.roles || [])
    : (state.channelSettingsPermissionState?.members || []);
  const previousValue = ui.channelSettingsPermissionTarget.value;
  ui.channelSettingsPermissionTarget.innerHTML = '';
  for (const target of targets) {
    const option = document.createElement('option');
    option.value = String(target.id);
    option.textContent = target.name || target.username || `#${target.id}`;
    ui.channelSettingsPermissionTarget.appendChild(option);
  }
  if ([...ui.channelSettingsPermissionTarget.options].some((option) => option.value === previousValue)) {
    ui.channelSettingsPermissionTarget.value = previousValue;
  }
  ui.channelSettingsPermissionTarget.disabled = targets.length === 0;
}

function getSelectedChannelSettingsOverride() {
  const data = state.channelSettingsPermissionState;
  const scope = getChannelSettingsPermissionScope();
  if (!data || !scope) {
    return null;
  }
  let selected = (data.overrides || []).find((override) => override.id === state.selectedChannelSettingsOverrideId);
  if (!selected || !channelSettingsOverrideMatchesScope(selected, scope)) {
    const targetType = ui.channelSettingsPermissionTargetType?.value || 'role';
    const targetId = Number(ui.channelSettingsPermissionTarget?.value);
    selected = (data.overrides || []).find((override) => (
      channelSettingsOverrideMatchesScope(override, scope)
      && channelSettingsOverrideMatchesTarget(override, targetType, targetId)
    ));
  }
  if (selected) {
    state.selectedChannelSettingsOverrideId = selected.id;
    return selected;
  }

  const targetType = ui.channelSettingsPermissionTargetType?.value || 'role';
  const targetId = Number(ui.channelSettingsPermissionTarget?.value);
  if (!targetId) {
    return null;
  }
  const draft = {
    id: 'channel-draft',
    scope_type: scope.scopeType,
    category_id: scope.scopeType === 'category' ? scope.scopeId : null,
    channel_id: scope.scopeType === 'channel' ? scope.scopeId : null,
    target_type: targetType,
    role_id: targetType === 'role' ? targetId : null,
    user_id: targetType === 'member' ? targetId : null,
    allow: {},
    deny: {}
  };
  data.overrides = (data.overrides || []).filter((override) => override.id !== 'channel-draft');
  data.overrides.push(draft);
  state.selectedChannelSettingsOverrideId = draft.id;
  return draft;
}

function getChannelSettingsPermissionValue(key) {
  const selected = getSelectedChannelSettingsOverride();
  if (selected?.allow?.[key]) {
    return 'allow';
  }
  if (selected?.deny?.[key]) {
    return 'deny';
  }
  return 'inherit';
}

function setChannelSettingsPermissionValue(key, value) {
  const selected = getSelectedChannelSettingsOverride();
  if (!selected) {
    return;
  }
  selected.allow = selected.allow || {};
  selected.deny = selected.deny || {};
  selected.allow[key] = value === 'allow';
  selected.deny[key] = value === 'deny';
  renderChannelSettingsPermissionRows();
}

function renderChannelSettingsAccessList() {
  if (!ui.channelSettingsAccessList) {
    return;
  }
  const data = state.channelSettingsPermissionState;
  const scopedOverrides = (data?.overrides || []).filter((override) => (
    override.id !== 'channel-draft' && channelSettingsOverrideMatchesScope(override)
  ));
  ui.channelSettingsAccessList.innerHTML = '';
  if (!scopedOverrides.length) {
    const empty = document.createElement('div');
    empty.className = 'channel-access-empty';
    empty.textContent = 'No custom role or member overrides yet.';
    ui.channelSettingsAccessList.appendChild(empty);
    return;
  }
  for (const override of scopedOverrides) {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'channel-access-row';
    row.classList.toggle('active', override.id === state.selectedChannelSettingsOverrideId);
    const name = getChannelSettingsTargetName(override.target_type, override.target_type === 'role' ? override.role_id : override.user_id);
    const allowCount = Object.values(override.allow || {}).filter(Boolean).length;
    const denyCount = Object.values(override.deny || {}).filter(Boolean).length;
    row.innerHTML = `<span><i class="fa-solid ${override.target_type === 'role' ? 'fa-user-shield' : 'fa-user'}" aria-hidden="true"></i>${escapeHtmlText(name)}</span><small>${allowCount} allow, ${denyCount} deny</small>`;
    row.addEventListener('click', () => {
      state.selectedChannelSettingsOverrideId = override.id;
      if (ui.channelSettingsPermissionTargetType) {
        ui.channelSettingsPermissionTargetType.value = override.target_type;
      }
      syncChannelSettingsPermissionTargets();
      if (ui.channelSettingsPermissionTarget) {
        ui.channelSettingsPermissionTarget.value = String(override.target_type === 'role' ? override.role_id : override.user_id);
      }
      renderChannelSettingsPermissions();
    });
    ui.channelSettingsAccessList.appendChild(row);
  }
}

function renderChannelSettingsPermissionRows() {
  if (!ui.channelSettingsPermissionRows) {
    return;
  }
  const selected = getSelectedChannelSettingsOverride();
  ui.channelSettingsPermissionRows.innerHTML = '';
  if (!selected) {
    const empty = document.createElement('div');
    empty.className = 'channel-access-empty';
    empty.textContent = 'Choose a role or member to edit permissions.';
    ui.channelSettingsPermissionRows.appendChild(empty);
    return;
  }
  const groups = [...new Set(SERVER_PERMISSION_DEFINITIONS.map((permission) => permission.group))];
  for (const group of groups) {
    const groupEl = document.createElement('div');
    groupEl.className = 'channel-permission-group';
    const title = document.createElement('h4');
    title.textContent = `${group} Permissions`;
    groupEl.appendChild(title);
    for (const permission of SERVER_PERMISSION_DEFINITIONS.filter((item) => item.group === group)) {
      const row = document.createElement('div');
      row.className = 'channel-permission-row';
      const label = document.createElement('div');
      label.innerHTML = `<strong>${escapeHtmlText(permission.label)}</strong><span>${escapeHtmlText(getPermissionHelpText(permission.key))}</span>`;
      row.appendChild(label);
      const actions = document.createElement('div');
      actions.className = 'channel-permission-actions';
      for (const [value, icon, titleText] of [['deny', 'fa-xmark', 'Deny'], ['inherit', 'fa-slash', 'Inherit'], ['allow', 'fa-check', 'Allow']]) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `channel-permission-state ${value}`;
        button.classList.toggle('active', getChannelSettingsPermissionValue(permission.key) === value);
        button.title = titleText;
        button.setAttribute('aria-label', `${titleText} ${permission.label}`);
        button.innerHTML = `<i class="fa-solid ${icon}" aria-hidden="true"></i>`;
        button.addEventListener('click', () => setChannelSettingsPermissionValue(permission.key, value));
        actions.appendChild(button);
      }
      row.appendChild(actions);
      groupEl.appendChild(row);
    }
    ui.channelSettingsPermissionRows.appendChild(groupEl);
  }
  if (ui.channelSettingsPermissionDeleteBtn) {
    ui.channelSettingsPermissionDeleteBtn.disabled = selected.id === 'channel-draft';
  }
}

function getPermissionHelpText(key) {
  const help = {
    view_channels: 'Allows members to see this category or channel.',
    manage_server: 'Allows server-wide setup changes.',
    manage_roles: 'Allows role management.',
    manage_channels: 'Allows channel and category changes.',
    create_invites: 'Allows members to create invites.',
    send_messages: 'Allows sending messages in text channels.',
    attach_files: 'Allows uploading files.',
    read_message_history: 'Allows reading previous messages.',
    manage_messages: 'Allows deleting other members messages.',
    connect_voice: 'Allows joining voice channels.',
    speak_voice: 'Allows speaking in voice channels.',
    view_members: 'Allows viewing member lists and presence.',
    kick_members: 'Allows kicking members.',
    ban_members: 'Allows banning and unbanning members.',
    view_bans: 'Allows viewing server bans.'
  };
  return help[key] || 'Controls this permission for the selected target.';
}

function renderChannelSettingsPermissions() {
  const target = getChannelSettingsTargetObject();
  const isCategory = state.channelSettingsTarget?.kind === 'category';
  if (ui.channelSettingsPermissionsTitle) {
    ui.channelSettingsPermissionsTitle.textContent = isCategory ? 'Category Settings' : 'Channel Settings';
  }
  if (ui.channelSettingsPermissionsCopy) {
    ui.channelSettingsPermissionsCopy.textContent = `Use permissions to customize who can do what in ${target?.name || 'this item'}.`;
  }
  if (ui.channelSettingsPrivateTitle) {
    ui.channelSettingsPrivateTitle.textContent = isCategory ? 'Private Category' : 'Private Channel';
  }
  if (ui.channelSettingsPrivateCopy) {
    ui.channelSettingsPrivateCopy.textContent = isCategory
      ? 'Only selected members and roles will be able to view this category. Channels inside it will match this setting.'
      : 'Only selected members and roles will be able to view this channel.';
  }
  if (ui.channelSettingsAccessHeading) {
    ui.channelSettingsAccessHeading.textContent = isCategory ? 'Who can access this category?' : 'Who can access this channel?';
  }
  syncChannelSettingsPermissionTargets();
  const defaultRole = getChannelSettingsDefaultRole();
  const everyoneOverride = (state.channelSettingsPermissionState?.overrides || []).find((override) => (
    defaultRole
    && channelSettingsOverrideMatchesScope(override)
    && channelSettingsOverrideMatchesTarget(override, 'role', defaultRole.id)
  ));
  if (ui.channelSettingsPrivateToggle) {
    ui.channelSettingsPrivateToggle.checked = Boolean(everyoneOverride?.deny?.view_channels);
    ui.channelSettingsPrivateToggle.disabled = !defaultRole;
  }
  renderChannelSettingsAccessList();
  renderChannelSettingsPermissionRows();
}

async function loadChannelSettingsPermissions() {
  if (!state.selectedServerId || !window.api.permissions?.getOverrides) {
    return;
  }
  const result = await window.api.permissions.getOverrides({ serverId: state.selectedServerId });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }
  state.channelSettingsPermissionState = result;
  state.channelSettingsPermissionState.overrides = (result.overrides || []).filter((override) => override.id !== 'channel-draft');
  const scopedOverride = state.channelSettingsPermissionState.overrides.find((override) => channelSettingsOverrideMatchesScope(override));
  state.selectedChannelSettingsOverrideId = scopedOverride?.id || null;
  if (ui.channelSettingsPermissionTargetType) {
    ui.channelSettingsPermissionTargetType.value = scopedOverride?.target_type || 'role';
  }
  syncChannelSettingsPermissionTargets();
  if (scopedOverride && ui.channelSettingsPermissionTarget) {
    ui.channelSettingsPermissionTarget.value = String(scopedOverride.target_type === 'role' ? scopedOverride.role_id : scopedOverride.user_id);
  }
  renderChannelSettingsPermissions();
}

async function saveChannelSettingsPermissionOverride() {
  const selected = getSelectedChannelSettingsOverride();
  const scope = getChannelSettingsPermissionScope();
  const targetType = ui.channelSettingsPermissionTargetType?.value || 'role';
  const targetId = Number(ui.channelSettingsPermissionTarget?.value);
  if (!state.selectedServerId || !selected || !scope || !targetId) {
    return;
  }
  const result = await window.api.permissions.saveOverride({
    serverId: state.selectedServerId,
    scopeType: scope.scopeType,
    scopeId: scope.scopeId,
    targetType,
    targetId,
    allow: selected.allow || {},
    deny: selected.deny || {}
  });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }
  await loadChannelSettingsPermissions();
  await loadChannels(state.selectedServerId, false);
}

async function deleteChannelSettingsPermissionOverride() {
  const selected = getSelectedChannelSettingsOverride();
  if (!state.selectedServerId || !selected || selected.id === 'channel-draft') {
    return;
  }
  const confirmed = await showConfirmDialog('Remove Override', 'Remove this channel permission override?', 'Remove', 'Cancel');
  if (!confirmed) {
    return;
  }
  const result = await window.api.permissions.deleteOverride({
    serverId: state.selectedServerId,
    overrideId: selected.id
  });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }
  state.selectedChannelSettingsOverrideId = null;
  await loadChannelSettingsPermissions();
  await loadChannels(state.selectedServerId, false);
}

async function saveChannelSettingsPrivateToggle() {
  const defaultRole = getChannelSettingsDefaultRole();
  const scope = getChannelSettingsPermissionScope();
  if (!defaultRole || !scope || !state.selectedServerId) {
    return;
  }
  const saveDefaultViewOverride = async ({ scopeType, scopeId }) => {
    let override = (state.channelSettingsPermissionState?.overrides || []).find((item) => (
      item.scope_type === scopeType
      && Number(scopeType === 'category' ? item.category_id : item.channel_id) === Number(scopeId)
      && channelSettingsOverrideMatchesTarget(item, 'role', defaultRole.id)
    ));
    if (!override) {
      override = {
        allow: {},
        deny: {}
      };
    }
    override.allow = { ...(override.allow || {}), view_channels: false };
    override.deny = { ...(override.deny || {}), view_channels: Boolean(ui.channelSettingsPrivateToggle?.checked) };
    return window.api.permissions.saveOverride({
      serverId: state.selectedServerId,
      scopeType,
      scopeId,
      targetType: 'role',
      targetId: defaultRole.id,
      allow: override.allow,
      deny: override.deny
    });
  };

  const result = await saveDefaultViewOverride(scope);
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }

  if (scope.scopeType === 'category') {
    const childChannels = (state.channelSettingsPermissionState?.channels || [])
      .filter((channel) => Number(channel.category_id) === Number(scope.scopeId));
    for (const channel of childChannels) {
      const childResult = await saveDefaultViewOverride({ scopeType: 'channel', scopeId: channel.id });
      if (!childResult.ok) {
        await showWarningDialog(childResult.message);
        return;
      }
    }
  }

  await loadChannelSettingsPermissions();
  await loadChannels(state.selectedServerId, false);
}

function applyPendingPermissionScope() {
  if (!state.pendingPermissionScope || !state.permissionOverrideState || !ui.permissionScopeSelect) {
    return;
  }
  const value = `${state.pendingPermissionScope.scopeType}:${state.pendingPermissionScope.scopeId}`;
  if ([...ui.permissionScopeSelect.options].some((option) => option.value === value)) {
    ui.permissionScopeSelect.value = value;
    state.permissionOverrideState.overrides = (state.permissionOverrideState.overrides || []).filter((override) => override.id !== 'draft');
    const existing = state.permissionOverrideState.overrides.find((override) => (
      override.scope_type === state.pendingPermissionScope.scopeType
      && Number(state.pendingPermissionScope.scopeType === 'category' ? override.category_id : override.channel_id) === Number(state.pendingPermissionScope.scopeId)
    ));
    state.selectedPermissionOverrideId = existing?.id || null;
    renderPermissionOverrides();
  }
  state.pendingPermissionScope = null;
}

async function saveChannelSettings() {
  const target = state.channelSettingsTarget;
  if (!target) {
    return;
  }
  const name = ui.channelSettingsName.value.trim();
  if (!name) {
    await showWarningDialog('Name is required.');
    return;
  }
  const result = target.kind === 'category'
    ? await window.api.chat.updateCategory({ categoryId: target.id, name })
    : await window.api.chat.updateChannel({
      channelId: target.id,
      name,
      topic: ui.channelSettingsTopic?.value || '',
      slowmodeSeconds: Number(ui.channelSettingsSlowmode?.value || 0),
      categoryId: ui.channelSettingsCategory?.value ? Number(ui.channelSettingsCategory.value) : null
    });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }
  closeChannelSettings();
  await loadChannels(state.selectedServerId, false);
}

async function deleteChannelSettingsTarget() {
  const target = state.channelSettingsTarget;
  if (!target) {
    return;
  }
  const isCategory = target.kind === 'category';
  const confirmed = await showConfirmDialog(
    isCategory ? 'Delete Category' : 'Delete Channel',
    isCategory ? 'Delete this category? Channels inside it will move to the top level.' : 'Delete this channel and its messages?',
    'Delete',
    'Cancel'
  );
  if (!confirmed) {
    return;
  }
  const result = isCategory
    ? await window.api.chat.deleteCategory({ categoryId: target.id })
    : await window.api.chat.deleteChannel({ channelId: target.id });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }
  if (!isCategory && state.selectedChannelId === target.id) {
    state.selectedChannelId = null;
  }
  closeChannelSettings();
  await loadChannels(state.selectedServerId, true);
}

function closeUserOptions() {
  state.selectedModerationUserId = null;
  ui.userOptionsMenu.classList.remove('open');
  ui.userOptionsMenu.classList.add('hidden');
}

function renderUserOptionsDetails(user) {
  if (ui.userOptionsProfile) {
    ui.userOptionsProfile.innerHTML = '';
    if (user) {
      const avatar = createAvatarElement(user, 'avatar');
      const meta = document.createElement('div');
      const name = document.createElement('strong');
      name.textContent = user.username || 'User';
      const status = document.createElement('span');
      status.textContent = user.online ? 'Online' : 'Offline';
      meta.append(name, status);
      ui.userOptionsProfile.append(avatar, meta);
    }
  }

  if (!ui.userOptionsRoles) {
    return;
  }
  ui.userOptionsRoles.innerHTML = '';
  const title = document.createElement('div');
  title.className = 'user-options-section-title';
  title.textContent = 'Roles';
  ui.userOptionsRoles.appendChild(title);
  const roleDetails = Array.isArray(user?.role_details)
    ? user.role_details.filter((role) => role?.name)
    : (user?.role_names || user?.roles || []).filter(Boolean).map((name) => ({ name, color: '#99aab5' }));
  if (!roleDetails.length) {
    const empty = document.createElement('span');
    empty.className = 'user-options-empty-role';
    empty.textContent = 'No roles';
    ui.userOptionsRoles.appendChild(empty);
    return;
  }
  const chips = document.createElement('div');
  chips.className = 'user-options-role-chips';
  roleDetails.forEach((role) => {
    const chip = document.createElement('span');
    chip.className = 'user-options-role-chip';
    const dot = document.createElement('span');
    dot.className = 'role-color-dot';
    dot.style.backgroundColor = normalizeRoleColor(role.color);
    const name = document.createElement('span');
    name.textContent = role.name;
    chip.append(dot, name);
    chips.appendChild(chip);
  });
  ui.userOptionsRoles.appendChild(chips);
}

function openServerOptions(serverId, buttonElement) {
  state.serverOptionsServerId = serverId;
  closeUserOptions();
  setServerOptionsTab('general');
  const selected = state.servers.find((s) => s.id === serverId);
  ui.serverNameInput.value = selected?.name || '';
  if (ui.serverIconInput) {
    ui.serverIconInput.value = selected?.icon_url || '';
  }
  if (ui.serverProfilePreviewName) {
    ui.serverProfilePreviewName.textContent = selected?.name || 'Server';
  }
  setServerIconContent(ui.serverProfilePreviewIcon, selected);
  ui.serverNameInput.disabled = !state.serverPermissions.manage_server;
  if (ui.serverIconInput) {
    ui.serverIconInput.disabled = !state.serverPermissions.manage_server;
  }
  ui.saveServerNameBtn.disabled = !state.serverPermissions.manage_server;
  loadRolesState();
  ui.serverOptionsMenu.classList.remove('hidden');
  requestAnimationFrame(() => {
    ui.serverOptionsMenu.classList.add('open');
  });
}

function openUserOptions(userId, buttonElement) {
  state.selectedModerationUserId = userId;
  const user = state.onlineUsers.find((item) => item.id === userId) || null;
  renderUserOptionsDetails(user);
  ui.reportUserBtn?.classList.remove('hidden');
  ui.kickUserBtn?.classList.toggle('hidden', !state.serverPermissions.kick_members);
  ui.banUserBtn?.classList.toggle('hidden', !state.serverPermissions.ban_members);
  const presenceColumnRect = ui.onlineUsersList.closest('.presence-column').getBoundingClientRect();
  const buttonRect = buttonElement.getBoundingClientRect();

  const top = buttonRect.top - presenceColumnRect.top;
  const left = buttonRect.left - presenceColumnRect.left - 248;

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
      if (!payload.notification) {
        notifyUser(payload.title || 'Removed From Server', message);
      }
      await loadServers(false);
      if (state.selectedServerId === payload.serverId) {
        await loadServers(false);
      }
      await showMessageDialog(payload.title || 'Removed From Server', message);
      return;
    }

    if (payload.type === 'notification-created' && payload.notification) {
      state.notifications.unshift(payload.notification);
      state.notifications = state.notifications.slice(0, 100);
      renderNotifications();
      await refreshUnreadState();
      sendBrowserNotification(payload.notification.title, payload.notification.body).catch(() => {});
      return;
    }

    if (payload.type === 'server-created' || payload.type === 'server-updated' || payload.type === 'server-membership-changed') {
      await loadServers(false);
    }

    if ((payload.type === 'channel-created' || payload.type === 'channel-layout-updated') && state.selectedServerId === payload.serverId) {
      await loadChannels(state.selectedServerId, false);
    }

    if (payload.type === 'presence-changed' && state.selectedServerId === payload.serverId) {
      await loadServerPresence(state.selectedServerId);
      await loadFriends();
    }

    if (payload.type === 'friends-changed' || payload.type === 'friend-requests-changed') {
      if (payload.type === 'friend-requests-changed' && !payload.notification) {
        notifyUser('Friend Request Update', 'You have a new or updated friend request.');
      }
      await refreshUnreadState();
      await loadFriends();
    }

    if (payload.type === 'dm-message-created') {
      if (payload.fromUserId && payload.fromUserId !== state.currentUserId && !payload.notification) {
        const friend = state.friends.find((entry) => entry.id === payload.fromUserId);
        notifyUser('Direct Message', `${friend?.username || 'Someone'} sent you a DM.`);
      }
      if (state.selectedDmUser && (payload.fromUserId === state.selectedDmUser.id || payload.fromUserId === state.currentUserId)) {
        await loadDmMessages(state.selectedDmUser.id, state.selectedDmUser.username);
      } else {
        await refreshUnreadState();
      }
    }

    if (payload.type === 'dm-call-started' && payload.fromUserId && payload.fromUserId !== state.currentUserId) {
      const callerName = payload.fromUsername || 'Someone';
      if (!payload.notification) {
        notifyUser('Incoming Call', `${callerName} is calling you.`);
      }
      await refreshUnreadState();
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
    } else if (payload.type === 'message-created') {
      await refreshUnreadState();
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
    if (msg.user_id !== state.currentUserId && messageMentionsCurrentUser(msg.content)) {
      wrapper.classList.add('mentioned-me');
    }
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
  await markActiveChannelRead(channelId);
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
  await markActiveDmRead(partnerUserId);
  syncVoicePanelVisibility();
}

function orderedCategories() {
  return [...(state.channelCategories || [])].sort((a, b) => (Number(a.position) || 0) - (Number(b.position) || 0) || a.id - b.id);
}

function orderedChannels(categoryId = null) {
  const normalized = categoryId ? Number(categoryId) : null;
  return [...(state.channels || [])]
    .filter((channel) => (channel.category_id ? Number(channel.category_id) : null) === normalized)
    .sort((a, b) => (Number(a.position) || 0) - (Number(b.position) || 0) || a.id - b.id);
}

function normalizeChannelCategoryId(categoryId) {
  return categoryId ? Number(categoryId) : null;
}

async function saveChannelLayout() {
  if (!state.selectedServerId || !state.serverPermissions.manage_channels || isAdminGhostServer()) {
    return;
  }
  const categories = orderedCategories().map((category, position) => ({ id: category.id, position }));
  const channels = [];
  for (const categoryId of [null, ...categories.map((category) => category.id)]) {
    orderedChannels(categoryId).forEach((channel, position) => {
      channels.push({ id: channel.id, categoryId, position });
    });
  }
  const result = await window.api.chat.updateChannelLayout({ serverId: state.selectedServerId, categories, channels });
  if (!result.ok) {
    await showWarningDialog(result.message);
  }
}

function canDragChannelLayout() {
  return Boolean(state.serverPermissions.manage_channels) && !isAdminGhostServer();
}

function setDragPayload(event, payload) {
  state.channelDrag = payload;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('application/x-jellochat-channel-layout', JSON.stringify(payload));
}

function getDragPayload(event) {
  if (state.channelDrag) {
    return state.channelDrag;
  }
  try {
    const raw = event.dataTransfer.getData('application/x-jellochat-channel-layout');
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
}

function setCategoryPositions(categories) {
  state.channelCategories = categories.map((category, position) => ({ ...category, position }));
}

function setChannelBucketPositions(targetCategoryId, bucketChannels, updates) {
  bucketChannels.forEach((channel, position) => {
    updates.set(Number(channel.id), {
      category_id: normalizeChannelCategoryId(targetCategoryId),
      position
    });
  });
}

function applyChannelUpdates(updates) {
  state.channels = state.channels.map((channel) => {
    const next = updates.get(Number(channel.id));
    if (!next) {
      return channel;
    }
    return {
      ...channel,
      category_id: next.category_id,
      position: next.position
    };
  });
}

async function reorderCategory(categoryId, targetCategoryId, placement = 'before') {
  const sourceId = Number(categoryId);
  const targetId = Number(targetCategoryId);
  if (!sourceId || !targetId || sourceId === targetId) {
    return;
  }
  const categories = orderedCategories();
  const moving = categories.find((category) => Number(category.id) === sourceId);
  if (!moving) {
    return;
  }
  const withoutMoving = categories.filter((category) => Number(category.id) !== sourceId);
  const targetIndex = withoutMoving.findIndex((category) => Number(category.id) === targetId);
  if (targetIndex < 0) {
    return;
  }
  withoutMoving.splice(placement === 'after' ? targetIndex + 1 : targetIndex, 0, moving);
  setCategoryPositions(withoutMoving);
  renderChannels();
  await saveChannelLayout();
}

async function moveChannelToCategory(channelId, targetCategoryId, targetChannelId = null, placement = 'before') {
  const movingId = Number(channelId);
  const normalizedTargetCategoryId = normalizeChannelCategoryId(targetCategoryId);
  const movingChannel = state.channels.find((channel) => Number(channel.id) === movingId);
  if (!movingChannel) {
    return;
  }
  const updates = new Map();
  const sourceCategoryId = normalizeChannelCategoryId(movingChannel.category_id);
  const sourceChannels = orderedChannels(sourceCategoryId).filter((channel) => Number(channel.id) !== movingId);
  setChannelBucketPositions(sourceCategoryId, sourceChannels, updates);

  let targetChannels = orderedChannels(normalizedTargetCategoryId).filter((channel) => Number(channel.id) !== movingId);
  if (targetChannelId) {
    const targetId = Number(targetChannelId);
    const targetIndex = targetChannels.findIndex((channel) => Number(channel.id) === targetId);
    if (targetIndex < 0) {
      return;
    }
    targetChannels.splice(placement === 'after' ? targetIndex + 1 : targetIndex, 0, movingChannel);
  } else {
    targetChannels = [...targetChannels, movingChannel];
  }
  setChannelBucketPositions(normalizedTargetCategoryId, targetChannels, updates);
  applyChannelUpdates(updates);
  renderChannels();
  await saveChannelLayout();
}

function getDropPlacement(event, element) {
  const rect = element.getBoundingClientRect();
  return event.clientY > rect.top + rect.height / 2 ? 'after' : 'before';
}

function wireChannelDropTarget(element, { categoryId, channelId = null }) {
  if (!canDragChannelLayout()) {
    return;
  }
  element.addEventListener('dragover', (event) => {
    const payload = getDragPayload(event);
    if (!payload || payload.type !== 'channel') {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    element.classList.add('channel-drop-target');
  });
  element.addEventListener('dragleave', () => {
    element.classList.remove('channel-drop-target', 'channel-drop-after');
  });
  element.addEventListener('drop', async (event) => {
    const payload = getDragPayload(event);
    if (!payload || payload.type !== 'channel') {
      return;
    }
    event.preventDefault();
    element.classList.remove('channel-drop-target', 'channel-drop-after');
    const placement = channelId ? getDropPlacement(event, element) : 'after';
    await moveChannelToCategory(payload.id, categoryId, channelId, placement);
  });
  if (channelId) {
    element.addEventListener('dragover', (event) => {
      element.classList.toggle('channel-drop-after', getDropPlacement(event, element) === 'after');
    });
  }
}

function wireCategoryDropTarget(element, categoryId) {
  if (!canDragChannelLayout()) {
    return;
  }
  element.addEventListener('dragover', (event) => {
    const payload = getDragPayload(event);
    if (!payload) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    element.classList.add('channel-drop-target');
  });
  element.addEventListener('dragleave', () => {
    element.classList.remove('channel-drop-target', 'channel-drop-after');
  });
  element.addEventListener('drop', async (event) => {
    const payload = getDragPayload(event);
    if (!payload) {
      return;
    }
    event.preventDefault();
    element.classList.remove('channel-drop-target', 'channel-drop-after');
    if (payload.type === 'category') {
      await reorderCategory(payload.id, categoryId, getDropPlacement(event, element));
      return;
    }
    if (payload.type === 'channel') {
      await moveChannelToCategory(payload.id, categoryId);
    }
  });
  element.addEventListener('dragover', (event) => {
    const payload = getDragPayload(event);
    if (payload?.type === 'category') {
      element.classList.toggle('channel-drop-after', getDropPlacement(event, element) === 'after');
    }
  });
}

function renderChannelRow(channel, categoryId) {
  const channelType = String(channel.type || 'text').toLowerCase();
  const item = document.createElement('li');
  item.className = 'channel-list-item';
  const button = document.createElement('button');
  button.draggable = canDragChannelLayout();
  if (button.draggable) {
    button.classList.add('channel-draggable');
    button.addEventListener('dragstart', (event) => {
      setDragPayload(event, { type: 'channel', id: Number(channel.id) });
      state.channelDragSuppressClick = true;
      button.classList.add('channel-dragging');
    });
    button.addEventListener('dragend', () => {
      state.channelDrag = null;
      button.classList.remove('channel-dragging');
      ui.channelsList.querySelectorAll('.channel-drop-target, .channel-drop-after')
        .forEach((element) => element.classList.remove('channel-drop-target', 'channel-drop-after'));
      setTimeout(() => {
        state.channelDragSuppressClick = false;
      }, 0);
    });
    wireChannelDropTarget(button, { categoryId, channelId: channel.id });
  }
  const label = document.createElement('span');
  label.className = 'channel-list-label';
  label.textContent = channelType === 'voice' ? `VC ${channel.name}` : `# ${channel.name}`;
  button.appendChild(label);
  const unreadBadge = makeChannelUnreadIndicator(state.unread?.channels?.[Number(channel.id)]);
  if (unreadBadge) {
    button.appendChild(unreadBadge);
  }
  if (channel.id === state.selectedChannelId) {
    button.classList.add('active');
  }
  button.addEventListener('click', async () => {
    if (state.channelDrag || state.channelDragSuppressClick) {
      state.channelDragSuppressClick = false;
      return;
    }
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
  button.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    openChannelSettings('channel', channel.id);
  });
  item.appendChild(button);
  ui.channelsList.appendChild(item);
}

function renderChannels() {
  ui.channelsList.innerHTML = '';
  const rootChannels = orderedChannels(null);
  if (canDragChannelLayout()) {
    const rootDrop = document.createElement('li');
    rootDrop.className = 'channel-root-drop-zone';
    rootDrop.textContent = rootChannels.length ? 'Drop here to move to top level' : 'Drop channels here';
    wireChannelDropTarget(rootDrop, { categoryId: null });
    ui.channelsList.appendChild(rootDrop);
  }
  rootChannels.forEach((channel) => renderChannelRow(channel, null));
  const categories = orderedCategories();
  categories.forEach((category) => {
    const item = document.createElement('li');
    item.className = 'channel-category-item';
    const header = document.createElement('div');
    header.className = 'channel-category-header';
    header.draggable = canDragChannelLayout();
    if (header.draggable) {
      header.classList.add('channel-draggable');
      header.addEventListener('dragstart', (event) => {
        setDragPayload(event, { type: 'category', id: Number(category.id) });
        state.channelDragSuppressClick = true;
        header.classList.add('channel-dragging');
      });
      header.addEventListener('dragend', () => {
        state.channelDrag = null;
        header.classList.remove('channel-dragging');
        ui.channelsList.querySelectorAll('.channel-drop-target, .channel-drop-after')
          .forEach((element) => element.classList.remove('channel-drop-target', 'channel-drop-after'));
        setTimeout(() => {
          state.channelDragSuppressClick = false;
        }, 0);
      });
      wireCategoryDropTarget(header, category.id);
    }
    const label = document.createElement('span');
    label.textContent = category.name;
    header.appendChild(label);
    header.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      openChannelSettings('category', category.id);
    });
    item.appendChild(header);
    ui.channelsList.appendChild(item);
    const categoryChannels = orderedChannels(category.id);
    categoryChannels.forEach((channel) => renderChannelRow(channel, category.id));
  });
}

async function loadChannels(serverId, resetSelection = true) {
  if (state.mentionPicker.serverId !== serverId) {
    resetMentionCandidates();
    hideMentionSuggestions();
  }
  if (isAdminGhostServer(serverId)) {
    const previousSelected = state.selectedChannelId;
    state.channelCategories = state.adminViewedServer.categories || [];
    state.channels = (state.adminViewedServer.channels || []).map((channel) => ({
      ...channel,
      type: String(channel.type || 'text').toLowerCase()
    }));
    state.canCreateChannels = false;
    state.serverPermissions = emptyServerPermissions();
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
    state.serverPermissions = emptyServerPermissions();
    updateChannelCreateButton();
    return;
  }

  const previousSelected = state.selectedChannelId;
  state.channelCategories = response.categories || [];
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
    setServerIconContent(button, server);
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
    state.serverPermissions = emptyServerPermissions();
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
    const unreadBadge = makeUnreadBadge(state.unread?.dms?.[Number(friend.id)]);
    if (unreadBadge) {
      button.appendChild(unreadBadge);
    }
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
    const unreadCount = state.unread?.dms?.[Number(friend.id)] || 0;
    sub.textContent = friend.pending ? 'Incoming friend request' : unreadCount ? `${unreadCount} unread` : friend.online ? 'Online' : 'Offline';
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
    const unreadBadge = !friend.pending ? makeUnreadBadge(unreadCount) : null;
    if (unreadBadge) {
      row.appendChild(unreadBadge);
    }
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
    state.serverPermissions = emptyServerPermissions();
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
  openServerUrlModal();
});
ui.serverUrlCloseBtn?.addEventListener('click', closeServerUrlModal);
ui.serverUrlModal?.addEventListener('click', (event) => {
  if (event.target === ui.serverUrlModal) {
    closeServerUrlModal();
  }
});
ui.serverUrlForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const normalized = normalizeRemoteBase(ui.serverUrlInput?.value || '');
  if (!isAllowedServerBase(normalized)) {
    setServerUrlMessage('Use HTTPS, or HTTP only for localhost/private-network development URLs.', true);
    return;
  }
  setServerBase(normalized);
  setAuthMessage(`Server URL set to ${normalized}`);
  setServerUrlMessage('Saved.');
  renderServerUrlModal();
});
ui.serverUrlResetBtn?.addEventListener('click', () => {
  clearServerBase();
  setAuthMessage('Server URL reset.');
  setServerUrlMessage('Using default server.');
  renderServerUrlModal();
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

ui.messageInput?.addEventListener('input', () => {
  updateMentionSuggestions().catch(() => hideMentionSuggestions());
});

ui.messageInput?.addEventListener('click', () => {
  updateMentionSuggestions().catch(() => hideMentionSuggestions());
});

ui.messageInput?.addEventListener('blur', () => {
  setTimeout(() => {
    if (!ui.mentionSuggestions?.matches(':hover')) {
      hideMentionSuggestions();
    }
  }, 120);
});

ui.messageInput?.addEventListener('keydown', (event) => {
  if (!state.mentionPicker.open || !state.mentionPicker.items.length) {
    return;
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    state.mentionPicker.activeIndex = (state.mentionPicker.activeIndex + 1) % state.mentionPicker.items.length;
    renderMentionSuggestions();
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    state.mentionPicker.activeIndex = (state.mentionPicker.activeIndex - 1 + state.mentionPicker.items.length) % state.mentionPicker.items.length;
    renderMentionSuggestions();
  } else if (event.key === 'Enter' || event.key === 'Tab') {
    event.preventDefault();
    applyMentionSuggestion(state.mentionPicker.items[state.mentionPicker.activeIndex]);
  } else if (event.key === 'Escape') {
    event.preventDefault();
    hideMentionSuggestions();
  }
});

document.addEventListener('mousedown', (event) => {
  if (!ui.mentionSuggestions || ui.mentionSuggestions.classList.contains('hidden')) {
    return;
  }
  if (event.target === ui.messageInput || ui.mentionSuggestions.contains(event.target)) {
    return;
  }
  hideMentionSuggestions();
});

ui.serverTabGeneral.addEventListener('click', () => setServerOptionsTab('general'));
ui.serverTabRoles.addEventListener('click', async () => {
  setServerOptionsTab('roles');
  await loadRolesState();
});
ui.serverTabPermissions?.addEventListener('click', () => setServerOptionsTab('permissions'));
ui.serverTabBanned.addEventListener('click', async () => {
  setServerOptionsTab('banned');
  await loadBannedUsers();
});
ui.serverOptionsCloseBtn?.addEventListener('click', closeServerOptions);
ui.serverNameInput?.addEventListener('input', () => {
  const name = ui.serverNameInput.value.trim() || 'Server';
  if (ui.serverProfilePreviewName) {
    ui.serverProfilePreviewName.textContent = name;
  }
  setServerIconContent(ui.serverProfilePreviewIcon, { name, icon_url: ui.serverIconInput?.value || '' });
});
ui.serverIconInput?.addEventListener('input', () => {
  const name = ui.serverNameInput.value.trim() || 'Server';
  setServerIconContent(ui.serverProfilePreviewIcon, { name, icon_url: ui.serverIconInput.value.trim() });
});
ui.roleColorInput?.addEventListener('input', () => {
  const color = normalizeRoleColor(ui.roleColorInput.value);
  ui.roleColorInput.value = color;
  if (ui.roleColorValue) {
    ui.roleColorValue.textContent = color;
  }
});
ui.permissionTargetTypeSelect?.addEventListener('change', () => {
  if (!state.permissionOverrideState) {
    return;
  }
  state.permissionOverrideState.overrides = (state.permissionOverrideState?.overrides || []).filter((override) => override.id !== 'draft');
  state.selectedPermissionOverrideId = null;
  syncPermissionTargetOptions();
  renderPermissionOverrides();
});
ui.permissionTargetSelect?.addEventListener('change', () => {
  if (!state.permissionOverrideState) {
    return;
  }
  state.permissionOverrideState.overrides = (state.permissionOverrideState?.overrides || []).filter((override) => override.id !== 'draft');
  state.selectedPermissionOverrideId = null;
  renderPermissionOverrides();
});
ui.permissionScopeSelect?.addEventListener('change', () => {
  if (!state.permissionOverrideState) {
    return;
  }
  state.permissionOverrideState.overrides = (state.permissionOverrideState?.overrides || []).filter((override) => override.id !== 'draft');
  state.selectedPermissionOverrideId = null;
  renderPermissionOverrides();
});
ui.notificationsBtn?.addEventListener('click', openNotificationsModal);
ui.notificationsCloseBtn?.addEventListener('click', closeNotificationsModal);
ui.channelSettingsCloseBtn?.addEventListener('click', closeChannelSettings);
ui.channelSettingsModal?.addEventListener('click', (event) => {
  if (event.target === ui.channelSettingsModal) {
    closeChannelSettings();
  }
});
ui.channelSettingsSaveBtn?.addEventListener('click', saveChannelSettings);
ui.channelSettingsOverviewTab?.addEventListener('click', () => {
  setChannelSettingsTab('overview');
});
ui.channelSettingsPermissionsTab?.addEventListener('click', async () => {
  const scope = getChannelSettingsPermissionScope();
  if (!scope || !state.selectedServerId) {
    return;
  }
  setChannelSettingsTab('permissions');
  if (!state.channelSettingsPermissionState) {
    await loadChannelSettingsPermissions();
  } else {
    renderChannelSettingsPermissions();
  }
});
ui.channelSettingsDeleteTab?.addEventListener('click', deleteChannelSettingsTarget);
ui.channelSettingsPermissionTargetType?.addEventListener('change', () => {
  if (!state.channelSettingsPermissionState) {
    return;
  }
  state.channelSettingsPermissionState.overrides = (state.channelSettingsPermissionState.overrides || []).filter((override) => override.id !== 'channel-draft');
  state.selectedChannelSettingsOverrideId = null;
  syncChannelSettingsPermissionTargets();
  renderChannelSettingsPermissions();
});
ui.channelSettingsPermissionTarget?.addEventListener('change', () => {
  if (!state.channelSettingsPermissionState) {
    return;
  }
  state.channelSettingsPermissionState.overrides = (state.channelSettingsPermissionState.overrides || []).filter((override) => override.id !== 'channel-draft');
  state.selectedChannelSettingsOverrideId = null;
  renderChannelSettingsPermissions();
});
ui.channelSettingsPermissionSaveBtn?.addEventListener('click', saveChannelSettingsPermissionOverride);
ui.channelSettingsPermissionDeleteBtn?.addEventListener('click', deleteChannelSettingsPermissionOverride);
ui.channelSettingsPrivateToggle?.addEventListener('change', saveChannelSettingsPrivateToggle);
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
ui.notificationsSavePrefsBtn?.addEventListener('click', async () => {
  if (!window.api?.notifications?.savePreferences) {
    return;
  }
  const result = await window.api.notifications.savePreferences(getNotificationPreferencesFromInputs());
  if (!result?.ok) {
    await showWarningDialog(result?.message || 'Failed to save notification preferences.', 'Notifications');
    return;
  }
  state.notificationPreferences = result.preferences || state.notificationPreferences;
  syncNotificationPreferenceInputs();
  await showMessageDialog('Notifications', 'Notification preferences saved.');
});

ui.notificationsClearBtn?.addEventListener('click', async () => {
  if (window.api?.notifications?.markAllRead) {
    const result = await window.api.notifications.markAllRead();
    if (result?.ok) {
      state.notifications = state.notifications.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() }));
      applyUnreadSummary(result.unread);
      renderNotifications();
      return;
    }
  }
  state.notifications = [];
  state.unread.notifications = 0;
  renderUnreadBadges();
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

  const result = await window.api.chat.renameServer({ serverId, name, iconUrl: ui.serverIconInput?.value.trim() || '' });
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
  const result = await window.api.roles.create({
    serverId: state.serverOptionsServerId,
    name,
    color: ui.roleColorInput?.value || '#99aab5'
  });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }
  await loadRolesState();
  await refreshSelectedServerPresence();
});

ui.saveRoleBtn.addEventListener('click', async () => {
  if (!state.serverOptionsServerId || !state.selectedRoleId) {
    return;
  }
  const result = await window.api.roles.update({
    serverId: state.serverOptionsServerId,
    roleId: state.selectedRoleId,
    name: ui.roleNameInput.value.trim(),
    color: ui.roleColorInput?.value || '#99aab5',
    permissions: getRoleEditorPermissions()
  });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }
  await loadRolesState();
  await refreshSelectedServerPresence();
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
  await refreshSelectedServerPresence();
});

ui.savePermissionOverrideBtn?.addEventListener('click', async () => {
  if (!state.serverOptionsServerId || !state.permissionOverrideState) {
    return;
  }
  const selected = state.permissionOverrideState.overrides.find((override) => override.id === state.selectedPermissionOverrideId);
  if (!selected) {
    return;
  }
  const scope = getCurrentPermissionScope();
  const targetType = ui.permissionTargetTypeSelect?.value || 'role';
  const targetId = Number(ui.permissionTargetSelect?.value);
  const result = await window.api.permissions.saveOverride({
    serverId: state.serverOptionsServerId,
    scopeType: scope.scopeType,
    scopeId: scope.scopeId,
    targetType,
    targetId,
    allow: selected.allow || {},
    deny: selected.deny || {}
  });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }
  await loadPermissionOverridesState();
  await loadChannels(state.serverOptionsServerId);
});

ui.deletePermissionOverrideBtn?.addEventListener('click', async () => {
  if (!state.serverOptionsServerId || !state.selectedPermissionOverrideId || state.selectedPermissionOverrideId === 'draft') {
    return;
  }
  const confirmed = await showConfirmDialog('Delete Override', 'Delete this channel permission override?', 'Delete', 'Cancel');
  if (!confirmed) {
    return;
  }
  const result = await window.api.permissions.deleteOverride({
    serverId: state.serverOptionsServerId,
    overrideId: state.selectedPermissionOverrideId
  });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }
  await loadPermissionOverridesState();
  await loadChannels(state.serverOptionsServerId);
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

ui.adminStorageBackfillBtn?.addEventListener('click', runAdminAttachmentCompressionBackfill);

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
  const migrate = await showConfirmDialog(
    'New Server',
    'Create a blank JelloChat server or migrate a Discord server skeleton?',
    'Migrate',
    'Blank'
  );
  if (migrate) {
    const result = await window.api.chat.startDiscordMigration();
    if (!result.ok) {
      await showWarningDialog(result.message);
      return;
    }
    const code = result.session?.code || '';
    await showDiscordMigrationDialog({ inviteUrl: result.inviteUrl || '', code });
    return;
  }

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

ui.createCategoryBtn?.addEventListener('click', async () => {
  if (!state.selectedServerId) {
    await showWarningDialog('Select a server first.');
    return;
  }
  if (!state.serverPermissions.manage_channels) {
    await showWarningDialog('You do not have permission to create categories.');
    return;
  }
  const name = await showPromptDialog('Create Category', 'Category name:');
  if (!name) {
    return;
  }
  const result = await window.api.chat.createCategory({ serverId: state.selectedServerId, name });
  if (!result.ok) {
    await showWarningDialog(result.message);
    return;
  }
  await loadChannels(state.selectedServerId, false);
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
    const base = isLocalAppShell() ? getConfiguredServerBase() : '';
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

function isLoopbackHost(hostname) {
  return ['localhost', '127.0.0.1', '::1', '[::1]'].includes(String(hostname || '').toLowerCase());
}

function isLocalAppShell() {
  if (typeof location === 'undefined') {
    return false;
  }
  const protocol = String(location.protocol || '');
  const isNative = Boolean(window.Capacitor?.isNativePlatform?.());
  const isCapacitorLocalhost = protocol === 'https:' && isLoopbackHost(location.hostname);
  return isNative || protocol === 'file:' || isCapacitorLocalhost;
}

function normalizeRemoteBase(value) {
  const raw = String(value || '').trim().replace(/\/+$/, '');
  if (!raw) {
    return '';
  }
  try {
    const url = new URL(raw);
    if (!isAllowedServerBase(url.origin)) {
      return '';
    }
    return url.origin;
  } catch (_error) {
    return '';
  }
}

function isPrivateNetworkHost(hostname) {
  const host = String(hostname || '').toLowerCase();
  if (['localhost', '127.0.0.1', '::1', '[::1]'].includes(host)) {
    return true;
  }
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
    return true;
  }
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(host)) {
    return true;
  }
  const match = host.match(/^172\.(\d{1,2})\.\d{1,3}\.\d{1,3}$/);
  if (match) {
    const second = Number(match[1]);
    return second >= 16 && second <= 31;
  }
  return false;
}

function isAllowedServerBase(value) {
  if (!value) {
    return false;
  }
  try {
    const parsed = new URL(value);
    if (parsed.protocol === 'https:') {
      return true;
    }
    return parsed.protocol === 'http:' && isPrivateNetworkHost(parsed.hostname);
  } catch (_error) {
    return false;
  }
}

function getSavedServerBases() {
  let parsed = [];
  try {
    parsed = JSON.parse(localStorage?.getItem(API_BASES_KEY) || '[]');
  } catch (_error) {
    parsed = [];
  }
  const saved = [];
  for (const value of Array.isArray(parsed) ? parsed : []) {
    const normalized = normalizeRemoteBase(value);
    if (isAllowedServerBase(normalized) && !saved.includes(normalized)) {
      saved.push(normalized);
    }
  }
  const current = normalizeRemoteBase(localStorage?.getItem(API_BASE_KEY));
  if (isAllowedServerBase(current) && !saved.includes(current)) {
    saved.unshift(current);
  }
  return saved.slice(0, 8);
}

function saveServerBaseOption(value) {
  const normalized = normalizeRemoteBase(value);
  if (!isAllowedServerBase(normalized)) {
    return;
  }
  const saved = [normalized, ...getSavedServerBases().filter((url) => url !== normalized)].slice(0, 8);
  localStorage?.setItem(API_BASES_KEY, JSON.stringify(saved));
}

function removeSavedServerBase(value) {
  const normalized = normalizeRemoteBase(value);
  const saved = getSavedServerBases().filter((url) => url !== normalized);
  localStorage?.setItem(API_BASES_KEY, JSON.stringify(saved));
}

function setServerBase(normalized) {
  if (window.api?.config?.setServerBase) {
    window.api.config.setServerBase(normalized);
  } else {
    localStorage.setItem(API_BASE_KEY, normalized);
    localStorage.removeItem('jellochat_token');
  }
  saveServerBaseOption(normalized);
}

function clearServerBase() {
  if (window.api?.config?.clearServerBase) {
    window.api.config.clearServerBase();
  } else {
    localStorage.removeItem(API_BASE_KEY);
    localStorage.removeItem('jellochat_token');
  }
}

function setServerUrlMessage(message, isError = false) {
  if (!ui.serverUrlMessage) {
    return;
  }
  ui.serverUrlMessage.textContent = message || '';
  ui.serverUrlMessage.classList.toggle('error', Boolean(isError));
}

function renderServerUrlModal() {
  if (!ui.serverUrlModal) {
    return;
  }
  const current = getConfiguredServerBase();
  if (ui.serverUrlCurrent) {
    ui.serverUrlCurrent.textContent = current;
  }
  if (ui.serverUrlInput) {
    ui.serverUrlInput.value = current;
  }
  if (!ui.serverUrlList) {
    return;
  }
  ui.serverUrlList.innerHTML = '';
  const savedBases = getSavedServerBases();
  if (!savedBases.length) {
    const empty = document.createElement('p');
    empty.className = 'message';
    empty.textContent = 'No saved servers yet.';
    ui.serverUrlList.appendChild(empty);
    return;
  }
  for (const url of savedBases) {
    const row = document.createElement('div');
    row.className = 'server-url-row';
    row.tabIndex = 0;
    row.setAttribute('role', 'button');
    row.setAttribute('aria-label', `Fill server URL ${url}`);
    row.classList.toggle('is-active', url === current);
    const fillInput = () => {
      if (ui.serverUrlInput) {
        ui.serverUrlInput.value = url;
        ui.serverUrlInput.focus();
        ui.serverUrlInput.select();
      }
      setServerUrlMessage('URL filled. Press Save to switch to it.');
    };
    row.addEventListener('click', fillInput);
    row.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        fillInput();
      }
    });
    const label = document.createElement('strong');
    label.textContent = url;
    const useBtn = document.createElement('button');
    useBtn.type = 'button';
    useBtn.className = 'server-url-use-btn';
    useBtn.textContent = url === current ? 'Active' : 'Use';
    useBtn.disabled = url === current;
    useBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      setServerBase(url);
      setAuthMessage(`Server URL set to ${url}`);
      setServerUrlMessage('Saved.');
      renderServerUrlModal();
    });
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      removeSavedServerBase(url);
      setServerUrlMessage('Removed saved server.');
      renderServerUrlModal();
    });
    row.append(label, useBtn, removeBtn);
    ui.serverUrlList.appendChild(row);
  }
}

function openServerUrlModal() {
  setServerUrlMessage('');
  renderServerUrlModal();
  animateShowOverlay(ui.serverUrlModal);
  setTimeout(() => ui.serverUrlInput?.focus(), 0);
}

function closeServerUrlModal() {
  animateHideOverlay(ui.serverUrlModal);
}

function getConfiguredServerBase() {
  if (window.api?.config?.getServerBase) {
    const configured = window.api.config.getServerBase();
    if (configured) {
      return configured;
    }
    if (!isLocalAppShell() && typeof location !== 'undefined') {
      return location.origin;
    }
    return window.api.config.defaultServerBase || DEFAULT_SERVER_BASE;
  }
  const stored = normalizeRemoteBase(localStorage?.getItem(API_BASE_KEY));
  if (stored) {
    return stored;
  }
  localStorage?.removeItem(API_BASE_KEY);
  if (!isLocalAppShell() && typeof location !== 'undefined') {
    return location.origin;
  }
  return DEFAULT_SERVER_BASE;
}

function getPublicPageUrl(pathname) {
  if (!isLocalAppShell()) {
    return pathname;
  }
  const base = getConfiguredServerBase();
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
    hideMentionSuggestions();
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
  hideMentionSuggestions();
  clearSelectedAttachment();
});

ui.logoutBtn.addEventListener('click', async () => {
  await performLogout(true);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 700) {
    closeMobileDrawers();
  }
  closeUserOptions();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !ui.channelSettingsModal?.classList.contains('hidden')) {
    closeChannelSettings();
    return;
  }
  if (event.key === 'Escape' && !ui.serverOptionsMenu.classList.contains('hidden')) {
    closeServerOptions();
  }
});

updateChannelCreateButton();
updateMobileDrawers();
installMobileSwipeDrawers();
closeServerOptions();
closeUserOptions();
closeChannelSettings();
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
  const isAppWebView = userAgent.includes('jellodogchatandroidapp') || userAgent.includes('jellochatandroidapp');
  const canPromptHere = ['http:', 'https:'].includes(window.location.protocol);
  if (!isAndroid || isAppWebView || isLocalAppShell() || !canPromptHere) {
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
    window.location.href = getPublicPageUrl('/download/android');
  });

  window.setTimeout(() => {
    prompt.classList.remove('hidden');
  }, 700);
}

setupAndroidAppPrompt();

if ('serviceWorker' in navigator && window.location.protocol === 'https:' && !isLocalAppShell()) {
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
