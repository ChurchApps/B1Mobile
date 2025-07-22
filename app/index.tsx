import React from "react";
import { ApiHelper, Constants, EnvironmentHelper, UserHelper, globalStyles } from "../src/helpers";
import { ErrorHelper } from "../src/mobilehelper";
import { PushNotificationHelper } from "../src/helpers/PushNotificationHelper";
import { UpdateHelper } from "../src/helpers/UpdateHelper";
import { SecureStorageHelper } from "../src/helpers/SecureStorageHelper";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { router } from "expo-router";
import { useEffect } from "react";
import { Platform, View, StatusBar, Dimensions } from "react-native";
import { useUserStore } from "../src/stores/useUserStore";
import { Video, ResizeMode } from "expo-av";

if (Platform.OS === "android") {
  // See https://github.com/expo/expo/issues/6536 for this issue.
  if (typeof (Intl as any).__disableRegExpRestore === "function") {
    (Intl as any).__disableRegExpRestore();
  }
}

EnvironmentHelper.init();

const SplashScreen = () => {
  const [isInitialized, setIsInitialized] = React.useState(false);

  const init = async () => {
    // Prevent multiple initializations
    if (isInitialized) {
      console.log("Splash screen already initialized, skipping...");
      return;
    }

    setIsInitialized(true);

    try {
      // Parallelize independent initialization tasks
      await Promise.all([
        UserHelper.loadSecureTokens(),
        UpdateHelper.initializeUpdates(),
        PushNotificationHelper.requestUserPermission()
      ]);

      // Set up notification listeners (these don't need to be awaited)
      PushNotificationHelper.NotificationListener();
      PushNotificationHelper.NotificationPermissionAndroid();

      // Only authentication check needs to be sequential after token loading
      checkUser();
    } catch (error) {
      console.error("Initialization error:", error);
      // Continue with app initialization even if some steps fail
      checkUser();
    }
  };

  useEffect(() => {
    ErrorHelper.init();
    ApiHelper.onError = () => { };
    UserHelper.addOpenScreenEvent("Splash Screen");
  }, []);

  useEffect(() => {
    init();
  }, []);

  const setUserDataNew = async (): Promise<boolean> => {
    try {
      // Get JWT from secure storage instead of user object
      const jwt = await SecureStorageHelper.getSecureItem("default_jwt");
      if (!jwt) {
        console.log("No JWT token found in secure storage");
        return false;
      }

      // Check if token is expired before making API call
      if (!UserHelper.isTokenValid(jwt)) {
        console.log("Stored JWT token is expired, attempting refresh...");
        const refreshed = await UserHelper.refreshToken();
        if (!refreshed) {
          console.log("Token refresh failed, user needs to re-login");
          await clearAuthData();
          return false;
        }
        // Get the refreshed token
        const newJwt = await SecureStorageHelper.getSecureItem("default_jwt");
        if (!newJwt) return false;
      }

      // Attempt to re-authenticate with JWT
      const data = await ApiHelper.postAnonymous("/users/login", { jwt: await SecureStorageHelper.getSecureItem("default_jwt") }, "MembershipApi");

      if (data.user != null) {
        await useUserStore.getState().handleLogin(data);
        console.log("Successfully re-authenticated user");
        return true;
      } else {
        console.log("Re-authentication failed: no user data returned");
        await clearAuthData();
        return false;
      }
    } catch (error: any) {
      console.error("Re-authentication failed:", error);

      // Handle specific error cases
      if (error.status === 401 || error.status === 403) {
        console.log("Authentication failed (401/403), clearing stored credentials");
        await clearAuthData();
      }

      return false;
    }
  };

  const clearAuthData = async () => {
    try {
      await SecureStorageHelper.removeSecureItem("default_jwt");
      await useUserStore.getState().logout();
      console.log("Cleared authentication data");
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  };

  const checkUser = async () => {
    let authenticationSuccessful = false;

    try {
      // Try to re-authenticate using stored JWT
      authenticationSuccessful = await setUserDataNew();
    } catch (e: any) {
      console.error("App initialization error:", e);
      ErrorHelper.logError("splash-screen-error", e);
    }

    // Initialize app from persisted data (loads appearance and links)
    await useUserStore.getState().initializeFromPersistence();

    const currentChurch = useUserStore.getState().currentUserChurch?.church;
    const user = useUserStore.getState().user;

    // Determine navigation based on authentication status
    if (!user || !authenticationSuccessful) {
      // User is not authenticated or authentication failed
      if (currentChurch) {
        // User was previously logged in but authentication failed
        console.log("Authentication failed but church exists, going to dashboard in anonymous mode");
        router.replace("/(drawer)/dashboard");
      } else {
        // No previous church selected
        router.navigate("/(drawer)/churchSearch");
      }
    } else {
      // User is successfully authenticated
      if (!currentChurch) {
        router.navigate("/(drawer)/churchSearch");
      } else {
        router.replace("/(drawer)/dashboard");
      }
    }
  };

  const screenData = Dimensions.get('screen');
  const maxDimension = Math.min(screenData.width, screenData.height) * 0.9;

  return (
    <>
      <StatusBar hidden={true} />
      <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
        <Video
          source={require("../assets/B1Loop.mp4")}
          style={{
            width: maxDimension,
            height: maxDimension,
          }}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          isLooping
          isMuted
        />
      </View>
    </>
  );
};

export default SplashScreen;
