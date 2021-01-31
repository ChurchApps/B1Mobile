# B1App
ReactNative mobile application for B1.church

Visit <a href="https://b1.church/">https://b1.church/</a> to learn more.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
#### Join us on [Slack](https://join.slack.com/t/livechurchsolutions/shared_invite/zt-i88etpo5-ZZhYsQwQLVclW12DKtVflg).


### Dev Setup Instructions
For the APIs, you may either set them up on your local machine first, or point to the staging server copies during development.  The staging server urls are in the sample dotenv files.

### ChumsCheckin
1. Copy `dotenv.sample.txt` to `.env` and updated it to point to the appropriate API urls. 
2. Run `npm start` to start the React Native server.
3. In Android Studio open the /android folder and click the run button to install the app on your device.  It will initially load with the logo missing, you need to connect it to the ReactNative server.
4. Connect the app to your react native server by either shaking the device or running `adb shell input keyevent 82` to open the developer menu. Go to settings, Debug server host and enter YourIP:8081.  Restart the app and it should work properly.

You may create a test account at https://staging.chums.org/ if you are using the staging api urls.
