import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { useTranslation } from "react-i18next";

import { initializeFirebase } from "../src/config/firebase";
import { ThemeProvider } from "../src/theme/ThemeProvider";
import { UserHelper } from "../src/helpers/UserHelper";
import { queryClient, initializeQueryCache } from "../src/helpers/QueryClient";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { NotificationNavigationHandler } from "../src/components/NotificationNavigationHandler";
import { HeaderBell } from "@/components/wrapper/HeaderBell";
import { StatusBar } from "react-native";
import { AppLifecycleManager } from "../src/helpers/AppLifecycleManager";
import "../src/i18n";
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://33dae282f3ce6781e2ae09f0e44b1dfa@o4510432524107776.ingest.us.sentry.io/4510440258469888',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export default Sentry.wrap(function RootLayout() {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const setupApp = async () => {
      await initializeFirebase();
      await UserHelper.loadSecureTokens();
      await initializeQueryCache();
      AppLifecycleManager.initialize();
    };
    setupApp();
    return () => AppLifecycleManager.cleanup();
  }, []);

  const toggleNotifications = (type?: string) => {
    if (type === "notifications") {
      router.push("/(drawer)/searchMessageUser");
    } else {
      router.push("/notificationsRoot");
    }
  };

  // Default header style for most screens
  const defaultHeaderOptions = {
    headerBackTitle: "Back",
    headerStyle: { backgroundColor: "#0D47A1" },
    headerTintColor: "#FFF",
    headerRight: () => <HeaderBell toggleNotifications={toggleNotifications} isDetail={true} />
  };

  // Screens configuration
  const screens: { name: string; options?: any }[] = [
    { name: "auth", options: { headerShown: false } },
    { name: "index", options: { headerShown: false } },
    { name: "(drawer)", options: { headerShown: false, animation: "none" } },
    { name: "myGroupsRoot", options: { ...defaultHeaderOptions, title: t("navigation.myGroups"), headerBackTitle: t("navigation.home") } },
    { name: "groupDetails/[id]/index", options: { ...defaultHeaderOptions, title: "", headerBackTitle: t("navigation.myGroups") } },
    { name: "notificationsRoot", options: { ...defaultHeaderOptions, title: t("navigation.notifications"), headerRight: () => <HeaderBell name="person-add" toggleNotifications={() => toggleNotifications("notifications")} /> } },
    { name: "memberDetailRoot", options: { ...defaultHeaderOptions, title: t("navigation.memberDetails") } },
    { name: "createEventRoot", options: { ...defaultHeaderOptions, title: t("navigation.createEvent") } },
    { name: "messageScreenRoot", options: { ...defaultHeaderOptions, title: t("navigation.messages") } },
    { name: "searchMessageUserRoot", options: { ...defaultHeaderOptions, title: t("navigation.searchMessages") } },
    { name: "sermonsRoot", options: { ...defaultHeaderOptions, title: t("navigation.sermons") } },
    { name: "sermonDetails/[id]/index", options: { ...defaultHeaderOptions, title: "" } },
    { name: "playlistDetails/[id]/index", options: { ...defaultHeaderOptions, title: "" } },
    { name: "streamRoot", options: { ...defaultHeaderOptions, title: "" } },
    { name: "pageRoot", options: { ...defaultHeaderOptions, title: "" } },
    { name: "lessonRoot", options: { ...defaultHeaderOptions, title: "" } },
    { name: "bibleRoot", options: { ...defaultHeaderOptions, title: t("navigation.bible") } },
    { name: "votdRoot", options: { ...defaultHeaderOptions, title: t("navigation.verseOfTheDay") } },
    { name: "membersSearchRoot", options: { ...defaultHeaderOptions, title: t("navigation.directory") } },
    { name: "serviceRoot", options: { ...defaultHeaderOptions, title: t("navigation.checkin") } },
    { name: "websiteUrlRoot", options: { ...defaultHeaderOptions, title: t("navigation.website") } },
    { name: "planRoot", options: { ...defaultHeaderOptions, title: t("plans.plans") } },
    { name: "donationRoot", options: { ...defaultHeaderOptions, title: t("donations.giving") } },
    { name: "planDetails/[id]/index", options: { ...defaultHeaderOptions, title: t("navigation.planDetails"), headerBackTitle: t("plans.plans") } }
  ];

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ActionSheetProvider>
          <ThemeProvider>
            <StatusBar barStyle={"light-content"} />
            <SafeAreaProvider>
              <NotificationNavigationHandler />
              <Stack screenOptions={{ headerShown: true }} initialRouteName="auth">
                {screens.map(screen => (
                  <Stack.Screen key={screen.name} name={screen.name} options={screen.options} />
                ))}
              </Stack>
            </SafeAreaProvider>
          </ThemeProvider>
        </ActionSheetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
});