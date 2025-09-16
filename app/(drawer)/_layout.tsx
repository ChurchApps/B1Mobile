import React, { useCallback } from "react";
import { Drawer } from "expo-router/drawer";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { DrawerActions, useNavigation, useNavigationState } from "@react-navigation/native";
import { IconButton } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { CustomDrawer } from "../../src/components/CustomDrawer";
import { ErrorBoundary } from "../../src/components/ErrorBoundary";
import { HeaderBell } from "@/components/wrapper/HeaderBell";

export default function DrawerLayout() {
  const router = useRouter();
  const navigation = useNavigation();

  const handleDrawerOpen = useCallback(() => {
    (navigation as any).dispatch(DrawerActions.openDrawer());
  }, [navigation]);

  // Get the current drawer screen name
  const currentRouteName = useNavigationState(state => {
    const route = state.routes[state.index];
    if (route.state) {
      const nestedState = route.state as any;
      const nestedRoute = nestedState.routes[nestedState.index];
      return nestedRoute.name;
    }
    return route.name;
  });

  // Back or menu button for header
  const HeaderLeftButton = () => {
    if (currentRouteName === "dashboard") {
      return <IconButton icon="menu" size={24} color="#FFF" onPress={handleDrawerOpen} />;
    }
    return <MaterialIcons name="arrow-back" size={24} color="#FFF" style={{ marginLeft: 8 }} onPress={() => router.replace("/(drawer)/dashboard")} />;
  };

  // Notification button handler
  const toggleNotifications = (type?: string) => {
    if (type === "notifications") {
      router.push("/(drawer)/searchMessageUser");
    } else {
      router.push("/notificationsRoot");
    }
  };

  // Drawer screens configuration
  const screens: { name: string; title: string; customHeaderRight?: () => JSX.Element }[] = [
    { name: "myGroups", title: "My Groups" },
    { name: "notifications", title: "Notifications", customHeaderRight: () => <HeaderBell name="person-add" toggleNotifications={() => toggleNotifications("notifications")} /> },
    { name: "dashboard", title: "Home" },
    { name: "votd", title: "Verse of the day" },
    { name: "service", title: "Checkin" },
    { name: "donation", title: "Donation" },
    { name: "membersSearch", title: "Directory" },
    { name: "plan", title: "Plans" },
    { name: "sermons", title: "Sermons" },
    { name: "searchMessageUser", title: "Search Messages" }
  ];

  return (
    <ErrorBoundary>
      <Drawer
        screenOptions={({ navigation, route }) => {
          // Keep this function exactly as you wrote it
          const state = navigation.getState() as any;
          const currentRoute = state.routes[state.index];
          const currentRouteName = currentRoute.state?.routes[currentRoute.state.index]?.name || currentRoute.name;

          return {
            headerShown: true,
            headerStyle: { backgroundColor: "#0D47A1" },
            headerTintColor: "#FFF",
            headerLeft: () => {
              const isDashboard = currentRouteName === "dashboard";

              return (
                <View style={{ flexDirection: "row", alignItems: "center", paddingLeft: !isDashboard ? 10 : 0 }}>
                  {!isDashboard && <MaterialIcons name="chevron-left" size={27} color="#FFF" onPress={() => router.replace("/(drawer)/dashboard")} />}
                  <IconButton icon="menu" size={27} iconColor="#FFF" onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
                </View>
              );
            },
            headerRight: () => <HeaderBell toggleNotifications={toggleNotifications} />,
            drawerStyle: { width: 280, backgroundColor: "#F6F6F8" },
            drawerType: "slide",
            overlayColor: "rgba(0, 0, 0, 0.5)"
          };
        }}
        drawerContent={props => <CustomDrawer {...props} />}>
        {screens.map(screen => (
          <Drawer.Screen
            key={screen.name}
            name={screen.name}
            options={{
              title: screen.title,
              headerRight: screen.customHeaderRight ? () => screen.customHeaderRight!() : undefined
            }}
          />
        ))}
      </Drawer>
    </ErrorBoundary>
  );
}
