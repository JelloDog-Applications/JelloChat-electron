import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jellochat.app',
  appName: 'JelloChat',
  bundledWebRuntime: false,
  server: {
    url: 'https://chat.jellodog.com',
    cleartext: false
  }
};

export default config;