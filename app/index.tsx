import React from "react";
import { ApiHelper, CacheHelper, Constants, EnvironmentHelper, UserHelper, globalStyles } from "../src/helpers";
import { ErrorHelper } from "../src/helpers/ErrorHelper";
import { PushNotificationHelper } from "../src/helpers/PushNotificationHelper";
import { UpdateHelper } from "../src/helpers/UpdateHelper";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { router } from "expo-router";
import { useEffect } from "react";
import { Image, Platform, View } from "react-native";

if (Platform.OS === "android") {
  // See https://github.com/expo/expo/issues/6536 for this issue.
  if (typeof (Intl as any).__disableRegExpRestore === "function") {
    (Intl as any).__disableRegExpRestore();
  }
}

EnvironmentHelper.init();

const SplashScreen = () => {
  //console.log("*****SPLASH******")

  const init = async () => {
    //   setTimeout(() => {
    // router.replace('/auth/login')

    //   }, 1000);

    // Utilities.trackEvent("Splash Screen");
    await CacheHelper.loadFromStorage();
    await UpdateHelper.initializeUpdates();
    PushNotificationHelper.requestUserPermission();
    PushNotificationHelper.NotificationListener();
    PushNotificationHelper.NotificationPermissionAndroid();
    checkUser();
  };

  useEffect(() => {
    console.log("Working proper");
    ErrorHelper.init();
    //ApiHelper.onRequest = (url:string, requestOptions:any) => { console.log("Request: ", url, requestOptions); }
    ApiHelper.onError = (url: string, requestOptions: any, error: any) => {
      console.log("***API Error: ", url, requestOptions, error);
    };
    UserHelper.addOpenScreenEvent("Splash Screen");
  }, []);

  useEffect(() => {
    init();
  }, []);

  const setUserDataNew = async () => {
    const user = UserHelper.user;
    const data = await ApiHelper.postAnonymous("/users/login", { jwt: user.jwt }, "MembershipApi");
    if (data.user != null) await UserHelper.handleLogin(data);
  };

  const checkUser = async () => {
    console.log("CHECK USER");
    try {
      if (UserHelper.user?.jwt) await setUserDataNew();
    } catch (e: any) {
      console.log(e);
      ErrorHelper.logError("splash-screen-error", e);
    }

    if (!CacheHelper.church) {
      console.log("NO CHURCH");
      router.navigate("/(drawer)/churchSearch");
      // router.navigate('/churchSearch')
    } else {
      console.log("CHURCH");
      router.replace("/(drawer)/dashboard");
    }

    // router.replace('/auth/login');
    //props.navigation.navigate('MainStack', {});
    // props.navigation.reset({
    //   index: 0,
    //   routes: [{ name: 'MainStack' }]
    // }, 500)
  };

  if (DimensionHelper.wp(100) > DimensionHelper.hp(100)) {
    return (
      <View style={[globalStyles.safeAreaContainer, { flex: 1, backgroundColor: Constants.Colors.app_color }]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Image
            source={require("../assets/images/logo.png")}
            style={{
              width: DimensionHelper.wp(70),
              height: undefined,
              aspectRatio: 1,
              resizeMode: "contain"
            }}
          />
        </View>
      </View>
    );
  } else {
    return (
      <View style={[globalStyles.safeAreaContainer, { flex: 1 }]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Image
            source={require("../assets/images/logo.png")}
            style={{
              width: DimensionHelper.wp(70),
              height: undefined,
              aspectRatio: 1,
              resizeMode: "contain"
            }}
          />
        </View>
      </View>
    );
  }
};

export default SplashScreen;
