import React from 'react';
import AppNavigator from './src/navigation/AppNavigation';
import { View } from 'react-native';
import { applyMiddleware, createStore } from 'redux';
import Reducers from './src/redux/reducers/Reducers';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import { Provider } from 'react-redux';
import { EnvironmentHelper } from "./src/helper"

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
