import React from 'react';
import { BlueHeader } from '@/src/components/BlueHeader';
import { ApiHelper, Constants as ConstantsHelper, EnvironmentHelper, LoginResponseInterface, UserHelper, globalStyles } from '@/src/helpers';
import { DimensionHelper } from '@/src/helpers/DimensionHelper';
import Fontisto from '@expo/vector-icons/Fontisto';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import RNRestart from 'react-native-restart';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");



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
      console.log(data)
      setLoading(false);
      if (data.user != null) {
        console.log("here")
        await UserHelper.handleLogin(data as any);

        // router.replace('(drawer)/dashboard');
        // props.navigation.reset({
        //   index: 0,
        //   routes: [{ name: 'MainStack' }]
        // }, 500)
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
  const registerLink = EnvironmentHelper.B1WebRoot.replace("{subdomain}.", "") + "/login?action=register";

  return (
    <View style={{ flex: 1, backgroundColor: ConstantsHelper.Colors.gray_bg }}>
      <ScrollView>
        <SafeAreaView style={globalStyles.appContainer}>
          <BlueHeader />
          <View style={globalStyles.grayContainer}>
            <Text style={globalStyles.mainText}>Welcome, Please Login.</Text>
            <View style={[globalStyles.textInputView, { width: DimensionHelper.wp(90) }]}>
              <Fontisto name={'email'} color={ConstantsHelper.Colors.app_color} style={globalStyles.inputIcon} size={DimensionHelper.wp(4.5)} />
              <TextInput style={[globalStyles.textInputStyle, { width: DimensionHelper.wp(90) }]} placeholder={'Email'} autoCapitalize="none" autoCorrect={false} keyboardType='email-address' placeholderTextColor={'lightgray'} value={email} onChangeText={(text) => { setEmail(text) }} />
            </View>
            <View style={[globalStyles.textInputView, { width: DimensionHelper.wp(90) }]}>
              <Fontisto name={'key'} color={ConstantsHelper.Colors.app_color} style={globalStyles.inputIcon} size={DimensionHelper.wp(4.5)} />
              <TextInput style={[globalStyles.textInputStyle, { width: DimensionHelper.wp(90) }]} placeholder={'Password'} autoCapitalize="none" autoCorrect={false} keyboardType='default' placeholderTextColor={'lightgray'} secureTextEntry={true} value={password} onChangeText={(text) => { setPassword(text) }} />
            </View>
            <View style={{ ...globalStyles.privacyPolicyView, width: DimensionHelper.wp(90) }}>
              <Text style={{ ...globalStyles.privacyText, width: DimensionHelper.wp(90) }}>By clicking on Login, I confirm that I have read the <Text style={{ color: ConstantsHelper.Colors.app_color }} onPress={() => {
                router.navigate('/auth/privacy')
              }}    >privacy policy.</Text>
              </Text>
            </View>

            <TouchableOpacity style={[globalStyles.roundBlueButton, { width: DimensionHelper.wp(90) }]} onPress={() => { validateDetails() && loginApiCall() }}>
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
              <TouchableOpacity onPress={() => { router.navigate("/auth/register") }}>
                <Text style={globalStyles.simpleLink}>Register</Text>
              </TouchableOpacity>
            </View>

          </View>
        </SafeAreaView>
      </ScrollView>

    </View>
  )
}

export default Login
