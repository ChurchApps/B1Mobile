import React from "react";
import { Drawer } from "expo-router/drawer";
import { DrawerActions } from "@react-navigation/native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { IconButton } from "react-native-paper";
import { useRouter } from "expo-router";

import { CustomDrawer } from "../../src/components/CustomDrawer";
import { ErrorBoundary } from "../../src/components/ErrorBoundary";
import { HeaderBell } from "@/components/wrapper/HeaderBell";
import { Avatar } from "@/components/common/Avatar";
import { useChurchAppearance, useCurrentUserChurch, useUser } from "@/stores/useUserStore";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "@/theme";
import { useThemeContext } from "../../src/theme/ThemeProvider";
import OptimizedImage from "@/components/OptimizedImage";

export default function DrawerLayout() {
  const { t } = useTranslation();
  const router = useRouter();
  const currentChurch = useCurrentUserChurch();
  const churchAppearance = useChurchAppearance();
  const user = useUser();
  const tc = useThemeColors();
  const { theme: themeMode } = useThemeContext();

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
    headerStyle: { backgroundColor: tc.headerBg },
    headerTintColor: tc.white,
    headerTitleAlign: "center" as const,
    drawerStyle: { width: 280, backgroundColor: tc.surface },
    drawerType: "slide" as const,
    overlayColor: "rgba(0, 0, 0, 0.5)",
    sceneStyle: { backgroundColor: tc.background }
  };

  const dashboardTitle = currentChurch?.church?.name || t("navigation.home");
  const headerLogoUri = tc.isDark
    ? (churchAppearance?.logoLight || churchAppearance?.logoDark)
    : (churchAppearance?.logoDark || churchAppearance?.logoLight);

  const renderDashboardTitle = () => {
    if (!headerLogoUri) {
      return (
        <Text style={[styles.headerTitleText, { color: tc.white }]} numberOfLines={1}>
          {dashboardTitle}
        </Text>
      );
    }
    return (
      <View style={styles.headerTitleContainer}>
        <OptimizedImage source={{ uri: headerLogoUri }} style={styles.headerLogo} contentFit="contain" priority="high" />
      </View>
    );
  };

  // Header left renderer
  const renderHeaderLeft = (navigation: any, currentRouteName: string) => {
    const isDashboard = currentRouteName === "dashboard";

    return (
      <View style={{ flexDirection: "row", alignItems: "center", paddingLeft: !isDashboard ? 10 : 0 }}>
        {!isDashboard && <MaterialIcons name="chevron-left" size={27} color={tc.white} onPress={() => router.replace("/(drawer)/dashboard")} />}
        <IconButton icon="menu" size={27} iconColor={tc.white} onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
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
            headerRight: () => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <HeaderBell toggleNotifications={toggleNotifications} />
                {user && (
                  <TouchableOpacity onPress={() => router.push("/(drawer)/profileEdit")} style={{ marginRight: 8 }}>
                    <Avatar size={30} photoUrl={currentChurch?.person?.photo} firstName={user.firstName} lastName={user.lastName} />
                  </TouchableOpacity>
                )}
              </View>
            )
          };
        }}
        drawerContent={props => <CustomDrawer {...props} themeMode={themeMode} />}>
        <Drawer.Screen
          name="dashboard"
          options={{
            title: dashboardTitle,
            headerTitle: renderDashboardTitle
          }}
        />
        <Drawer.Screen name="myGroups" options={{ title: t("navigation.myGroups") }} />
        <Drawer.Screen
          name="notifications"
          options={{
            title: t("navigation.notifications"),
            headerRight: () => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <HeaderBell name="person-add" toggleNotifications={() => toggleNotifications("notifications")} />
                {user && (
                  <TouchableOpacity onPress={() => router.push("/(drawer)/profileEdit")} style={{ marginRight: 8 }}>
                    <Avatar size={30} photoUrl={currentChurch?.person?.photo} firstName={user.firstName} lastName={user.lastName} />
                  </TouchableOpacity>
                )}
              </View>
            )
          }}
        />
        <Drawer.Screen name="votd" options={{ title: t("navigation.verseOfTheDay") }} />
        <Drawer.Screen name="service" options={{ title: t("checkin.checkin") }} />
        <Drawer.Screen name="donation" options={{ title: t("donations.giving") }} />
        <Drawer.Screen name="membersSearch" options={{ title: t("navigation.directory") }} />
        <Drawer.Screen name="plan" options={{ title: t("plans.plans") }} />
        <Drawer.Screen name="sermons" options={{ title: t("sermons.sermons") }} />
        <Drawer.Screen name="searchMessageUser" options={{ title: t("navigation.searchMessages") }} />
        <Drawer.Screen name="registrations" options={{ title: "Registrations" }} />
        <Drawer.Screen
          name="volunteerBrowse"
          options={{
            title: t("volunteer.browseOpportunities"),
            drawerItemStyle: { display: "none" }
          }}
        />
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

const styles = StyleSheet.create({
  headerTitleContainer: { flexDirection: "row" },
  headerLogo: {
    height: 30,
    width: "100%"
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: "600",
    flexShrink: 1
  }
});
