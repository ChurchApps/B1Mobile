import React from 'react';
import { globalStyles } from '@/src/helpers/GlobalStyles';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { ApiHelper } from '@churchapps/mobilehelper';
import { DimensionHelper } from '@/src/helpers/DimensionHelper';

const Register2 = () => {

  return (
    <SafeAreaView style={globalStyles.appContainer}>

      <View style={globalStyles.grayContainer}>
        <Text style={{ width: DimensionHelper.wp(10) }}>Login</Text>
      </View>
    </SafeAreaView>
  )
}

export default Register2
