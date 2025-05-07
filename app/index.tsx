import { ApiHelper, CacheHelper, Constants, EnvironmentHelper, UserHelper, globalStyles } from '@/src/helpers';
import { ErrorHelper } from '@/src/helpers/ErrorHelper';
import { PushNotificationHelper } from '@/src/helpers/PushNotificationHelper';
import { NavigationProps } from '@/src/interfaces';
import { DimensionHelper } from '@churchapps/mobilehelper';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, Platform, View } from 'react-native';

interface Props {
  navigation: NavigationProps;
}

if (Platform.OS === "android") {
  // See https://github.com/expo/expo/issues/6536 for this issue.
  if (typeof (Intl as any).__disableRegExpRestore === "function") {
    (Intl as any).__disableRegExpRestore();
  }
}

EnvironmentHelper.init();

export default function SplashScreen(props: Props) {
  const init = async () => {
    console.log("hello")
    await CacheHelper.loadFromStorage();
    PushNotificationHelper.requestUserPermission();
    PushNotificationHelper.NotificationListener();
    PushNotificationHelper.NotificationPermissionAndroid();
    checkUser()
  }

  useEffect(() => {
    ErrorHelper.init();
    ApiHelper.onError = (url: string, requestOptions: any, error: any) => { console.log("***API Error: ", url, requestOptions, error); }
  }, []);

  useEffect(() => { init(); }, [])

  const setUserDataNew = async () => {
    console.log("user")
    const user = UserHelper.user;
    console.log("user", user)
    const data = await ApiHelper.postAnonymous("/users/login", { jwt: user.jwt }, "MembershipApi");
    console.log("data", data)
    if (data.user != null) await UserHelper.handleLogin(data);
  }

  const checkUser = async () => {
    console.log("here")
    try {
      console.log(UserHelper.user?.jwt)
      if (UserHelper.user?.jwt) await setUserDataNew();
    } catch (e: any) {
      console.log(e)
      console.log("here")
      ErrorHelper.logError("splash-screen-error", e);
    }

    if (!CacheHelper.church) {
      console.log(CacheHelper.church)
      console.log("chach")
      router.navigate('/(drawer)/churchSearch')
    } else {
      router.replace('/(drawer)/dashboard')
    }
  }

  if (DimensionHelper.wp(100) > DimensionHelper.hp(100)) {
    return (
      <View style={[globalStyles.safeAreaContainer, { flex: 1, backgroundColor: Constants.Colors.app_color }]}>
        <Image source={Constants.Images.splash_screen} style={{ width: DimensionHelper.hp('100%'), height: DimensionHelper.hp('100%') }} />
      </View>
    );
  } else {
    return (
      <View style={[globalStyles.safeAreaContainer, { flex: 1 }]}>
        <Image source={Constants.Images.splash_screen} style={{ width: DimensionHelper.wp('100%'), height: DimensionHelper.hp('100%') }} />
      </View>
    );
  }
}