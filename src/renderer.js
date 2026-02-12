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
  registerUsername: document.getElementById('register-username'),
  registerEmail: document.getElementById('register-email'),
  registerPassword: document.getElementById('register-password'),
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
  vcFrame: document.getElementById('vc-frame'),
  vcCloseBtn: document.getElementById('vc-close-btn'),
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
  joinInviteBtn: document.getElementById('join-invite-btn'),
  createInviteBtn: document.getElementById('create-invite-btn'),
  createChannelBtn: document.getElementById('create-channel-btn')
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
  activeVoiceChannelId: null
};

function getSelectedChannel() {
  return state.channels.find((channel) => channel.id === state.selectedChannelId) || null;
}

function pickDefaultChannelId(channels) {
  if (!channels.length) {
    return null;
  }
  const textChannel = channels.find((channel) => channel.type !== 'voice');
  return (textChannel || channels[0]).id;
}

function leaveVoiceView() {
  state.activeVoiceChannelId = null;
  if (ui.vcFrame.src && ui.vcFrame.src !== 'about:blank') {
    ui.vcFrame.src = 'about:blank';
  }
  ui.vcPanel.classList.add('hidden');
  ui.messagesList.classList.remove('hidden');
  ui.messageForm.classList.remove('hidden');
}

function openVoiceView(roomLabel, joinUrl, channelId) {
  state.activeVoiceChannelId = channelId;
  ui.vcRoomTitle.textContent = roomLabel;
  ui.vcFrame.src = joinUrl;
  ui.vcPanel.classList.remove('hidden');
  ui.messagesList.classList.add('hidden');
  ui.messageForm.classList.add('hidden');
}

function setAuthMessage(message, isError = false) {
  ui.authMessage.textContent = message;
  ui.authMessage.style.color = isError ? 'var(--danger)' : 'var(--muted)';
}

function showLogin() {
  ui.loginForm.classList.remove('auth-hidden');
  ui.registerForm.classList.add('auth-hidden');
  ui.showLoginBtn.classList.add('tab-active');
  ui.showRegisterBtn.classList.remove('tab-active');
}

function showRegister() {
  ui.registerForm.classList.remove('auth-hidden');
  ui.loginForm.classList.add('auth-hidden');
  ui.showRegisterBtn.classList.add('tab-active');
  ui.showLoginBtn.classList.remove('tab-active');
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
  showLogin();
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
    meta.innerHTML = `<div>${user.username}</div><div class=\"banned-user-meta\">${user.email || ''}</div>`;

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

  const selected = getSelectedChannel();
  if (!selected || selected.type === 'voice') {
    return;
  }

  if (state.subscribedChannelId && state.subscribedChannelId !== state.selectedChannelId) {
    sendRealtime({ type: 'unsubscribe', channelId: state.subscribedChannelId });
  }

  state.subscribedChannelId = state.selectedChannelId;
  sendRealtime({ type: 'subscribe', channelId: state.selectedChannelId });
}

function buildVoiceJoinUrl(livekitUrl, token) {
  return `https://meet.livekit.io/custom?liveKitUrl=${encodeURIComponent(livekitUrl)}&token=${encodeURIComponent(token)}`;
}

async function joinVoiceChannel(channel) {
  if (!state.selectedServerId) {
    ui.channelTitle.textContent = 'Select a server first.';
    return;
  }

  const result = await window.api.vc.getToken({
    serverId: state.selectedServerId,
    channelId: channel.id
  });
  if (!result.ok) {
    ui.channelTitle.textContent = result.message;
    return;
  }

  const joinUrl = buildVoiceJoinUrl(result.livekitUrl, result.token);
  ui.channelTitle.textContent = `VC: ${channel.name}`;
  openVoiceView(`Voice Channel: ${channel.name}`, joinUrl, channel.id);
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
    title.textContent = `${msg.username} • ${formatTime(msg.created_at)}`;
    meta.appendChild(title);

    if (msg.user_id === state.currentUserId) {
      const actions = document.createElement('div');
      actions.className = 'msg-actions';

      const editButton = document.createElement('button');
      editButton.className = 'msg-action-btn';
      editButton.type = 'button';
      editButton.textContent = 'Edit';
      editButton.addEventListener('click', async () => {
        const updated = window.prompt('Edit message', msg.content);
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
        const confirmed = window.confirm('Delete this message?');
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
  leaveVoiceView();
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
  leaveVoiceView();
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
}

function renderChannels() {
  ui.channelsList.innerHTML = '';
  for (const channel of state.channels) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    const label = channel.type === 'voice' ? `VC ${channel.name}` : `# ${channel.name}`;
    button.textContent = label;
    if (channel.id === state.selectedChannelId) {
      button.classList.add('active');
    }

    button.addEventListener('click', async () => {
      state.selectedChannelId = channel.id;
      state.selectedDmUser = null;
      renderChannels();
      if (channel.type === 'voice') {
        state.subscribedChannelId = null;
        ui.messagesList.innerHTML = '';
        await joinVoiceChannel(channel);
      } else {
        ui.channelTitle.textContent = `# ${channel.name}`;
        await loadMessages(channel.id);
      }
      if (window.innerWidth <= 700) {
        closeMobileDrawers();
      }
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
  state.channels = response.channels;
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
      ui.messagesList.innerHTML = '';
      state.subscribedChannelId = null;
      if (state.activeVoiceChannelId !== selected.id) {
        leaveVoiceView();
      }
    } else {
      await loadMessages(state.selectedChannelId);
      ui.channelTitle.textContent = selected ? `# ${selected.name}` : 'Select a channel';
    }
  } else {
    leaveVoiceView();
    ui.channelTitle.textContent = 'No channels available';
    ui.messagesList.innerHTML = '';
    state.subscribedChannelId = null;
  }
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
});

ui.leaveServerBtn.addEventListener('click', async () => {
  const serverId = state.serverOptionsServerId;
  if (!serverId) {
    return;
  }

  const confirmed = window.confirm('Leave this server?');
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

  const confirmed = window.confirm('Kick this user from the server?');
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

  const reason = window.prompt('Ban reason (optional):', '') || '';
  const confirmed = window.confirm('Ban this user from the server?');
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

ui.vcCloseBtn.addEventListener('click', () => {
  leaveVoiceView();
  const selected = getSelectedChannel();
  if (selected?.type === 'voice') {
    ui.channelTitle.textContent = `VC: ${selected.name} (left)`;
  }
});

ui.createServerBtn.addEventListener('click', async () => {
  const name = window.prompt('Server name');
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
  const target = window.prompt('Enter username or email to add as friend');
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

  const requests = response.requests || [];
  if (requests.length === 0) {
    window.alert('No pending friend requests.');
    return;
  }

  const listText = requests.map((r) => `${r.id}: ${r.username}`).join('\n');
  const rawId = window.prompt(`Pending requests:\n${listText}\n\nEnter request id to respond:`);
  if (!rawId) {
    return;
  }

  const requestId = Number(rawId);
  if (!requestId) {
    ui.channelTitle.textContent = 'Invalid request id.';
    return;
  }

  const actionRaw = window.prompt('Type "accept" or "reject":', 'accept');
  if (!actionRaw) {
    return;
  }

  const action = actionRaw.toLowerCase();
  const result = await window.api.friends.respondRequest({ requestId, action });
  if (!result.ok) {
    ui.channelTitle.textContent = result.message;
    return;
  }

  await loadFriends();
  ui.channelTitle.textContent = `Friend request ${action}ed.`;
});

ui.joinInviteBtn.addEventListener('click', async () => {
  const codeInput = window.prompt('Enter invite code');
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
  window.alert(`Invite code: ${code}${code ? '\n(Copied to clipboard when possible.)' : ''}`);
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

  const name = window.prompt('Channel name (without #)');
  if (!name) {
    return;
  }

  const kindRaw = window.prompt('Channel type: "text" or "voice"', 'text');
  if (!kindRaw) {
    return;
  }
  const type = kindRaw.trim().toLowerCase();
  if (!['text', 'voice'].includes(type)) {
    ui.channelTitle.textContent = 'Channel type must be "text" or "voice".';
    return;
  }

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

  const result = await window.api.auth.login({
    email: ui.loginEmail.value,
    password: ui.loginPassword.value
  });

  if (!result.ok) {
    setAuthMessage(result.message, true);
    return;
  }

  state.user = result.user;
  setAuthMessage('');
  await openChat();
  await loadServers();
  await loadFriends();
  if (result.realtimeToken) {
    await ensureRealtime(result.realtimeToken);
  }
});

ui.registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const result = await window.api.auth.register({
    username: ui.registerUsername.value,
    email: ui.registerEmail.value,
    password: ui.registerPassword.value
  });

  if (!result.ok) {
    setAuthMessage(result.message, true);
    return;
  }

  state.user = result.user;
  setAuthMessage('');
  await openChat();
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

  const selected = getSelectedChannel();
  if (selected?.type === 'voice') {
    ui.channelTitle.textContent = 'Use VC channels for calls. Text chat is disabled in voice channels.';
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
  leaveVoiceView();
  await window.api.auth.logout();
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
  openAuth();
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
showLogin();
