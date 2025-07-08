// import "../src/config/firebase";
import React from "react";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initializeFirebase } from "../src/config/firebase";
import { ThemeProvider } from "../src/theme/ThemeProvider";
import { UserHelper } from "../src/helpers/UserHelper";

export default function RootLayout() {
  useEffect(() => {
    const setupApp = async () => {
      console.log("Initializing Firebase...");
      await initializeFirebase();
      
      console.log("Loading secure tokens...");
      await UserHelper.loadSecureTokens();
    };

    setupApp();
  }, []);

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} initialRouteName="auth">
          <Stack.Screen name="auth" />
          <Stack.Screen name="index" />
          <Stack.Screen name="(drawer)" />
        </Stack>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
