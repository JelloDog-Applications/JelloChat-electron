/* global window, localStorage, location */
(function bootstrapApi() {
  if (window.api) {
    return;
  }

  const TOKEN_KEY = 'jellochat_token';
  const REMEMBER_KEY = 'jellochat_remember';
  const API_BASE_KEY = 'jellochat_api_base';
  const DEFAULT_API_BASE = 'https://chat.jellodog.com';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  function shouldRemember() {
    const raw = localStorage.getItem(REMEMBER_KEY);
    if (raw === null) {
      return true;
    }
    return raw === '1';
  }

  function setRemember(remember) {
    localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0');
    if (!remember) {
      clearToken();
    }
  }

  function isLoopbackHost(hostname) {
    return ['localhost', '127.0.0.1', '::1', '[::1]'].includes(String(hostname || '').toLowerCase());
  }

  function isPrivateNetworkHost(hostname) {
    const host = String(hostname || '').toLowerCase();
    if (isLoopbackHost(host)) {
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

  function isAllowedApiBase(url) {
    if (url.protocol === 'https:') {
      return true;
    }
    return url.protocol === 'http:' && isPrivateNetworkHost(url.hostname);
  }

  function isAppShell() {
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
      if (!isAllowedApiBase(url)) {
        return '';
      }
      return url.origin;
    } catch (_error) {
      return '';
    }
  }

  function getConfiguredApiBase() {
    const fromStorage = normalizeRemoteBase(localStorage.getItem(API_BASE_KEY));
    if (fromStorage) {
      return fromStorage;
    }
    localStorage.removeItem(API_BASE_KEY);
    return '';
  }

  function apiBase() {
    const configuredBase = getConfiguredApiBase();
    if (configuredBase) {
      return configuredBase;
    }
    if (!isAppShell()) {
      return '';
    }
    return DEFAULT_API_BASE;
  }

  function setApiBase(value) {
    const normalized = normalizeRemoteBase(value);
    if (!normalized) {
      return '';
    }
    const previous = apiBase();
    localStorage.setItem(API_BASE_KEY, normalized);
    if (previous !== normalized) {
      clearToken();
    }
    return normalized;
  }

  function clearApiBase() {
    const previous = apiBase();
    localStorage.removeItem(API_BASE_KEY);
    if (previous !== apiBase()) {
      clearToken();
    }
  }

  async function request(method, path, body) {
    const token = getToken();
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${apiBase()}${path}`, {
      method,
      headers,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined
    });

    const payload = await response.json();
    if ((path === '/api/auth/login' || path === '/api/auth/register' || path === '/api/auth/passkeys/login/verify') && payload?.ok && payload?.realtimeToken) {
      if (shouldRemember()) {
        setToken(payload.realtimeToken);
      }
    }

    if (path === '/api/auth/session' && payload?.ok && payload?.realtimeToken) {
      setToken(payload.realtimeToken);
    }

    if (path === '/api/auth/logout' && payload?.ok) {
      clearToken();
    }

      return payload;
  }

  function attachmentUrl(path) {
    return `${apiBase()}${path}`;
  }

  async function getAttachmentObjectUrl(path) {
    const token = getToken();
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(attachmentUrl(path), { headers });
    if (!response.ok) {
      throw new Error('Failed to load attachment.');
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  function wsBaseUrl() {
    if (isAppShell()) {
      const httpBase = apiBase();
      const wsBase = httpBase.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
      return `${wsBase}/ws`;
    }
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${location.host}/ws`;
  }

  window.api = {
    realtime: {
      getConfig: async () => ({ ok: true, wsUrl: wsBaseUrl() })
    },
    config: {
      getServerBase: apiBase,
      setServerBase: setApiBase,
      clearServerBase: clearApiBase,
      defaultServerBase: DEFAULT_API_BASE
    },
    auth: {
      register: (payload) => request('POST', '/api/auth/register', payload),
      login: (payload) => request('POST', '/api/auth/login', payload),
      getSession: () => request('GET', '/api/auth/session'),
      getPasskeys: () => request('GET', '/api/auth/passkeys'),
      beginPasskeyRegistration: () => request('POST', '/api/auth/passkeys/register/options'),
      finishPasskeyRegistration: (payload) => request('POST', '/api/auth/passkeys/register/verify', payload),
      beginPasskeyLogin: () => request('POST', '/api/auth/passkeys/login/options'),
      finishPasskeyLogin: (payload) => request('POST', '/api/auth/passkeys/login/verify', payload),
      deletePasskey: (payload) => request('DELETE', `/api/auth/passkeys/${payload.passkeyId}`),
      setRemember,
      getRemember: shouldRemember,
      logout: () => request('POST', '/api/auth/logout'),
      resendVerification: (payload) => request('POST', '/api/auth/resend-verification', payload),
      verifyEmail: (payload) => request('POST', '/api/auth/verify-email', payload),
      requestPasswordReset: (payload) => request('POST', '/api/auth/password-reset/request', payload),
      confirmPasswordReset: (payload) => request('POST', '/api/auth/password-reset/confirm', payload),
      updateAccount: (payload) => request('POST', '/api/auth/account', payload),
      deleteAccount: (payload) => request('POST', '/api/auth/account/delete', payload)
    },
    chat: {
      getServers: () => request('GET', '/api/chat/servers'),
      createServer: (payload) => request('POST', '/api/chat/servers', payload),
      startDiscordMigration: () => request('POST', '/api/chat/servers/discord-migration'),
      getDiscordMigrationStatus: (code) => request('GET', `/api/chat/servers/discord-migration/${encodeURIComponent(code)}`),
      leaveServer: (payload) => request('POST', `/api/chat/servers/${payload.serverId}/leave`),
      kickMember: (payload) => request('POST', `/api/chat/servers/${payload.serverId}/kick`, payload),
      banMember: (payload) => request('POST', `/api/chat/servers/${payload.serverId}/ban`, payload),
      unbanMember: (payload) => request('POST', `/api/chat/servers/${payload.serverId}/unban`, payload),
      getBannedUsers: (payload) => request('GET', `/api/chat/servers/${payload.serverId}/bans`),
      renameServer: (payload) => request('POST', `/api/chat/servers/${payload.serverId}/rename`, payload),
      createInvite: (payload) => request('POST', `/api/chat/servers/${payload.serverId}/invites`),
      joinByInvite: (payload) => request('POST', '/api/chat/invites/join', payload),
      getServerPresence: (serverId) => request('GET', `/api/chat/servers/${serverId}/presence`),
      getChannels: (serverId) => request('GET', `/api/chat/servers/${serverId}/channels`),
      createCategory: (payload) => request('POST', '/api/chat/categories', payload),
      createChannel: (payload) => request('POST', '/api/chat/channels', payload),
      updateCategory: (payload) => request('POST', `/api/chat/categories/${payload.categoryId}`, payload),
      deleteCategory: (payload) => request('DELETE', `/api/chat/categories/${payload.categoryId}`),
      updateChannel: (payload) => request('POST', `/api/chat/channels/${payload.channelId}`, payload),
      deleteChannel: (payload) => request('DELETE', `/api/chat/channels/${payload.channelId}`),
      updateChannelLayout: (payload) => request('POST', `/api/chat/servers/${payload.serverId}/channel-layout`, payload),
      getMessages: (channelId) => request('GET', `/api/chat/channels/${channelId}/messages`),
      sendMessage: (payload) => request('POST', '/api/chat/messages', payload),
      updateMessage: (payload) => request('PATCH', `/api/chat/messages/${payload.messageId}`, payload),
      deleteMessage: (payload) => request('DELETE', `/api/chat/messages/${payload.messageId}`)
    },
    dm: {
      getMessages: (payload) => request('GET', `/api/dm/${payload.partnerUserId}/messages`),
      sendMessage: (payload) => request('POST', `/api/dm/${payload.partnerUserId}/messages`, payload),
      startCall: (payload) => request('POST', `/api/dm/${payload.partnerUserId}/call/start`, payload),
      joinCall: (payload) => request('POST', `/api/dm/${payload.partnerUserId}/call/join`, payload)
    },
    vc: {
      getToken: (payload) => request('POST', '/api/vc/token', payload),
      getParticipants: (payload) => request('POST', '/api/vc/participants', payload)
    },
    notifications: {
      list: () => request('GET', '/api/notifications'),
      markRead: (payload) => request('PATCH', `/api/notifications/${payload.notificationId}/read`),
      markAllRead: () => request('POST', '/api/notifications/read-all'),
      getUnread: () => request('GET', '/api/unreads'),
      markChannelRead: (payload) => request('POST', `/api/unreads/channels/${payload.channelId}/read`),
      markDmRead: (payload) => request('POST', `/api/unreads/dms/${payload.partnerUserId}/read`),
      savePreferences: (payload) => request('POST', '/api/notifications/preferences', payload),
      registerPushToken: (payload) => request('POST', '/api/notifications/push-tokens', payload)
    },
    roles: {
      getState: (payload) => request('GET', `/api/chat/servers/${payload.serverId}/roles`),
      create: (payload) => request('POST', `/api/chat/servers/${payload.serverId}/roles`, payload),
      update: (payload) => request('POST', `/api/chat/servers/${payload.serverId}/roles/${payload.roleId}`, payload),
      delete: (payload) => request('DELETE', `/api/chat/servers/${payload.serverId}/roles/${payload.roleId}`),
      setMemberRole: (payload) => request('POST', `/api/chat/servers/${payload.serverId}/roles/${payload.roleId}/members`, payload)
    },
    permissions: {
      getOverrides: (payload) => request('GET', `/api/chat/servers/${payload.serverId}/permission-overrides`),
      saveOverride: (payload) => request('POST', `/api/chat/servers/${payload.serverId}/permission-overrides`, payload),
      deleteOverride: (payload) => request('DELETE', `/api/chat/servers/${payload.serverId}/permission-overrides/${payload.overrideId}`)
    },
    admin: {
      listUsers: (payload) => request('POST', '/api/admin/users/search', payload),
      listReports: (payload = {}) => request('GET', `/api/admin/reports?status=${encodeURIComponent(payload.status || 'open')}`),
      updateReport: (payload) => request('POST', `/api/admin/reports/${payload.reportId}`, payload),
      getStorageConfig: () => request('GET', '/api/admin/storage'),
      updateCleanupSettings: (payload) => request('POST', '/api/admin/storage/cleanup', payload),
      runAttachmentCompressionBackfill: (payload = {}) => request('POST', '/api/admin/storage/compression-backfill', payload),
      listBanAppeals: (payload = {}) => request('GET', `/api/admin/ban-appeals?status=${encodeURIComponent(payload.status || 'open')}`),
      updateBanAppeal: (payload) => request('POST', `/api/admin/ban-appeals/${payload.appealId}`, payload),
      listServers: (payload = {}) => request('GET', `/api/admin/servers?query=${encodeURIComponent(payload.query || '')}`),
      getUserDetails: (payload) => request('GET', `/api/admin/users/${payload.userId}`),
      getServerView: (payload) => request('GET', `/api/admin/servers/${payload.serverId}`),
      updateUser: (payload) => request('POST', `/api/admin/users/${payload.userId}`, payload),
      deleteUser: (payload) => request('DELETE', `/api/admin/users/${payload.userId}`),
      deleteServer: (payload) => request('DELETE', `/api/admin/servers/${payload.serverId}`)
    },
    reports: {
      createUserReport: (payload) => request('POST', '/api/reports/users', payload)
    },
    appeals: {
      submitBanAppeal: (payload) => request('POST', '/api/appeals/ban', payload)
    },
    friends: {
      list: () => request('GET', '/api/friends'),
      getRequests: () => request('GET', '/api/friends/requests'),
      sendRequest: (payload) => request('POST', '/api/friends/requests', payload),
      respondRequest: (payload) => request('POST', `/api/friends/requests/${payload.requestId}/respond`, payload)
    },
    legal: {
      getPrivacyPolicy: () => request('GET', '/api/legal/privacy-policy'),
      getTermsOfService: () => request('GET', '/api/legal/terms-of-service')
    },
    attachments: {
      uploadMode: 'form',
      url: attachmentUrl,
      objectUrl: getAttachmentObjectUrl
    }
  };
})();
