# openradiation-mobile

Source code is under licence Apache 2.0 (cf https://www.openradiation.org/fr/conditions-dutilisation#licence_apache2)

Design and graphism is protected

## Global requirements

[Node 8.10.0 (or more recent LTS version)](https://nodejs.org/en/) is required to build and test the application.

Then you need to download project dependencies by running `npm install` in the source directory.

If you want to build your app for a real device (Android or iOS), you also need to run `npm run cordova:prepare`

## Test in browser

You can test the app in your browser by starting a local server with the following command `npm run start`.
Most of app features won't be available thought since it requires real device hardware like bluetooth.

## Android

### Requirements

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

### Build

1. run the app on a local device (connected via USB) with `npm run run:android`
2. build the app to upload it on the Playstore beta channel with `npm run build:beta:android`
3. build the app to upload it on the Playstore prod channel with `npm run build:android`

App built with method 1 & 2 will send measure to the test API (safe to use for tests).

Don't forget to increase the app version number if you want to upload your build to the playstore.

If you are behind a proxy, before you run npm command : 

- Download manually https://services.gradle.org/distributions/gradle-4.1-all.zip then `SET CORDOVA_ANDROID_GRADLE_DISTRIBUTION_URL=C\:/path_to_.../gradle-4.1-all.zip` (on windows)
(Rq : This env variable is in the ..\platforms\android\cordova\lib\builders\GradleBuilder.js file)
- Add this configuration in the gradle.properties file of the project, where the build.gradle file is (PROJECT\platforms\android directory
  
  systemProp.http.proxyHost=
  systemProp.http.proxyPort=
  systemProp.http.proxyUser=
  systemProp.http.proxyPassword=
  systemProp.https.proxyHost=
  systemProp.https.proxyPort=
  systemProp.https.proxyUser=
  systemProp.https.proxyPassword=

### Upload on Playstore

Follow the [official guide](https://support.google.com/googleplay/android-developer/answer/7159011) to upload the app to the Playstore (for both beta closed release and prod release).

## iOS

To build your app and run it no iOS, you need to download and install [Xcode](https://developer.apple.com/xcode/)
You also need to install `ios-deploy` with the following command `npm i -g ios-deploy`.

To run or build the app, you need to sign it, which require :

1. your distribution certificate
2. your development certificate
3. the distribution provisioning profile linked to the app id and your distribution certificate
4. the development provisioning profile linked to the app id, your development certificate and the phone you want to run the app on

### Build

1. run the app on a local device (connected via USB) with `npm run run:ios`
2. build the app to upload it on the Playstore beta channel with `npm run build:beta:ios`
3. build the app to upload it on the Playstore prod channel with `npm run build:ios`

App built with method 1 & 2 will send measure to the test API (safe to use for tests).

Don't forget to increase the app version number if you want to upload your build to the playstore.

### Upload on Playstore

1. open the file `platforms/ios/OpenRadiation.xarchive`
2. if Xcode didn't open automatically, open it and go to `Window > Organiser`
3. select the last version of your app and click on `Upload to app store`
4. follow the steps (be sure to select the right certificate and provisioning profile that you downloaded before)
5. wait for the build to be uploaded and ready to use for test (you will receive an email when it's ready)
6. go to [App Store Connect](https://appstoreconnect.apple.com) and select your app
7. follow the [official guide](https://help.apple.com/app-store-connect/) to manage both beta and prod builds
