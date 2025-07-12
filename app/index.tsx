import React from "react";
import { ApiHelper, Constants, EnvironmentHelper, UserHelper, globalStyles } from "../src/helpers";
import { ErrorHelper } from "../src/mobilehelper";
import { PushNotificationHelper } from "../src/helpers/PushNotificationHelper";
import { UpdateHelper } from "../src/helpers/UpdateHelper";
import { SecureStorageHelper } from "../src/helpers/SecureStorageHelper";
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
  const [isInitialized, setIsInitialized] = React.useState(false);
  
  const init = async () => {
    // Prevent multiple initializations
    if (isInitialized) {
      console.log("Splash screen already initialized, skipping...");
      return;
    }
    
    setIsInitialized(true);
    
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
