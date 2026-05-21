import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jellochat.app',
  appName: 'JelloChat',
  bundledWebRuntime: false,
  server: {
    url: 'http://192.168.1.162:3000',
    cleartext: true
  }
};

export default config;
