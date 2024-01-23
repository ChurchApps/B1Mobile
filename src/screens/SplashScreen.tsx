import { DimensionHelper, LoginResponseInterface } from '@churchapps/mobilehelper';
import React, { useEffect } from 'react';
import { Image, View } from 'react-native';
import { ApiHelper, CacheHelper, Constants, LoginUserChurchInterface, UserHelper, Utilities, globalStyles } from '../helpers';
import { ErrorHelper } from '../helpers/ErrorHelper';
import { PushNotificationHelper } from '../helpers/PushNotificationHelper';
import { NavigationProps } from '../interfaces';

interface Props {
  navigation: NavigationProps;
}

const SplashScreen = (props: Props) => {

  const init = async () => {
    Utilities.trackEvent("Splash Screen");
    await CacheHelper.loadFromStorage();
    PushNotificationHelper.requestUserPermission();
    PushNotificationHelper.NotificationListener();
    PushNotificationHelper.NotificationPermissionAndroid();
    checkUser()
  }

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

  const setUserDataNew = async () => {
    console.log("SET USER DATA NEW", UserHelper.user)
    const user = UserHelper.user;

    ApiHelper.postAnonymous("/users/login", {jwt: user.jwt}, "MembershipApi").then(async (data: LoginResponseInterface) => {
      if (data.user != null) await UserHelper.handleLogin(data);
    }).catch(() => {});
    if (ApiHelper.isAuthenticated)
    {
      if (CacheHelper.church?.id) {
        const userChurch = await ApiHelper.post("/churches/select", { churchId: CacheHelper.church.id }, "MembershipApi");
        //I think this is what's causing the splash screen to hang sometimes.
        if (userChurch?.church?.id) await UserHelper.setCurrentUserChurch(userChurch);
        else await CacheHelper.setValue("user", null);
      }

    }
    props.navigation.navigate('MainStack', {});
  }

  const checkUser = async () => {
    try {

      if (UserHelper.user?.jwt) {
        console.log("USER FOUND", UserHelper.user.jwt)
        setUserDataNew();
        props.navigation.navigate('MainStack', {});
      } else {
        console.log("NO USER, Checking church", CacheHelper.church)
        if (CacheHelper.church?.id) {
          const userChurch: LoginUserChurchInterface = { person: { name: {}, contactInfo: {} }, church: CacheHelper.church, apis: [], jwt: "", groups: [] };
          UserHelper.setCurrentUserChurch(userChurch);
        }
        props.navigation.navigate('MainStack', {});
      }
    } catch (e : any) {
      console.log(e)
      ErrorHelper.logError("splash-screen-error", e);
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

export default SplashScreen;
