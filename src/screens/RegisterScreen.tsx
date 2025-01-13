import { DimensionHelper } from '@churchapps/mobilehelper';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, Text, View } from 'react-native';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Fontisto';
import { BlueHeader } from '../components';
import { ApiHelper, Constants, Utilities, globalStyles } from '../helpers';

interface Props {
  navigation: {
    navigate: (screenName: string) => void;
  };
}

export const RegisterScreen = (props: Props) => {
  const { navigate } = props.navigation;
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    Utilities.trackEvent("Register Screen");
  }, [])

  const validateDetails = () => {
    let result = true;
    if (email != '') {
      let emailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,6})+$/;
      if (emailReg.test(email) === false) {
        Alert.alert("Alert", 'Please enter valid email.');
        result = false;
      } else if (firstName === '') {
        Alert.alert("Alert", 'Please enter first name.');
        result = false;
      } else if (lastName === '') {
        Alert.alert("Alert", 'Please enter last name.');
        result = false;
      }
    } else {
      Alert.alert("Alert", 'Please enter email.');
      result = false;
    }
    return result;
  }

  const registerApiCall = async () => {
    const params = { email: email, firstName: firstName, lastName: lastName };
    // setLoading(true);
    // ApiHelper.post("/users/register", params, "MembershipApi").then(async (data: any) => {
    //   setLoading(false);
    //   if (data.email != null) setRegistered(true);
    //   else Alert.alert("Alert", "User already exists.");
    // });
    setLoading(true);
    try {
      const data = await ApiHelper.post("/users/register", params, "MembershipApi");
      if (data.email != null) setRegistered(true);
      else Alert.alert("Alert", "User already exists.");
    } catch (error) {
      if (error.message && error.message.includes("user already exists")) {
        Alert.alert("Error", "This user already exists. Please log in with your username and password.");
      } else {
        Alert.alert("Error", error.message || "Failed to register user");
      }
    } finally {
      setLoading(false);
    }
  }

  const getForm = () => {
    return (<>
      <Text style={globalStyles.mainText}>Register an Account</Text>
      <View style={[globalStyles.textInputView, { width: DimensionHelper.wp('90%') }]}>
        <Icon name={'person'} color={Constants.Colors.app_color} style={globalStyles.inputIcon} size={DimensionHelper.wp('4.5%')} />
        <TextInput style={[globalStyles.textInputStyle, { width: DimensionHelper.wp('90%') }]} placeholder={'First name'} autoCorrect={false} placeholderTextColor={'lightgray'} value={firstName} onChangeText={(text) => { setFirstName(text) }} />
      </View>
      <View style={[globalStyles.textInputView, { width: DimensionHelper.wp('90%') }]}>
        <Icon name={'person'} color={Constants.Colors.app_color} style={globalStyles.inputIcon} size={DimensionHelper.wp('4.5%')} />
        <TextInput style={[globalStyles.textInputStyle, { width: DimensionHelper.wp('90%') }]} placeholder={'Last name'} autoCorrect={false} placeholderTextColor={'lightgray'} value={lastName} onChangeText={(text) => { setLastName(text) }} />
      </View>
      <View style={[globalStyles.textInputView, { width: DimensionHelper.wp('90%') }]}>
        <Icon name={'email'} color={Constants.Colors.app_color} style={globalStyles.inputIcon} size={DimensionHelper.wp('4.5%')} />
        <TextInput style={[globalStyles.textInputStyle, { width: DimensionHelper.wp('90%') }]} placeholder={'Email'} autoCapitalize="none" autoCorrect={false} keyboardType='email-address' placeholderTextColor={'lightgray'} value={email} onChangeText={(text) => { setEmail(text) }} />
      </View>
      <View style={{ ...globalStyles.privacyPolicyView, width: DimensionHelper.wp('90%') }}>
        <Text style={{ ...globalStyles.privacyText, width: DimensionHelper.wp('90%') }}>By clicking on Register, I confirm that I have read the <Text style={{ color: Constants.Colors.app_color }} onPress={() => {
          props.navigation.navigate("PrivacyScreen")
        }}>privacy policy.</Text>
        </Text>
      </View>
      <TouchableOpacity style={[globalStyles.roundBlueButton, { width: DimensionHelper.wp('90%') }]} onPress={() => { validateDetails() && registerApiCall() }}>
        {loading ?
          <ActivityIndicator size='small' color='white' animating={loading} /> :
          <Text style={globalStyles.roundBlueButtonText}>Register</Text>
        }
      </TouchableOpacity>
    </>);
  }

  const getContent = () => {
    if (registered) return (<>
      <Text style={globalStyles.mainText}>Success: A temporary password has been sent to {email}. </Text>
      <TouchableOpacity style={[globalStyles.roundBlueButton, { width: DimensionHelper.wp('90%') }]} onPress={() => { props.navigation.navigate("LoginScreen") }}>
        <Text style={globalStyles.roundBlueButtonText}>Login</Text>
      </TouchableOpacity>
    </>);
    else return getForm();
  }


  return (
    <SafeAreaView style={globalStyles.appContainer}>
      <BlueHeader navigation={props.navigation} showBack={true} />
      <View style={globalStyles.grayContainer}>

        {getContent()}
      </View>
    </SafeAreaView>
  );
};
