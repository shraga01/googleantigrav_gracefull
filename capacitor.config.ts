import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shraga.dailyappreciation',
  appName: 'Daily Appreciation',
  webDir: 'dist',
  android: {
    backgroundColor: '#4a148c',
    allowMixedContent: true
  },
  plugins: {
    StatusBar: {
      overlaysWebView: true,
      style: 'LIGHT',
      backgroundColor: '#00000000'
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    }
  }
};

export default config;
