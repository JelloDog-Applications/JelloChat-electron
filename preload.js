const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  realtime: {
    getConfig: () => ipcRenderer.invoke('realtime:getConfig')
  },
  auth: {
    register: (payload) => ipcRenderer.invoke('auth:register', payload),
    login: (payload) => ipcRenderer.invoke('auth:login', payload),
    getSession: () => ipcRenderer.invoke('auth:getSession'),
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
    createChannel: (payload) => ipcRenderer.invoke('chat:createChannel', payload),
    getMessages: (channelId) => ipcRenderer.invoke('chat:getMessages', channelId),
    sendMessage: (payload) => ipcRenderer.invoke('chat:sendMessage', payload),
    updateMessage: (payload) => ipcRenderer.invoke('chat:updateMessage', payload),
    deleteMessage: (payload) => ipcRenderer.invoke('chat:deleteMessage', payload)
  },
  dm: {
    getMessages: (payload) => ipcRenderer.invoke('dm:getMessages', payload),
    sendMessage: (payload) => ipcRenderer.invoke('dm:sendMessage', payload)
  },
  vc: {
    getToken: (payload) => ipcRenderer.invoke('vc:getToken', payload),
    getParticipants: (payload) => ipcRenderer.invoke('vc:getParticipants', payload)
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
  }
});
