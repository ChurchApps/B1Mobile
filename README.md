# B1Mobile

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
#### Join us on [Slack](https://join.slack.com/t/livechurchsolutions/shared_invite/zt-i88etpo5-ZZhYsQwQLVclW12DKtVflg).

### B1Mobile Setup
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
