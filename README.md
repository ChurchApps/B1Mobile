# B1Mobile

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
#### Join us on [Slack](https://join.slack.com/t/livechurchsolutions/shared_invite/zt-i88etpo5-ZZhYsQwQLVclW12DKtVflg).

### B1Mobile Setup
1. **Start React Native** - Run `npm start` to start the React Native server (server runs on 8081 port).
1. **Install Android App** - In Android Studio open the /android folder and click the run button to install the app on your device.
1. **Connect App to React Native** - Either shake the device or run `adb shell input keyevent 82` to open the developer menu. Go to settings, Debug server host and enter YourIP:8081.  Restart the app and it should work properly.