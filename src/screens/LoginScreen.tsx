import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Text, ActivityIndicator, Alert, Linking, Dimensions, PixelRatio } from 'react-native';
import { ScrollView, TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Constants, EnvironmentHelper, LoginResponseInterface, LoginUserChurchInterface, Utilities } from '../helpers';
import Icon from 'react-native-vector-icons/Fontisto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles } from '../helpers';
import { BlueHeader } from '../components';
import { ApiHelper, UserHelper } from '../helpers';
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
  const [dimension, setDimension] = useState(Dimensions.get('window'));

  const wd = (number: string) => {
    let givenWidth = typeof number === "number" ? number : parseFloat(number);
    return PixelRatio.roundToNearestPixel((dimension.width * givenWidth) / 100);
  };


  useEffect(() => {
    Utilities.trackEvent("Login Screen");
    Dimensions.addEventListener('change', () => {
      const dim = Dimensions.get('screen')
      setDimension(dim);
    })
  }, [])
  useEffect(() => {
  }, [dimension])

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
    ApiHelper.post("/users/login", params, "MembershipApi").then(async (data: LoginResponseInterface) => {
      setLoading(false);
      if (data.user != null) {
        const userChurch: LoginUserChurchInterface = data.userChurches[0]
        UserHelper.user = data.user;
        UserHelper.userChurches = data.userChurches;
        if (userChurch) await UserHelper.setCurrentUserChurch(userChurch);

        ApiHelper.setDefaultPermissions(userChurch?.jwt || "");
        userChurch?.apis?.forEach(api => ApiHelper.setPermissions(api.keyName || "", api.jwt, api.permissions))

        await UserHelper.setPersonRecord()  // to fetch person record, ApiHelper must be properly initialzed
        await AsyncStorage.setItem('USER_DATA', JSON.stringify(data.user))
        await AsyncStorage.setItem('CHURCHES_DATA', JSON.stringify(data.userChurches))
        if (userChurch) await AsyncStorage.setItem('CHURCH_DATA', JSON.stringify(userChurch))
        props.navigation.navigate('MainStack');
        //DevSettings.reload();
        RNRestart.Restart();
      } else Alert.alert("Alert", "Invalid login");
    });
  }

  const forgotLink = EnvironmentHelper.B1WebRoot.replace("{subdomain}.", "") + "/login?action=forgot";
  const registerLink = EnvironmentHelper.B1WebRoot.replace("{subdomain}.", "") + "/login?action=register";

  return (
    <View style={{ flex: 1, backgroundColor: Constants.Colors.gray_bg }}>
      <ScrollView>
        <SafeAreaView style={globalStyles.appContainer}>
          <BlueHeader />
          <View style={globalStyles.grayContainer}>
            <Text style={globalStyles.mainText}>Welcome, Please Login.</Text>
            <View style={[globalStyles.textInputView, { width: wd('90%') }]}>
              <Icon name={'email'} color={Constants.Colors.app_color} style={globalStyles.inputIcon} size={wp('4.5%')} />
              <TextInput style={globalStyles.textInputStyle} placeholder={'Email'} autoCapitalize="none" autoCorrect={false} keyboardType='email-address' placeholderTextColor={'lightgray'} value={email} onChangeText={(text) => { setEmail(text) }} />
            </View>
            <View style={[globalStyles.textInputView, { width: wd('90%') }]}>
              <Icon name={'key'} color={Constants.Colors.app_color} style={globalStyles.inputIcon} size={wp('4.5%')} />
              <TextInput style={globalStyles.textInputStyle} placeholder={'Password'} autoCapitalize="none" autoCorrect={false} keyboardType='default' placeholderTextColor={'lightgray'} secureTextEntry={true} value={password} onChangeText={(text) => { setPassword(text) }} />
            </View>

            <TouchableOpacity style={[globalStyles.roundBlueButton, { width: wd('90%') }]} onPress={() => { validateDetails() && loginApiCall() }}>
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
