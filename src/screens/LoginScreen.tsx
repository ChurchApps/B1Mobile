import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Text, ActivityIndicator, Alert, DevSettings, Linking } from 'react-native';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Constants, LoginResponseInterface } from '../helpers';
import Icon from 'react-native-vector-icons/Fontisto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles } from '../helpers';
import { BlueHeader } from '../components';
import { ChurchInterface, ApiHelper, UserHelper } from '../helpers';
import { B1_WEB_ROOT } from '@env';
import RNRestart from 'react-native-restart';

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
    ApiHelper.post("/users/login", params, "AccessApi").then(async (data: LoginResponseInterface) => {
      setLoading(false);
      if (data.user != null) {
        const church: ChurchInterface = data.churches[0]
        UserHelper.user = data.user;
        UserHelper.churches = data.churches;
        UserHelper.currentChurch = church
        church.apis?.forEach(api => ApiHelper.setPermissions(api.keyName || "", api.jwt, api.permissions))
        await UserHelper.setPersonRecord()  // to fetch person record, ApiHelper must be properly initialzed
        await AsyncStorage.setItem('USER_DATA', JSON.stringify(data.user))
        await AsyncStorage.setItem('CHURCHES_DATA', JSON.stringify(data.churches))
        await AsyncStorage.setItem('CHURCH_DATA', JSON.stringify(church))
        props.navigation.navigate('MainStack');
        //DevSettings.reload();
        RNRestart.Restart();
      } else Alert.alert("Alert", "Invalid login");
    });
  }

  const forgotLink = B1_WEB_ROOT.replace("{subdomain}.", "") + "/login?action=forgot";
  const registerLink = B1_WEB_ROOT.replace("{subdomain}.", "") + "/login?action=register";

  return (
    <SafeAreaView style={globalStyles.appContainer}>
      <BlueHeader />
      <View style={globalStyles.grayContainer}>
        <Text style={globalStyles.mainText}>Welcome, Please Login.</Text>
        <View style={globalStyles.textInputView}>
          <Icon name={'email'} color={Constants.Colors.app_color} style={globalStyles.inputIcon} size={wp('4.5%')} />
          <TextInput style={globalStyles.textInputStyle} placeholder={'Email'} autoCapitalize="none" autoCorrect={false} keyboardType='email-address' placeholderTextColor={'lightgray'} value={email} onChangeText={(text) => { setEmail(text) }} />
        </View>
        <View style={globalStyles.textInputView}>
          <Icon name={'key'} color={Constants.Colors.app_color} style={globalStyles.inputIcon} size={wp('4.5%')} />
          <TextInput style={globalStyles.textInputStyle} placeholder={'Password'} autoCapitalize="none" autoCorrect={false} keyboardType='default' placeholderTextColor={'lightgray'} secureTextEntry={true} value={password} onChangeText={(text) => { setPassword(text) }} />
        </View>

        <TouchableOpacity style={globalStyles.roundBlueButton} onPress={() => { validateDetails() && loginApiCall() }}>
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
          <TouchableOpacity onPress={() => { Linking.openURL(registerLink); }}>
            <Text style={globalStyles.simpleLink}>Register</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};
