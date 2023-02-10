import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Text, ActivityIndicator, Alert, DevSettings, Linking, PixelRatio, Dimensions } from 'react-native';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Constants, EnvironmentHelper, LoginResponseInterface, Utilities } from '../helpers';
import Icon from 'react-native-vector-icons/Fontisto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles } from '../helpers';
import { BlueHeader } from '../components';
import { ChurchInterface, ApiHelper, UserHelper } from '../helpers';
import RNRestart from 'react-native-restart';

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
  const [dimension, setDimension] = useState(Dimensions.get('window'));

  const wd = (number: string) => {
    let givenWidth = typeof number === "number" ? number : parseFloat(number);
    return PixelRatio.roundToNearestPixel((dimension.width * givenWidth) / 100);
  };

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

  const registerApiCall = () => {
    const params = { email: email, firstName: firstName, lastName: lastName };
    setLoading(true);
    ApiHelper.post("/users/register", params, "MembershipApi").then(async (data: any) => {
      setLoading(false);
      if (data.email != null) setRegistered(true);
      else Alert.alert("Alert", "User already exists.");
    });
  }

  const getForm = () => {
    return (<>
      <Text style={globalStyles.mainText}>Register an Account</Text>
      <View style={[globalStyles.textInputView, { width: wd('90%') }]}>
        <Icon name={'person'} color={Constants.Colors.app_color} style={globalStyles.inputIcon} size={wp('4.5%')} />
        <TextInput style={[globalStyles.textInputStyle, { width: wd('90%') }]} placeholder={'First name'} autoCorrect={false} placeholderTextColor={'lightgray'} value={firstName} onChangeText={(text) => { setFirstName(text) }} />
      </View>
      <View style={[globalStyles.textInputView, { width: wd('90%') }]}>
        <Icon name={'person'} color={Constants.Colors.app_color} style={globalStyles.inputIcon} size={wp('4.5%')} />
        <TextInput style={[globalStyles.textInputStyle, { width: wd('90%') }]} placeholder={'Last name'} autoCorrect={false} placeholderTextColor={'lightgray'} value={lastName} onChangeText={(text) => { setLastName(text) }} />
      </View>
      <View style={[globalStyles.textInputView, { width: wd('90%') }]}>
        <Icon name={'email'} color={Constants.Colors.app_color} style={globalStyles.inputIcon} size={wp('4.5%')} />
        <TextInput style={[globalStyles.textInputStyle, { width: wd('90%') }]} placeholder={'Email'} autoCapitalize="none" autoCorrect={false} keyboardType='email-address' placeholderTextColor={'lightgray'} value={email} onChangeText={(text) => { setEmail(text) }} />
      </View>
      <TouchableOpacity style={[globalStyles.roundBlueButton, { width: wd('90%') }]} onPress={() => { validateDetails() && registerApiCall() }}>
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
      <TouchableOpacity style={[globalStyles.roundBlueButton, { width: wd('90%') }]} onPress={() => { props.navigation.navigate("LoginScreen") }}>
        <Text style={globalStyles.roundBlueButtonText}>Login</Text>
      </TouchableOpacity>
    </>);
    else return getForm();
  }


  return (
    <SafeAreaView style={globalStyles.appContainer}>
      <BlueHeader navigation={props.navigation} showBack={true}/>
      <View style={globalStyles.grayContainer}>

        {getContent()}
      </View>
    </SafeAreaView>
  );
};
