import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";

import { initializeFirebase } from "../src/config/firebase";
import { ThemeProvider } from "../src/theme/ThemeProvider";
import { UserHelper } from "../src/helpers/UserHelper";
import { queryClient, initializeQueryCache } from "../src/helpers/QueryClient";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { NotificationNavigationHandler } from "../src/components/NotificationNavigationHandler";
import { HeaderBell } from "@/components/wrapper/HeaderBell";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const setupApp = async () => {
      await initializeFirebase();
      await UserHelper.loadSecureTokens();
      await initializeQueryCache();
    };
    setupApp();
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
    { name: "myGroupsRoot", options: { ...defaultHeaderOptions, title: "My Groups", headerBackTitle: "Home" } },
    { name: "groupDetails/[id]/index", options: { ...defaultHeaderOptions, title: "", headerBackTitle: "My Groups" } },
    { name: "notificationsRoot", options: { ...defaultHeaderOptions, title: "Notifications", headerRight: () => <HeaderBell name="person-add" toggleNotifications={() => toggleNotifications("notifications")} /> } },
    { name: "memberDetailRoot", options: { ...defaultHeaderOptions, title: "Member Details" } },
    { name: "createEventRoot", options: { ...defaultHeaderOptions, title: "Create Event" } },
    { name: "messageScreenRoot", options: { ...defaultHeaderOptions, title: "Messages" } },
    { name: "searchMessageUserRoot", options: { ...defaultHeaderOptions, title: "Search Messages" } },
    { name: "sermonsRoot", options: { ...defaultHeaderOptions, title: "Sermons" } },
    { name: "sermonDetails/[id]/index", options: { ...defaultHeaderOptions, title: "" } },
    { name: "playlistDetails/[id]/index", options: { ...defaultHeaderOptions, title: "" } },
    { name: "streamRoot", options: { ...defaultHeaderOptions, title: "" } },
    { name: "pageRoot", options: { ...defaultHeaderOptions, title: "" } },
    { name: "lessonRoot", options: { ...defaultHeaderOptions, title: "" } },
    { name: "bibleRoot", options: { ...defaultHeaderOptions, title: "Bible" } },
    { name: "votdRoot", options: { ...defaultHeaderOptions, title: "Verse of the Day" } },
    { name: "membersSearchRoot", options: { ...defaultHeaderOptions, title: "Directory" } },
    { name: "serviceRoot", options: { ...defaultHeaderOptions, title: "Checkin" } },
    { name: "websiteUrlRoot", options: { ...defaultHeaderOptions, title: "Website" } },
    { name: "planRoot", options: { ...defaultHeaderOptions, title: "Plans" } },
    { name: "donationRoot", options: { ...defaultHeaderOptions, title: "Giving" } },
    { name: "planDetails/[id]/index", options: { ...defaultHeaderOptions, title: "Plan Details", headerBackTitle: "Plans" } }
  ];

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SafeAreaProvider>
            <NotificationNavigationHandler />
            <Stack screenOptions={{ headerShown: true }} initialRouteName="auth">
              {screens.map(screen => (
                <Stack.Screen key={screen.name} name={screen.name} options={screen.options} />
              ))}
            </Stack>
          </SafeAreaProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
