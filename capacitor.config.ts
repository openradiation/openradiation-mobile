import type { CapacitorConfig } from '@capacitor/cli';
import '@capacitor-community/safe-area';

const config: CapacitorConfig = {
  appId: 'org.openradiation',
  appName: 'OpenRadiation',
  webDir: 'www',
  android: {
    // Required by https://github.com/capacitor-community/background-geolocation
    // To prevent location updates halting after 5 minutes in the background.
    useLegacyBridge: true
  },
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
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#045cb8"
    },
    SafeArea: {
      enabled: true,
      offset: 0,
    }
  }
};

export default config;
