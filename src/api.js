/* global window, localStorage, location */
(function bootstrapApi() {
  if (window.api) {
    return;
  }

  const TOKEN_KEY = 'jellochat_token';
  const API_BASE_KEY = 'jellochat_api_base';

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

  function apiBase() {
    if (location.protocol !== 'file:') {
      return '';
    }
    // Android emulator default bridge to host machine.
    const fromStorage = localStorage.getItem(API_BASE_KEY);
    return fromStorage || 'http://10.0.2.2:3000';
  }

  async function request(method, path, body) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${apiBase()}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    const payload = await response.json();
    if ((path === '/api/auth/login' || path === '/api/auth/register') && payload?.ok && payload?.realtimeToken) {
      setToken(payload.realtimeToken);
    }

    if (path === '/api/auth/logout' && payload?.ok) {
      clearToken();
    }

    return payload;
  }

  function wsBaseUrl() {
    if (location.protocol === 'file:') {
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
    auth: {
      register: (payload) => request('POST', '/api/auth/register', payload),
      login: (payload) => request('POST', '/api/auth/login', payload),
      logout: () => request('POST', '/api/auth/logout')
    },
    chat: {
      getServers: () => request('GET', '/api/chat/servers'),
      createServer: (payload) => request('POST', '/api/chat/servers', payload),
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
      createChannel: (payload) => request('POST', '/api/chat/channels', payload),
      getMessages: (channelId) => request('GET', `/api/chat/channels/${channelId}/messages`),
      sendMessage: (payload) => request('POST', '/api/chat/messages', payload),
      updateMessage: (payload) => request('PATCH', `/api/chat/messages/${payload.messageId}`, payload),
      deleteMessage: (payload) => request('DELETE', `/api/chat/messages/${payload.messageId}`)
    },
    dm: {
      getMessages: (payload) => request('GET', `/api/dm/${payload.partnerUserId}/messages`),
      sendMessage: (payload) => request('POST', `/api/dm/${payload.partnerUserId}/messages`, payload)
    },
    vc: {
      getToken: (payload) => request('POST', '/api/vc/token', payload),
      getParticipants: (payload) => request('POST', '/api/vc/participants', payload)
    },
    friends: {
      list: () => request('GET', '/api/friends'),
      getRequests: () => request('GET', '/api/friends/requests'),
      sendRequest: (payload) => request('POST', '/api/friends/requests', payload),
      respondRequest: (payload) => request('POST', `/api/friends/requests/${payload.requestId}/respond`, payload)
    }
  };
})();
