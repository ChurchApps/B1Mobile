import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { EnvironmentHelper } from "./src/helpers";
import AppNavigator from './src/navigation/AppNavigation';
// Need manually add Intl polyfill for react-native app
import { ApiHelper } from '@churchapps/mobilehelper';
import "intl";
import "intl/locale-data/jsonp/en";
import { Platform } from "react-native";
import { ErrorHelper } from './src/helpers/ErrorHelper';

if (Platform.OS === "android") {
  // See https://github.com/expo/expo/issues/6536 for this issue.
  if (typeof (Intl as any).__disableRegExpRestore === "function") {
    (Intl as any).__disableRegExpRestore();
  }
}



EnvironmentHelper.init();

const App = () => {


  useEffect(() => {
    ErrorHelper.init();
    //ApiHelper.onRequest = (url:string, requestOptions:any) => { console.log("Request: ", url, requestOptions); }
    ApiHelper.onError = (url: string, requestOptions: any, error: any) => { console.log("***API Error: ", url, requestOptions, error); }
  }, []);


  return (
    <ActionSheetProvider>
      <View style={{ flex: 1 }}>
        <AppNavigator />
      </View>
    </ActionSheetProvider>
  );
};

export default App;
