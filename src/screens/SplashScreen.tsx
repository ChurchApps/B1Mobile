import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Image, Dimensions, PixelRatio } from 'react-native';
import { ChurchInterface, globalStyles, LoginUserChurchInterface, Utilities } from '../helpers';
import { Constants } from '../helpers';
import { ApiHelper, UserHelper } from "../helpers"

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

      console.log("******************************************************USER")
      console.log(user);
      console.log("******************************************************ChurchString")
      console.log(churchString);
      if (user !== null) {
        UserHelper.user = JSON.parse(user);
        ApiHelper.setDefaultPermissions((UserHelper.user as any).jwt || "");

        let church: ChurchInterface | null = null
        let userChurch: LoginUserChurchInterface | null = null;
        if (churchString) church = JSON.parse(churchString);
        if (church?.id) {
          console.log("********************************************CHURCH EXISTS")
          console.log(JSON.stringify(church))
          userChurch = await ApiHelper.post("/churches/select", { churchId: church.id }, "MembershipApi");
          console.log(JSON.stringify(userChurch))
          if (userChurch) await UserHelper.setCurrentUserChurch(userChurch);
        }
        UserHelper.churches = (churchesString) ? JSON.parse(churchesString) : [];

        userChurch?.apis?.forEach(api => ApiHelper.setPermissions(api.keyName || "", api.jwt, api.permissions))
        await UserHelper.setPersonRecord()
        props.navigation.navigate('MainStack');
      } else {
        if (churchString) {
          const userChurch: LoginUserChurchInterface = JSON.parse(churchString);
          UserHelper.setCurrentUserChurch(userChurch);
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
