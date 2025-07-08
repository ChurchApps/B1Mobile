// import "../src/config/firebase";
import React from "react";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initializeFirebase } from "../src/config/firebase";
import { ThemeProvider } from "../src/theme/ThemeProvider";

export default function RootLayout() {
  useEffect(() => {
    const setupFirebase = async () => {
      console.log("Initializing Firebase...");
      await initializeFirebase();
    };

    setupFirebase();
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
