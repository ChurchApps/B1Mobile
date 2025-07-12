// import "../src/config/firebase";
import React from "react";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { initializeFirebase } from "../src/config/firebase";
import { ThemeProvider } from "../src/theme/ThemeProvider";
import { UserHelper } from "../src/helpers/UserHelper";
import { queryClient, initializeQueryCache } from "../src/helpers/QueryClient";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { NotificationNavigationHandler } from "../src/components/NotificationNavigationHandler";

export default function RootLayout() {
  useEffect(() => {
    const setupApp = async () => {
      await initializeFirebase();
      await UserHelper.loadSecureTokens();
      await initializeQueryCache(); // Restore cached queries
    };

    setupApp();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SafeAreaProvider>
            <NotificationNavigationHandler />
            <Stack screenOptions={{ headerShown: false }} initialRouteName="auth">
              <Stack.Screen name="auth" />
              <Stack.Screen name="index" />
              <Stack.Screen name="(drawer)" />
            </Stack>
          </SafeAreaProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
