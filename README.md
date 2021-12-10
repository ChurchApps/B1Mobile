# B1Mobile

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
#### Join us on [Slack](https://join.slack.com/t/livechurchsolutions/shared_invite/zt-i88etpo5-ZZhYsQwQLVclW12DKtVflg).

### B1Mobile Setup
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
2. Set `STAGE=prod` environment variable in .env
3. Run `npm start -- --reset-cache` to pick up .env changes
4. Increment the version number in android/app/build.gradle
5. Run `cd android` followed by `gradlew bundleRelease` to produce the release bundle.
6. Plug in an Android phonet via USB so an apk is generated for the correct device.
7. Run `cd..` followed by `react-native run-android --variant=release` to generate an apk file for Fire devices.  You can close the node window when it completes.
8. Open the app in Android studio.  Choose Build -> Generate Signed Bundle and point to your keys.
9. The signed build will be at `\android\app\release`.  Upload it to the Google Play store.
