import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react';
import { View, Image } from 'react-native';
import { globalStyles } from '../helpers';
import { Constants } from '../helpers';
import { ApiHelper, ChurchInterface, UserHelper } from "../helpers"

interface Props {
  navigation: {
    navigate: (screenName: string) => void;
    goBack: () => void;
  };
}

const SplashScreen = (props: Props) => {
  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const user = await AsyncStorage.getItem('USER_DATA')
      const churchString = await AsyncStorage.getItem("CHURCH_DATA")
      const churchesString = await AsyncStorage.getItem("CHURCHES_DATA")

      if (user !== null) {
        UserHelper.user = JSON.parse(user);
        let church: ChurchInterface | null = null;
        if (churchString) church = JSON.parse(churchString);
        if (church) UserHelper.currentChurch = church;
        UserHelper.churches = (churchesString) ? JSON.parse(churchesString) : [church];
        church?.apis?.forEach(api => ApiHelper.setPermissions(api.keyName || "", api.jwt, api.permissions))
        await UserHelper.setPersonRecord()
        props.navigation.navigate('MainStack');
      } else {
        if (churchString) {
          const church: ChurchInterface = JSON.parse(churchString);
          UserHelper.currentChurch = church;
        }
        //props.navigation.navigate('AuthStack');
        props.navigation.navigate('MainStack');
      }
    } catch (e) {
      console.log(e)
    }
  }
  return (
    <View style={globalStyles.safeAreaContainer}>
      <Image source={Constants.Images.splash_screen} style={globalStyles.splashImage} />
    </View>
  );
};

export default SplashScreen;
