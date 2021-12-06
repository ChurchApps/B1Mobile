import React from 'react';
import AppNavigator from './src/navigation/AppNavigation';
import { View } from 'react-native';
import { applyMiddleware, createStore } from 'redux';
import Reducers from './src/redux/reducers/Reducers';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import { Provider } from 'react-redux';
import { EnvironmentHelper } from "./src/helpers"

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

EnvironmentHelper.init();
const App = () => {

  const store = createStore(Reducers, applyMiddleware(thunk, logger))

  return (
    <Provider store={store}>
      <View style={{ flex: 1 }}>
        <AppNavigator />
      </View>
    </Provider>
  );
};

export default App;
