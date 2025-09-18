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

export default function DrawerLayout() {
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
        <Drawer.Screen name="dashboard" options={{ title: "Home" }} />
        <Drawer.Screen name="myGroups" options={{ title: "My Groups" }} />
        <Drawer.Screen
          name="notifications"
          options={{
            title: "Notifications",
            headerRight: () => <HeaderBell name="person-add" toggleNotifications={() => toggleNotifications("notifications")} />
          }}
        />
        <Drawer.Screen name="votd" options={{ title: "Verse of the Day" }} />
        <Drawer.Screen name="service" options={{ title: "Checkin" }} />
        <Drawer.Screen name="donation" options={{ title: "Donation" }} />
        <Drawer.Screen name="membersSearch" options={{ title: "Directory" }} />
        <Drawer.Screen name="plan" options={{ title: "Plans" }} />
        <Drawer.Screen name="sermons" options={{ title: "Sermons" }} />
        <Drawer.Screen name="searchMessageUser" options={{ title: "Search Messages" }} />
        <Drawer.Screen
          name="churchSearch"
          options={({ navigation }) => ({
            title: "Church Search",
            headerRight: () => null,
            headerLeft: () => (currentChurch ? renderHeaderLeft(navigation, "churchSearch") : null)
          })}
        />
      </Drawer>
    </ErrorBoundary>
  );
}
