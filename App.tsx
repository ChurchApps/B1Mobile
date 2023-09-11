import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigation';
import { View, Linking } from 'react-native';
import { EnvironmentHelper } from "./src/helpers"
import CodePush from 'react-native-code-push';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

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

  

//   React.useEffect(() => {
//     Linking.addEventListener("url", Linking.getInitialURL);

//     return () => {
//         Linking.removeEventListener("url", Linking.getInitialURL);
//     };
// }, []);
React.useEffect(() => {
      const navigateToInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL()
      console.log("initial url ---->", initialUrl)
      if (initialUrl !=undefined && initialUrl != null) {
        setTimeout(()=>{
       Linking.openURL(initialUrl)
        },1000)
      
      console.log("initial url which open the screen through deep link", initialUrl)
      }
      return initialUrl;
    }
    
    navigateToInitialUrl();
    
  }, [])
  
useEffect(() => {
  ErrorHelper.init();
  }, []);
          
    return (
    <ActionSheetProvider>
      <View style={{ flex: 1 }}>
        <AppNavigator />
      </View>
    </ActionSheetProvider>
  );
};

export default CodePush(App);
