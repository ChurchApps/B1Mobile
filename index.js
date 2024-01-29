/**
 * @format
 */

import { PushNotificationHelper } from '@churchapps/mobilehelper';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

const backgroundHandler = (remoteMessage) => { console.log('Message handled in the background!', remoteMessage); }
PushNotificationHelper.registerBackgroundHandler(backgroundHandler);
AppRegistry.registerComponent(appName, () => App);
