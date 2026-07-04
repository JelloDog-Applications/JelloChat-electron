const { contextBridge, ipcRenderer } = require('electron');
const isCloudClientMode = process.argv.some((arg) => String(arg || '').startsWith('--jellochat-cloud-client=1'));

if (!isCloudClientMode) {
  contextBridge.exposeInMainWorld('api', {
    realtime: {
      getConfig: () => ipcRenderer.invoke('realtime:getConfig')
    },
    auth: {
      register: (payload) => ipcRenderer.invoke('auth:register', payload),
      login: (payload) => ipcRenderer.invoke('auth:login', payload),
      getSession: () => ipcRenderer.invoke('auth:getSession'),
      getPasskeys: () => ipcRenderer.invoke('auth:getPasskeys'),
      beginPasskeyRegistration: () => ipcRenderer.invoke('auth:beginPasskeyRegistration'),
      finishPasskeyRegistration: (payload) => ipcRenderer.invoke('auth:finishPasskeyRegistration', payload),
      beginPasskeyLogin: () => ipcRenderer.invoke('auth:beginPasskeyLogin'),
      finishPasskeyLogin: (payload) => ipcRenderer.invoke('auth:finishPasskeyLogin', payload),
      deletePasskey: (payload) => ipcRenderer.invoke('auth:deletePasskey', payload),
      logout: () => ipcRenderer.invoke('auth:logout'),
      resendVerification: (payload) => ipcRenderer.invoke('auth:resendVerification', payload),
      verifyEmail: (payload) => ipcRenderer.invoke('auth:verifyEmail', payload),
      requestPasswordReset: (payload) => ipcRenderer.invoke('auth:requestPasswordReset', payload),
      confirmPasswordReset: (payload) => ipcRenderer.invoke('auth:confirmPasswordReset', payload),
      updateAccount: (payload) => ipcRenderer.invoke('auth:updateAccount', payload),
      deleteAccount: (payload) => ipcRenderer.invoke('auth:deleteAccount', payload)
    },
    chat: {
      getServers: () => ipcRenderer.invoke('chat:getServers'),
      createServer: (payload) => ipcRenderer.invoke('chat:createServer', payload),
      startDiscordMigration: () => ipcRenderer.invoke('chat:startDiscordMigration'),
      getDiscordMigrationStatus: (code) => ipcRenderer.invoke('chat:getDiscordMigrationStatus', code),
      leaveServer: (payload) => ipcRenderer.invoke('chat:leaveServer', payload),
      kickMember: (payload) => ipcRenderer.invoke('chat:kickMember', payload),
      banMember: (payload) => ipcRenderer.invoke('chat:banMember', payload),
      unbanMember: (payload) => ipcRenderer.invoke('chat:unbanMember', payload),
      getBannedUsers: (payload) => ipcRenderer.invoke('chat:getBannedUsers', payload),
      renameServer: (payload) => ipcRenderer.invoke('chat:renameServer', payload),
      createInvite: (payload) => ipcRenderer.invoke('chat:createInvite', payload),
      joinByInvite: (payload) => ipcRenderer.invoke('chat:joinByInvite', payload),
      getServerPresence: (serverId) => ipcRenderer.invoke('chat:getServerPresence', serverId),
      getChannels: (serverId) => ipcRenderer.invoke('chat:getChannels', serverId),
      createCategory: (payload) => ipcRenderer.invoke('chat:createCategory', payload),
      createChannel: (payload) => ipcRenderer.invoke('chat:createChannel', payload),
      updateCategory: (payload) => ipcRenderer.invoke('chat:updateCategory', payload),
      deleteCategory: (payload) => ipcRenderer.invoke('chat:deleteCategory', payload),
      updateChannel: (payload) => ipcRenderer.invoke('chat:updateChannel', payload),
      deleteChannel: (payload) => ipcRenderer.invoke('chat:deleteChannel', payload),
      updateChannelLayout: (payload) => ipcRenderer.invoke('chat:updateChannelLayout', payload),
      getMessages: (channelId) => ipcRenderer.invoke('chat:getMessages', channelId),
      sendMessage: (payload) => ipcRenderer.invoke('chat:sendMessage', payload),
      updateMessage: (payload) => ipcRenderer.invoke('chat:updateMessage', payload),
      deleteMessage: (payload) => ipcRenderer.invoke('chat:deleteMessage', payload)
    },
    dm: {
      getMessages: (payload) => ipcRenderer.invoke('dm:getMessages', payload),
      sendMessage: (payload) => ipcRenderer.invoke('dm:sendMessage', payload),
      startCall: (payload) => ipcRenderer.invoke('dm:startCall', payload),
      joinCall: (payload) => ipcRenderer.invoke('dm:joinCall', payload)
    },
    vc: {
      getToken: (payload) => ipcRenderer.invoke('vc:getToken', payload),
      getParticipants: (payload) => ipcRenderer.invoke('vc:getParticipants', payload)
    },
    notifications: {
      list: () => ipcRenderer.invoke('notifications:list'),
      markRead: (payload) => ipcRenderer.invoke('notifications:markRead', payload),
      markAllRead: () => ipcRenderer.invoke('notifications:markAllRead'),
      getUnread: () => ipcRenderer.invoke('notifications:getUnread'),
      markChannelRead: (payload) => ipcRenderer.invoke('notifications:markChannelRead', payload),
      markDmRead: (payload) => ipcRenderer.invoke('notifications:markDmRead', payload),
      savePreferences: (payload) => ipcRenderer.invoke('notifications:savePreferences', payload),
      registerPushToken: (payload) => ipcRenderer.invoke('notifications:registerPushToken', payload)
    },
    screen: {
      getSources: () => ipcRenderer.invoke('screen:getSources')
    },
    roles: {
      getState: (payload) => ipcRenderer.invoke('roles:getState', payload),
      create: (payload) => ipcRenderer.invoke('roles:create', payload),
      update: (payload) => ipcRenderer.invoke('roles:update', payload),
      delete: (payload) => ipcRenderer.invoke('roles:delete', payload),
      setMemberRole: (payload) => ipcRenderer.invoke('roles:setMemberRole', payload)
    },
    permissions: {
      getOverrides: (payload) => ipcRenderer.invoke('permissions:getOverrides', payload),
      saveOverride: (payload) => ipcRenderer.invoke('permissions:saveOverride', payload),
      deleteOverride: (payload) => ipcRenderer.invoke('permissions:deleteOverride', payload)
    },
    admin: {
      listUsers: (payload) => ipcRenderer.invoke('admin:listUsers', payload),
      listReports: (payload) => ipcRenderer.invoke('admin:listReports', payload),
      updateReport: (payload) => ipcRenderer.invoke('admin:updateReport', payload),
      getStorageConfig: () => ipcRenderer.invoke('admin:getStorageConfig'),
      updateCleanupSettings: (payload) => ipcRenderer.invoke('admin:updateCleanupSettings', payload),
      runAttachmentCompressionBackfill: (payload) => ipcRenderer.invoke('admin:runAttachmentCompressionBackfill', payload),
      listBanAppeals: (payload) => ipcRenderer.invoke('admin:listBanAppeals', payload),
      updateBanAppeal: (payload) => ipcRenderer.invoke('admin:updateBanAppeal', payload),
      listServers: (payload) => ipcRenderer.invoke('admin:listServers', payload),
      getUserDetails: (payload) => ipcRenderer.invoke('admin:getUserDetails', payload),
      getServerView: (payload) => ipcRenderer.invoke('admin:getServerView', payload),
      updateUser: (payload) => ipcRenderer.invoke('admin:updateUser', payload),
      deleteUser: (payload) => ipcRenderer.invoke('admin:deleteUser', payload),
      deleteServer: (payload) => ipcRenderer.invoke('admin:deleteServer', payload)
    },
    reports: {
      createUserReport: (payload) => ipcRenderer.invoke('reports:createUserReport', payload)
    },
    appeals: {
      submitBanAppeal: (payload) => ipcRenderer.invoke('appeals:submitBanAppeal', payload)
    },
    friends: {
      list: () => ipcRenderer.invoke('friends:list'),
      getRequests: () => ipcRenderer.invoke('friends:getRequests'),
      sendRequest: (payload) => ipcRenderer.invoke('friends:sendRequest', payload),
      respondRequest: (payload) => ipcRenderer.invoke('friends:respondRequest', payload)
    },
    legal: {
      getPrivacyPolicy: () => ipcRenderer.invoke('legal:getPrivacyPolicy'),
      getTermsOfService: () => ipcRenderer.invoke('legal:getTermsOfService')
    },
    attachments: {
      uploadMode: 'ipc',
      objectUrl: async (url) => {
        const result = await ipcRenderer.invoke('attachments:getObjectUrl', { url });
        if (!result?.ok) {
          throw new Error(result?.message || 'Failed to load attachment.');
        }
        return result.objectUrl;
      },
      url: (url) => url
    }
  });
}
