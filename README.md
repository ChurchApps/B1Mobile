<img align="right" width="150" src="https://raw.githubusercontent.com/ChurchApps/B1App/main/public/images/logo.png">

# B1 Mobile

> **B1 Mobile** is the mobile app companion to the [B1.church](https://github.com/ChurchApps/B1App) app.  It runs on both iOS and Android and provides the same features as the web version including online giving, self-check-in for attendance, live streaming of services, and an interactive member directory. Visit [B1.church](https://b1.church/) to learn more.

## Preview
<div style="display: flex;gap: 10px;">
    <img style="width: 24%;" src="https://github.com/ChurchApps/B1Mobile/assets/1447203/69cec397-ac87-4bad-a4c4-f9505b8b5f2c">  
    <img style="width: 24%;" src="https://github.com/ChurchApps/B1Mobile/assets/1447203/0f1ee735-f6be-4d05-9737-a13dac5be89b">
    <img style="width: 24%;" src="https://github.com/ChurchApps/B1Mobile/assets/1447203/ba23768c-1e8b-449a-8c56-a8bdf5d8dbd9">
    <img style="width: 24%;" src="https://github.com/ChurchApps/B1Mobile/assets/1447203/14b79a9c-08e8-4870-9587-2b03e050deb5">  
</div>

## Get Involved

#### Help Support Us
The only reason this program is free is because of the generous support from users. If you want to support us to keep this free, please head over to [ChurchApps](https://churchapps/partner) or [sponsor us on GitHub](https://github.com/sponsors/ChurchApps/). Thank you so much!

#### Join the Community
We have a great community for end-users on [Facebook](https://www.facebook.com/churchapps.org).  It's a good way to ask questions, get tips and follow new updates.  Come join us!

#### Report and Issue
If you discover an issue or have a feature request, simply submit it to our [issues log](https://github.com/ChurchApps/ChurchAppsSupport).  Don't be shy, that's how the program gets better.

#### Join us on Slack
If you would like to get involved contributing in any way, head over to our [Slack Channel](https://join.slack.com/t/livechurchsolutions/shared_invite/zt-i88etpo5-ZZhYsQwQLVclW12DKtVflg) and introduce yourself.  We'd love to hear from you.

#### Start Coding
If you'd like to set up the project locally, see our [development guide](https://churchapps.org/dev).  For this app:
1. Copy dotenv.sample.txt to .env
2. Run `npm i` to install dependencies

### Running the app
#### Method 1
1. **Start React Native** - Run `npm start` to start the React Native server (server runs on 8081 port).
2. **Install Android App** - In Android Studio open the /android folder and click the run button to install the app on your device.
3. **Connect App to React Native** - Either shake the device or run `adb shell input keyevent 82` to open the developer menu. Go to settings, Debug server host and enter YourIP:8081.  Restart the app and it should work properly.

#### Method 2
1. **Start and Install** - Run `react-native run-android` to start the React Native server and install the app
2. **Connect App to React Native** - Either shake the device or run `adb shell input keyevent 82` to open the developer menu. Go to settings, Debug server host and enter YourIP:8081.  Restart the app and it should work properly.


## Release build
### Android
1. Follow the environment setup instructions [here](https://reactnative.dev/docs/environment-setup) (first time only)
2. Hardcode stage="prod" in EnvironmentHelper.ts
3. Make sure `/android/app/google-services.json` and `/ios/GoogleService-Info.plist` files exist.
4. Increment the version number in `android/app/build.gradle` and `package.json`
6. Run `cd android` followed by `gradlew bundleRelease` to produce the release bundle.
7. Plug in an Android phonet via USB so an apk is generated for the correct device.
8. Run `cd..` followed by `react-native run-android --variant=release` to generate an apk file for Android devices.  You can close the node window when it completes.
9. Open the app in Android studio.  Choose Build -> Generate Signed Bundle and point to your keys.  Note: It may be necessary to run `SET NODE_OPTIONS=--openssl-legacy-provider` and then launch Android Studio from the console `C:\Program Files\Android\Android Studio\bin\studio64.exe` in order to comiple the release bundle.
10. The signed build will be at `\android\app\release`.  Upload it to the Google Play store.

### iOS
Follow instructions [here](https://help.dropsource.com/docs/documentation/after-dropsource/publishing-your-app/submitting-an-ios-app-to-the-app-store/#:~:text=Archive%20your%20App,Click%20Validate%20App)
1. Run `yarn`
2. Run `cd ios` and `pod install`
3. In XCode open `Info` and increase the version number and code.
4. Build, archive, validate and distribute.

### Codepush release
1. Hardcode stage="prod" in EnvironmentHelper.ts
2. Update version number in package.json
3. Run 'appcenter codepush release-react -a Live-Church-Solutions/B1Mobile -d Production' to push to Android
4. Run 'appcenter codepush release-react -a Live-Church-Solutions/B1Mobile_iOS -d Production' to push to iOS
