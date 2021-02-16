# B1App
ReactNative mobile application for B1.church

Visit <a href="https://b1.church/">https://b1.church/</a> to learn more.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
#### Join us on [Slack](https://join.slack.com/t/livechurchsolutions/shared_invite/zt-i88etpo5-ZZhYsQwQLVclW12DKtVflg).


### Dev Setup Instructions
Dev setup consists of loading the "Full Stack" docker container to launch the dependencies; launching the expo server in this project and connecting to it via the expo app.

1. Follow the [Docker setup instructions](https://github.com/LiveChurchSolutions/Docker/) for the "Full Stack" container.
2. Go to https://localhost:3400/ and register an account.
3. Login to https://localhost:3401/ with that account, select your test church and click the Activate link next to "B1 Church".
4. Login to the B1 Admin at http://localhost:3301/ and add one or more Tabs; (Example: Bible, External Url, https://www.biblegateway.com/passage/?search=Genesis+1)
5. Run "npm install" and "npm start" on this project to start the expo server.
6. Download the Expo Go app for iOS or Android and scan the barcode from step 5.
7. Login to the app with the same account.