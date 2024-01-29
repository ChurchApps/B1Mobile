import { AppCenterHelper, DimensionHelper, LoginResponseInterface } from '@churchapps/mobilehelper';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, SafeAreaView, Text, View } from 'react-native';
import { ScrollView, TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import RNRestart from 'react-native-restart';
import Icon from 'react-native-vector-icons/Fontisto';
import { BlueHeader } from '../components';
import { ApiHelper, Constants, EnvironmentHelper, UserHelper, globalStyles } from '../helpers';

interface Props {
  navigation: {
    navigate: (screenName: string) => void;
  };
}

export const LoginScreen = (props: Props) => {
  const { navigate } = props.navigation;
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    AppCenterHelper.trackEvent("Login Screen");
  }, [])

  const validateDetails = () => {
    if (email != '') {
      let emailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,6})+$/;
      if (emailReg.test(email) === false) {
        Alert.alert("Alert", 'Please enter valid email.');
        return false;
      } else {
        if (password != '') {
          return true;
        } else {
          Alert.alert("Alert", 'Please enter password.');
          return false;
        }
      }
    } else {
      Alert.alert("Alert", 'Please enter email.');
      return false;
    }
  }

  

  const loginApiCall = () => {
    let params = { "email": email, "password": password }
    setLoading(true);
    ApiHelper.postAnonymous("/users/login", params, "MembershipApi").then(async (data: LoginResponseInterface) => {
      setLoading(false);
      if (data.user != null) {
        await UserHelper.handleLogin(data);
        props.navigation.navigate('MainStack');
        //DevSettings.reload();
        RNRestart.Restart();
      }
      else Alert.alert("Alert", "Invalid login");
    }).catch(() => {
      setLoading(false);
      Alert.alert("Alert", "Invalid login");
    });
  }

  const forgotLink = EnvironmentHelper.B1WebRoot.replace("{subdomain}.", "") + "/login?action=forgot";
  //const registerLink = EnvironmentHelper.B1WebRoot.replace("{subdomain}.", "") + "/login?action=register";

  return (
    <View style={{ flex: 1, backgroundColor: Constants.Colors.gray_bg }}>
      <ScrollView>
        <SafeAreaView style={globalStyles.appContainer}>
          <BlueHeader />
          <View style={globalStyles.grayContainer}>
            <Text style={globalStyles.mainText}>Welcome, Please Login.</Text>
            <View style={[globalStyles.textInputView, { width: DimensionHelper.wp('90%') }]}>
              <Icon name={'email'} color={Constants.Colors.app_color} style={globalStyles.inputIcon} size={DimensionHelper.wp('4.5%')} />
              <TextInput style={[globalStyles.textInputStyle, { width: DimensionHelper.wp('90%') }]} placeholder={'Email'} autoCapitalize="none" autoCorrect={false} keyboardType='email-address' placeholderTextColor={'lightgray'} value={email} onChangeText={(text) => { setEmail(text) }} />
            </View>
            <View style={[globalStyles.textInputView, { width: DimensionHelper.wp('90%') }]}>
              <Icon name={'key'} color={Constants.Colors.app_color} style={globalStyles.inputIcon} size={DimensionHelper.wp('4.5%')} />
              <TextInput style={[globalStyles.textInputStyle, { width: DimensionHelper.wp('90%') }]} placeholder={'Password'} autoCapitalize="none" autoCorrect={false} keyboardType='default' placeholderTextColor={'lightgray'} secureTextEntry={true} value={password} onChangeText={(text) => { setPassword(text) }} />
            </View>

            <TouchableOpacity style={[globalStyles.roundBlueButton, { width: DimensionHelper.wp('90%') }]} onPress={() => { validateDetails() && loginApiCall() }}>
              {loading ?
                <ActivityIndicator size='small' color='white' animating={loading} /> :
                <Text style={globalStyles.roundBlueButtonText}>LOGIN</Text>
              }
            </TouchableOpacity>

            <View style={globalStyles.loginLinks}>
              <TouchableOpacity onPress={() => { Linking.openURL(forgotLink); }}>
                <Text style={globalStyles.simpleLink}>Forgot Password</Text>
              </TouchableOpacity>
              <Text> | </Text>
              <TouchableOpacity onPress={() => { props.navigation.navigate("RegisterScreen") }}>
                <Text style={globalStyles.simpleLink}>Register</Text>
              </TouchableOpacity>
            </View>

          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
};
