import React from 'react';
import { BlueHeader } from '@/src/components/BlueHeader';

import { Constants } from '@/src/helpers/Constants';
import { globalStyles } from '@/src/helpers/GlobalStyles';
import { DimensionHelper } from '@/src/helpers/DimensionHelper';
import Icon from '@expo/vector-icons/Fontisto';
import { router, useNavigation } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
//import { ApiHelper } from '@churchapps/mobilehelper';

const Register = () => {
  const navigation = useNavigation()
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registered, setRegistered] = useState(false)


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
      /*
      const data = await ApiHelper.post("/users/register", params, "MembershipApi");
      if (data.email != null) setRegistered(true);
      else Alert.alert("Alert", "User already exists.");
      */
    } catch (error: any) {
      if (error.message && error.message.includes("user already exists")) {
        Alert.alert("Error", "This user already exists. Please log in with your username and password.");
      } else {
        Alert.alert("Error", error.message || "Failed to register user");
      }
    } finally {
      setLoading(false);
    }
  }

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
  const getForm = () => {
    return (<>
      <Text style={globalStyles.mainText}>Register an Account</Text>
      <View style={[globalStyles.textInputView, { width: DimensionHelper.wp(90) }]}>
        <Icon name={'person'} color={Constants.Colors.app_color} style={globalStyles.inputIcon} size={DimensionHelper.wp(4.5)} />
        <TextInput style={[globalStyles.textInputStyle, { width: DimensionHelper.wp(90) }]} placeholder={'First name'} autoCorrect={false} placeholderTextColor={'lightgray'} value={firstName} onChangeText={(text) => { setFirstName(text) }} />
      </View>
      <View style={[globalStyles.textInputView, { width: DimensionHelper.wp(90) }]}>
        <Icon name={'person'} color={Constants.Colors.app_color} style={globalStyles.inputIcon} size={DimensionHelper.wp(4.5)} />
        <TextInput style={[globalStyles.textInputStyle, { width: DimensionHelper.wp(90) }]} placeholder={'Last name'} autoCorrect={false} placeholderTextColor={'lightgray'} value={lastName} onChangeText={(text) => { setLastName(text) }} />
      </View>
      <View style={[globalStyles.textInputView, { width: DimensionHelper.wp(90) }]}>
        <Icon name={'email'} color={Constants.Colors.app_color} style={globalStyles.inputIcon} size={DimensionHelper.wp(4.5)} />
        <TextInput style={[globalStyles.textInputStyle, { width: DimensionHelper.wp(90) }]} placeholder={'Email'} autoCapitalize="none" autoCorrect={false} keyboardType='email-address' placeholderTextColor={'lightgray'} value={email} onChangeText={(text) => { setEmail(text) }} />
      </View>
      <View style={{ ...globalStyles.privacyPolicyView, width: DimensionHelper.wp(90) }}>
        <Text style={{ ...globalStyles.privacyText, width: DimensionHelper.wp(90) }}>By clicking on Register, I confirm that I have read the <Text style={{ color: Constants.Colors.app_color }} onPress={() => {
          router.navigate('/auth/privacy')
        }}>privacy policy.</Text>
        </Text>
      </View>
      <TouchableOpacity style={[globalStyles.roundBlueButton, { width: DimensionHelper.wp(90) }]} onPress={() => { validateDetails() && registerApiCall() }}>
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
      <TouchableOpacity style={[globalStyles.roundBlueButton, { width: DimensionHelper.wp(90) }]} onPress={() => { router.back() }}>
        <Text style={globalStyles.roundBlueButtonText}>Login</Text>
      </TouchableOpacity>
    </>);
    else return getForm();
  }

  //<BlueHeader navigation={navigation} showBack={true} />
  return (
    <SafeAreaView style={globalStyles.appContainer}>

      <View style={globalStyles.grayContainer}>
        {getContent()}
      </View>
    </SafeAreaView>
  )
}

export default Register
