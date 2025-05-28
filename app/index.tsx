import React from 'react';
import { ApiHelper, CacheHelper, Constants, EnvironmentHelper, UserHelper, globalStyles } from '@/src/helpers';
import { ErrorHelper } from '@/src/helpers/ErrorHelper';
import { PushNotificationHelper } from '@/src/helpers/PushNotificationHelper';
import { NavigationProps } from '@/src/interfaces';
import { DimensionHelper } from '@/src/helpers/DimensionHelper';
import { router } from 'expo-router';
import { useEffect } from 'react';
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



const SplashScreen = (props: Props) => {
  console.log("*****SPLASH******")

  const init = async () => {
    //   setTimeout(() => {
    // router.replace('/auth/login')

    //   }, 1000);

    // Utilities.trackEvent("Splash Screen");
    console.log("hello")
    await CacheHelper.loadFromStorage();
    PushNotificationHelper.requestUserPermission();
    PushNotificationHelper.NotificationListener();
    PushNotificationHelper.NotificationPermissionAndroid();
    checkUser()
  }


  useEffect(() => {
    ErrorHelper.init();
    //ApiHelper.onRequest = (url:string, requestOptions:any) => { console.log("Request: ", url, requestOptions); }
    ApiHelper.onError = (url: string, requestOptions: any, error: any) => { console.log("***API Error: ", url, requestOptions, error); }
  }, []);


  useEffect(() => { init(); }, [])




  /*
  const setUserDataOld = async (user: any, churchString:string, churchesString:string) => {
    UserHelper.user = JSON.parse(user);
    ApiHelper.setDefaultPermissions((UserHelper.user as any).jwt || "");

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
    if (ApiHelper.isAuthenticated) PushNotificationHelper.registerUserDevice();
  }
  */

  // const setUserDataNew = async () => {
  //   const user = UserHelper.user;
  //   const data = await ApiHelper.postAnonymous("/users/login", {jwt: user.jwt}, "MembershipApi");
  //   if (data.user != null) await UserHelper.handleLogin(data);
  // }
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
      // router.navigate('/churchSearch')
    } else {
      router.replace('/(drawer)/dashboard')
    }



    // router.replace('/auth/login');
    //props.navigation.navigate('MainStack', {});
    // props.navigation.reset({
    //   index: 0,
    //   routes: [{ name: 'MainStack' }]
    // }, 500)
  }

  if (DimensionHelper.wp(100) > DimensionHelper.hp(100)) {
    return (
      <View style={[globalStyles.safeAreaContainer, { flex: 1, backgroundColor: Constants.Colors.app_color }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Image source={require('@/assets/images/logo.png')} style={{ width: DimensionHelper.wp(80), height: DimensionHelper.wp(80) }} />
        </View>
      </View>
    );
  } else {
    return (
      <View style={[globalStyles.safeAreaContainer, { flex: 1 }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Image source={require('@/assets/images/logo.png')} style={{ width: DimensionHelper.wp(80), height: DimensionHelper.wp(80) }} />
        </View>
      </View>
    );
  }
}

export default SplashScreen;
