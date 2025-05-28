import React from 'react';
import { globalStyles } from '@/src/helpers/GlobalStyles';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
//import { ApiHelper } from '@churchapps/mobilehelper';

const Register2 = () => {

  return (
    <SafeAreaView style={globalStyles.appContainer}>

      <View style={globalStyles.grayContainer}>
        <Text style={globalStyles.roundBlueButtonText}>Login</Text>
      </View>
    </SafeAreaView>
  )
}

export default Register2
