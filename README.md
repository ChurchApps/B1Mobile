<img align="right" width="150" src="https://raw.githubusercontent.com/ChurchApps/B1Mobile/main/public/images/logo.png">

# B1 Mobile

> **B1 Mobile** is the mobile app companion to the [B1.church](https://github.com/ChurchApps/B1Mobile) app. It runs on both iOS and Android and provides the same features as the web version including online giving, self-check-in for attendance, live streaming of services, and an interactive member directory. Visit [B1.church](https://b1.church/) to learn more.

## Preview

<div style="display: flex;gap: 10px;">
    <img style="width: 24%;" src="https://github.com/ChurchApps/B1Mobile/assets/1447203/69cec397-ac87-4bad-a4c4-f9505b8b5f2c">  
    <img style="width: 24%;" src="https://github.com/ChurchApps/B1Mobile/assets/1447203/0f1ee735-f6be-4d05-9737-a13dac5be89b">
    <img style="width: 24%;" src="https://github.com/ChurchApps/B1Mobile/assets/1447203/ba23768c-1e8b-449a-8c56-a8bdf5d8dbd9">
    <img style="width: 24%;" src="https://github.com/ChurchApps/B1Mobile/assets/1447203/14b79a9c-08e8-4870-9587-2b03e050deb5">  
</div>

## Get Involved

### 🤝 Help Support Us

The only reason this program is free is because of the generous support from users. If you want to support us to keep this free, please head over to [ChurchApps](https://churchapps/partner) or [sponsor us on GitHub](https://github.com/sponsors/ChurchApps/). Thank you so much!

### 🏘️ Join the Community

We have a great community for end-users on [Facebook](https://www.facebook.com/churchapps.org). It's a good way to ask questions, get tips and follow new updates. Come join us!

### ⚠️ Report an Issue

If you discover an issue or have a feature request, simply submit it to our [issues log](https://github.com/ChurchApps/ChurchAppsSupport/issues). Don't be shy, that's how the program gets better.

### 💬 Join us on Slack

If you would like to contribute in any way, head over to our [Slack Channel](https://join.slack.com/t/livechurchsolutions/shared_invite/zt-i88etpo5-ZZhYsQwQLVclW12DKtVflg) and introduce yourself. We'd love to hear from you.

### 🏗️ Start Coding

If you'd like to set up the project locally, see our [development guide](https://churchapps.org/dev). For this app:

1. Copy dotenv.sample.txt to .env
2. Run `npm i` to install dependencies

## Release build

1. Hardcode stage to prod EnvironmentHelper.ts
2. Increment the version number in app.config.js, package.json, android/app/build.gradle and ios/B1Mobile/Info.plist
3. Run `npm run build:android` to generate a Google Play release
4. Run `npm run build:ios` to generate an iOS release
