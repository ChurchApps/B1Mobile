import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Image, Dimensions, PixelRatio } from 'react-native';
import { ChurchInterface, globalStyles, LoginUserChurchInterface, Utilities } from '../helpers';
import { Constants } from '../helpers';
import { ApiHelper, UserHelper } from "../helpers"
import { ErrorHelper } from '../helpers/ErrorHelper';
import { PushNotificationHelper } from '../helpers/PushNotificationHelper';

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
        ApiHelper.setDefaultPermissions((UserHelper.user as any).jwt || "");
        if (ApiHelper.isAuthenticated) PushNotificationHelper.registerUserDevice()

        let church: ChurchInterface | null = null
        let userChurch: LoginUserChurchInterface | null = null;
        if (churchString) church = JSON.parse(churchString);
        if (church?.id) {
          userChurch = await ApiHelper.post("/churches/select", { churchId: church.id }, "MembershipApi");
          //I think this is what's causing the splash screen to hang sometimes.
          if (userChurch?.church?.id) await UserHelper.setCurrentUserChurch(userChurch);
          else await AsyncStorage.setItem('USER_DATA', "")
        }
        UserHelper.churches = (churchesString) ? JSON.parse(churchesString) : [];
        userChurch?.apis?.forEach(api => ApiHelper.setPermissions(api.keyName || "", api.jwt, api.permissions))
        ApiHelper.setPermissions("MessagingApi", userChurch?.jwt || "", [])
        await UserHelper.setPersonRecord()

        props.navigation.navigate('MainStack');
      } else {
        if (churchString) {
          let church = JSON.parse(churchString);
          const userChurch: LoginUserChurchInterface = { person: { name: {}, contactInfo: {} }, church: church, apis: [], jwt: "", groups: [] };

          UserHelper.setCurrentUserChurch(userChurch);
        }



        props.navigation.navigate('MainStack');
      }
    } catch (e : any) {
      console.log(e)
      ErrorHelper.logError("splash-screen-error", e);
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
