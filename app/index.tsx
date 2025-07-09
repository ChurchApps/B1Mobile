import React from "react";
import { ApiHelper, Constants, EnvironmentHelper, UserHelper, globalStyles } from "../src/helpers";
import { ErrorHelper } from "../src/mobilehelper";
import { PushNotificationHelper } from "../src/helpers/PushNotificationHelper";
import { UpdateHelper } from "../src/helpers/UpdateHelper";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { router } from "expo-router";
import { useEffect } from "react";
import { Image, Platform, View } from "react-native";
import { useUserStore } from "../src/stores/useUserStore";

if (Platform.OS === "android") {
  // See https://github.com/expo/expo/issues/6536 for this issue.
  if (typeof (Intl as any).__disableRegExpRestore === "function") {
    (Intl as any).__disableRegExpRestore();
  }
}

EnvironmentHelper.init();

const SplashScreen = () => {
  const init = async () => {
    // Load JWT tokens from secure storage if they exist
    await UserHelper.loadSecureTokens();

    await UpdateHelper.initializeUpdates();
    PushNotificationHelper.requestUserPermission();
    PushNotificationHelper.NotificationListener();
    PushNotificationHelper.NotificationPermissionAndroid();
    checkUser();
  };

  useEffect(() => {
    ErrorHelper.init();
    ApiHelper.onError = () => {};
    UserHelper.addOpenScreenEvent("Splash Screen");
  }, []);

  useEffect(() => {
    init();
  }, []);

  const setUserDataNew = async () => {
    const user = useUserStore.getState().user;
    if (!user?.jwt) return;

    const data = await ApiHelper.postAnonymous("/users/login", { jwt: user.jwt }, "MembershipApi");
    if (data.user != null) await useUserStore.getState().handleLogin(data);
  };

  const checkUser = async () => {
    try {
      const store = useUserStore.getState();
      if (store.user?.jwt) await setUserDataNew();
    } catch (e: any) {
      console.error("App initialization error:", e);
      ErrorHelper.logError("splash-screen-error", e);
    }

    // Initialize app from persisted data (loads appearance and links)
    await useUserStore.getState().initializeFromPersistence();

    const currentChurch = useUserStore.getState().currentUserChurch?.church;
    if (!currentChurch) {
      router.navigate("/(drawer)/churchSearch");
      // router.navigate('/churchSearch')
    } else {
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
