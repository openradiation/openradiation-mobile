import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.openradiation',
  appName: 'OpenRadiation',
  webDir: 'www',
  cordova: {
    preferences: {
      ScrollEnabled: 'false',
      'android-minSdkVersion': '19',
      BackupWebStorage: 'none',
      SplashMaintainAspectRatio: 'true',
      SplashShowOnlyFirstTime: 'false',
      SplashScreen: 'screen',
      AutoHideSplashScreen: 'false',
      FadeSplashScreen: 'false',
      ShowSplashScreenSpinner: 'false',
      WKWebViewOnly: 'true'
    }
  }
};

export default config;
