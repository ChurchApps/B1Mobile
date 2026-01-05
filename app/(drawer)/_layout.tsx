import React from "react";
import { Drawer } from "expo-router/drawer";
import { DrawerActions } from "@react-navigation/native";
import { View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { IconButton } from "react-native-paper";
import { useRouter } from "expo-router";

import { CustomDrawer } from "../../src/components/CustomDrawer";
import { ErrorBoundary } from "../../src/components/ErrorBoundary";
import { HeaderBell } from "@/components/wrapper/HeaderBell";
import { useCurrentUserChurch } from "@/stores/useUserStore";
import { useTranslation } from "react-i18next";

export default function DrawerLayout() {
  const { t } = useTranslation();
  const router = useRouter();
  const currentChurch = useCurrentUserChurch();

  // Helper: get current route name
  const getCurrentRouteName = (state: any) => {
    const currentRoute = state.routes[state.index];
    return currentRoute.state?.routes[currentRoute.state.index]?.name || currentRoute.name;
  };

  // Notifications handler
  const toggleNotifications = (type?: string) => {
    if (type === "notifications") {
      router.push("/(drawer)/searchMessageUser");
    } else {
      router.push("/notificationsRoot");
    }
  };

  // Common header options
  const commonHeaderOptions = {
    headerShown: true,
    headerStyle: { backgroundColor: "#0D47A1" },
    headerTintColor: "#FFF",
    drawerStyle: { width: 280, backgroundColor: "#F6F6F8" },
    drawerType: "slide" as const,
    overlayColor: "rgba(0, 0, 0, 0.5)"
  };

  // Header left renderer
  const renderHeaderLeft = (navigation: any, currentRouteName: string) => {
    const isDashboard = currentRouteName === "dashboard";

    return (
      <View style={{ flexDirection: "row", alignItems: "center", paddingLeft: !isDashboard ? 10 : 0 }}>
        {!isDashboard && <MaterialIcons name="chevron-left" size={27} color="#FFF" onPress={() => router.replace("/(drawer)/dashboard")} />}
        <IconButton icon="menu" size={27} iconColor="#FFF" onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
      </View>
    );
  };

  return (
    <ErrorBoundary>
      <Drawer
        screenOptions={({ navigation }) => {
          const state = navigation.getState() as any;
          const currentRouteName = getCurrentRouteName(state);

          return {
            ...commonHeaderOptions,
            headerLeft: () => renderHeaderLeft(navigation, currentRouteName),
            headerRight: () => <HeaderBell toggleNotifications={toggleNotifications} />
          };
        }}
        drawerContent={props => <CustomDrawer {...props} />}>
        <Drawer.Screen name="dashboard" options={{ title: t("navigation.home") }} />
        <Drawer.Screen name="myGroups" options={{ title: t("navigation.myGroups") }} />
        <Drawer.Screen
          name="notifications"
          options={{
            title: t("navigation.notifications"),
            headerRight: () => <HeaderBell name="person-add" toggleNotifications={() => toggleNotifications("notifications")} />
          }}
        />
        <Drawer.Screen name="votd" options={{ title: t("navigation.verseOfTheDay") }} />
        <Drawer.Screen name="service" options={{ title: t("checkin.checkin") }} />
        <Drawer.Screen name="donation" options={{ title: t("donations.giving") }} />
        <Drawer.Screen name="membersSearch" options={{ title: t("navigation.directory") }} />
        <Drawer.Screen name="plan" options={{ title: t("plans.plans") }} />
        <Drawer.Screen name="sermons" options={{ title: t("sermons.sermons") }} />
        <Drawer.Screen name="searchMessageUser" options={{ title: t("navigation.searchMessages") }} />
        <Drawer.Screen
          name="profileEdit"
          options={{
            title: t("profileEdit.editProfile"),
            drawerItemStyle: { display: "none" }
          }}
        />
        <Drawer.Screen
          name="churchSearch"
          options={({ navigation }) => ({
            title: t("navigation.churchSearch"),
            headerRight: () => null,
            headerLeft: () => (currentChurch ? renderHeaderLeft(navigation, "churchSearch") : null)
          })}
        />
      </Drawer>
    </ErrorBoundary>
  );
}
