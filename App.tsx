import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigation';
import { View } from 'react-native';
import { EnvironmentHelper } from "./src/helpers"
import CodePush from 'react-native-code-push';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { requestUserPermission, NotificationListener} from './src/utils/PushNotificationHelper';

// Need manually add Intl polyfill for react-native app
import "intl";
import { Platform } from "react-native";

if (Platform.OS === "android") {
  // See https://github.com/expo/expo/issues/6536 for this issue.
  if (typeof (Intl as any).__disableRegExpRestore === "function") {
    (Intl as any).__disableRegExpRestore();
  }
}
import "intl/locale-data/jsonp/en";
import { ErrorHelper } from './src/helpers/ErrorHelper';



EnvironmentHelper.init();
const App = () => {

  useEffect(() => {
    ErrorHelper.init();
  }, []);


  useEffect(()=>{
    requestUserPermission();
    NotificationListener();
  })
  return (
    <ActionSheetProvider>
      <View style={{ flex: 1 }}>
        <AppNavigator />
      </View>
    </ActionSheetProvider>
  );
};

export default CodePush(App);
