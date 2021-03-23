import React from 'react';
import AppNavigator from './src/navigation/AppNavigation';
import { View } from 'react-native';

const App = () => {
  return (
      <View style={{ flex: 1}}>
          <AppNavigator/>
      </View>
  );
};

export default App;
