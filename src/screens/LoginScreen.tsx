import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Text, ActivityIndicator, Alert, DevSettings } from 'react-native';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Constants } from '../helpers';
import Icon from 'react-native-vector-icons/Fontisto';
import { getLoginData } from '../redux/actions/loginAction';
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles } from '../helpers';
import { BlueHeader } from '../components';
import { ChurchInterface, ApiHelper, UserHelper } from '../helpers';

interface Props {
  navigation: {
    navigate: (screenName: string) => void;
  };
  getLoginApiData: (params: any, callback: any) => void;
}

const LoginScreen = (props: Props) => {
  const { navigate } = props.navigation;
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('jared@dsprinting.com');
  const [password, setPassword] = useState('stripetest');

  useEffect(() => {

  }, [])

  const validateDetails = () => {
    if (email != '') {
      let emailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,6})+$/;
      if (emailReg.test(email) === false) {
        Alert.alert("Alert", 'Please enter valid email!!');
        return false;
      } else {
        if (password != '') {
          return true;
        } else {
          Alert.alert("Alert", 'Please enter password!!');
          return false;
        }
      }
    } else {
      Alert.alert("Alert", 'Please enter email!!');
      return false;
    }
  }

  const loginApiCall = () => {
    let params = { "email": email, "password": password }
    setLoading(true);
    props.getLoginApiData(params, async (err: any, res: any) => {
      setLoading(false);
      if (!err) {
        if (res.data.user != null) {
          const church: ChurchInterface = res.data.churches[0]
          UserHelper.user = res.data.user;

          UserHelper.currentChurch = church
          church.apis?.forEach(api => ApiHelper.setPermissions(api.keyName || "", api.jwt, api.permissions))
          await UserHelper.setPersonRecord()  // to fetch person record, ApiHelper must be properly initialzed
          await AsyncStorage.setItem('USER_DATA', JSON.stringify(res.data.user))
          await AsyncStorage.setItem('CHURCH_DATA', JSON.stringify(church))
            .then(() => {
              props.navigation.navigate('MainStack');
              DevSettings.reload();
            })
        }
      } else {
        Alert.alert("Alert", err.message);
      }
    });
  }

  return (
    <SafeAreaView style={globalStyles.appContainer}>
      <BlueHeader />
      <View style={globalStyles.grayContainer}>
        <Text style={globalStyles.mainText}>Welcome, Please Login.</Text>
        <View style={globalStyles.textInputView}>
          <Icon name={'email'} color={Constants.Colors.app_color} style={globalStyles.inputIcon} size={wp('4.5%')} />
          <TextInput
            style={globalStyles.textInputStyle}
            placeholder={'Email'}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType='email-address'
            placeholderTextColor={'lightgray'}
            value={email}
            onChangeText={(text) => { setEmail(text) }}
          />
        </View>
        <View style={globalStyles.textInputView}>
          <Icon name={'key'} color={Constants.Colors.app_color} style={globalStyles.inputIcon} size={wp('4.5%')} />
          <TextInput
            style={globalStyles.textInputStyle}
            placeholder={'Password'}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType='default'
            placeholderTextColor={'lightgray'}
            secureTextEntry={true}
            value={password}
            onChangeText={(text) => { setPassword(text) }}
          />
        </View>

        <TouchableOpacity style={globalStyles.roundBlueButton} onPress={() => { validateDetails() && loginApiCall() }}>
          {loading ?
            <ActivityIndicator size='small' color='white' animating={loading} /> :
            <Text style={globalStyles.roundBlueButtonText}>LOGIN</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const mapStateToProps = (state: any) => {
  return {
    login_data: state.login_data
  };
};
const mapDispatchToProps = (dispatch: any) => {
  return {
    getLoginApiData: (params: any, callback: any) => dispatch(getLoginData(params, callback))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);

