# openradiation-mobile

Source code is under licence Apache 2.0 (cf https://www.openradiation.org/fr/conditions-dutilisation#licence_apache2)

Design and graphism is protected

# Requirements

[Node 8.10.0 (or more recent LTS version)](https://nodejs.org/en/) is required to build and test the application.

Then you need to download project dependencies by running `npm install` in the source directory.

## Android

To build your app and run it on Android, you need to download and install [Android Studio](https://developer.android.com/studio/).

Then you need to update the Android sdk and tools with the [SDK Manager](https://developer.android.com/studio/intro/update#sdk-manager). Be sure to have at least these installed :

- SDK Platfors > Android API 28
- SDK Tools > Android SDK Build-Tools
- SDK Tools > Android SDK Platform-Tools
- SDK Tools > Android SDK Tools
- SDK Tools > Google USB Driver

Your `PATH` environment variable should contain (example for Windows 10 standard installation) :

- C:\Users\<username>\AppData\Local\Android\sdk\tools
- C:\Users\<username>\AppData\Local\Android\sdk\platform-tools
- C:\Program Files (x86)\Common Files\Oracle\Java\javapath

# Usefull commands

1.  Start a local server to test the app => `npm run start` (most of app features won't be available thought since it requires real device hardware like bluetooth)
2.  Run the app on your phone connected by USB and with developer mode enabled => `npm run run:android`
