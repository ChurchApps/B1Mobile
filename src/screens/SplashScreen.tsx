import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Image, Dimensions, PixelRatio } from 'react-native';
import { globalStyles, Utilities } from '../helpers';
import { Constants } from '../helpers';
import { ApiHelper, ChurchInterface, UserHelper } from "../helpers"

interface Props {
  navigation: {
    navigate: (screenName: string) => void;
    goBack: () => void;
  };
}

const SplashScreen = (props: Props) => {

  const [dimension, setDimension] = useState(Dimensions.get('screen'));

  const wd = (number: string) => {
    let givenWidth = typeof number === "number" ? number : parseFloat(number);
    return PixelRatio.roundToNearestPixel((dimension.width * givenWidth) / 100);
  };

  const hd = (number: string) => {
    let givenWidth = typeof number === "number" ? number : parseFloat(number);
    return PixelRatio.roundToNearestPixel((dimension.height * givenWidth) / 100);
  };


  useEffect(() => {
    Utilities.trackEvent("Splash Screen");
    checkUser()
    Dimensions.addEventListener('change', () => {
      const dim = Dimensions.get('screen')
      setDimension(dim);
    })
  }, [])

  useEffect(() => {
  }, [dimension])


  const checkUser = async () => {
    try {
      const user = await AsyncStorage.getItem('USER_DATA')
      const churchString = await AsyncStorage.getItem("CHURCH_DATA")
      const churchesString = await AsyncStorage.getItem("CHURCHES_DATA")

      if (user !== null) {
        UserHelper.user = JSON.parse(user);
        let church: ChurchInterface | null = null;
        if (churchString) church = JSON.parse(churchString);
        if (church) await UserHelper.setCurrentChurch(church);
        UserHelper.churches = (churchesString) ? JSON.parse(churchesString) : [church];
        ApiHelper.setDefaultPermissions(church?.jwt || "");
        church?.apis?.forEach(api => ApiHelper.setPermissions(api.keyName || "", api.jwt, api.permissions))
        await UserHelper.setPersonRecord()
        props.navigation.navigate('MainStack');
      } else {
        if (churchString) {
          const church: ChurchInterface = JSON.parse(churchString);
          UserHelper.setCurrentChurch(church);
        }
        //props.navigation.navigate('AuthStack');
        props.navigation.navigate('MainStack');
      }
    } catch (e) {
      console.log(e)
    }
  }

  if (dimension.width > dimension.height) {
    return (
      <View style={[globalStyles.safeAreaContainer, { flex: 1, backgroundColor: Constants.Colors.app_color }]}>
        <Image source={Constants.Images.splash_screen} style={{ width: hd('100%'), height: hd('100%') }} />
      </View>
    );
  } else {
    return (
      <View style={[globalStyles.safeAreaContainer, { flex: 1 }]}>
        <Image source={Constants.Images.splash_screen} style={{ width: wd('100%'), height: hd('100%') }} />
      </View>
    );
  }
}

export default SplashScreen;
