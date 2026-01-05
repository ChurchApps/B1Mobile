import { EnvironmentHelper, SecureStorageHelper } from "../../src/helpers";
import { NavigationUtils } from "../../src/helpers/NavigationUtils";
import { LinkInterface } from "@churchapps/helpers";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useGlobalSearchParams, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { clearAllCachedData } from "../../src/helpers/QueryClient";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Divider, List, Surface, Text, TouchableRipple } from "react-native-paper";
import { useUser, useCurrentChurch, useUserStore } from "../../src/stores/useUserStore";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { eventBus } from "@/helpers/PushNotificationHelper";
import { useTranslation } from "react-i18next";
import pkg from "../../package.json";

type ItemType = {
  linkType?: string;
  text?: string;
  url?: string;
};

type ParamsType = {
  url?: string;
};

export function CustomDrawer(props?: any) {
  const { t } = useTranslation();
  // Use the drawer navigation prop if available, otherwise fallback to useNavigation
  const navigation = props?.navigation || useNavigation<DrawerNavigationProp<any>>();
  // Use hooks instead of local state
  const user = useUser();
  const currentChurch = useCurrentChurch();
  const links = useUserStore(state => state.links);
  const loadChurchLinks = useUserStore(state => state.loadChurchLinks);
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const { top } = useSafeAreaInsets();

  useEffect(() => {
    // Reload links when church changes
    if (currentChurch?.id) {
      loadChurchLinks(currentChurch.id);
    }
  }, [currentChurch?.id]);

  useEffect(() => {
    const handleLogout = () => {
      logoutAction();
    };
    eventBus.addListener('do_logout', handleLogout);

    return () => {
      eventBus.removeListener('do_logout');
    };
  }, [])

  const checkIsActive = (item: ItemType, pathname: string, params?: ParamsType): boolean => {
    const path = (pathname || "").toLowerCase();
    const linkType = (item.linkType || "").toLowerCase();
    const text = (item.text || "").toLowerCase();
    const url = (item.url || "").toLowerCase();
    const paramUrl = (params?.url || "").toLowerCase();

    const normalize = (s: string) => s.replace(/\s+/g, "").toLowerCase();

    if (url && paramUrl && path.includes("websiteurl") && normalize(paramUrl).includes(normalize(url))) {
      return true;
    }

    if (
      (path.includes("memberssearch") && (linkType === "directory" || normalize(text).includes("directory"))) ||
      (path.includes("/plan") && (linkType.startsWith("plan") || normalize(text).includes("plan"))) ||
      (path.includes("/service") && (linkType.startsWith("checkin") || normalize(text).includes("checkin")))
    ) {
      return true;
    }

    if (linkType && !path.includes("websiteurl") && normalize(path).includes(normalize(linkType))) {
      return true;
    }

    if (text && !path.includes("websiteurl") && normalize(path).includes(normalize(text))) {
      return true;
    }

    return false;
  };

  const logoutAction = async () => {
    try {
      setIsLoggingOut(true);
      console.log("Starting logout process...");

      // Clear React Query cache and persisted data
      await clearAllCachedData();

      // Clear JWT from secure storage
      try {
        await SecureStorageHelper.removeSecureItem("default_jwt");
        console.log("Cleared JWT from secure storage");
      } catch (error) {
        console.warn("Failed to clear JWT from secure storage:", error);
      }

      // Use the store's logout method
      await useUserStore.getState().logout();

      // Clear AsyncStorage (except church data to preserve church selection)
      await AsyncStorage.getAllKeys()
        .then(keys => AsyncStorage.multiRemove(keys.filter(key => key !== "CHURCH_DATA")))
        .then(() => {
          console.log("Logout complete, navigating to dashboard");
          router.replace("/(drawer)/dashboard");
        });
    } catch (error) {
      console.error("Error during logout:", error);
      // Navigate to dashboard even if there were errors
      router.replace("/(drawer)/dashboard");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const listItem = (topItem: boolean, item: any) => {
    if (item.linkType === "separator") {
      return <Divider style={styles.separator} />;
    }

    const icon = item.icon ? item.icon.split("_").join("-") : "";
    const iconName = icon === "calendar-month" ? "calendar-today" : icon === "local-library-outlined" ? "local-library" : icon;

    const isActive = checkIsActive(item, pathname, params);

    return (
      <List.Item
        title={item.text}
        left={() => (topItem ? <Image source={{ uri: item.photo }} style={styles.tabIcon} /> : <MaterialIcons name={iconName} size={24} color={isActive ? "#FFF" : "#0D47A1"} style={styles.drawerIcon} />)}
        onPress={() => {
          NavigationUtils.navigateToScreen(item, currentChurch);
          // Use setTimeout to ensure navigation completes before closing drawer
          setTimeout(() => {
            try {
              if (navigation && typeof navigation.closeDrawer === 'function') {
                navigation.closeDrawer();
              } else {
                navigation.dispatch(DrawerActions.closeDrawer());
              }
            } catch (error) {
              console.warn('Failed to close drawer:', error);
            }
          }, 100);
        }}
        style={[styles.listItem, isActive && styles.activeMenuItem]}
        titleStyle={[styles.listItemText, isActive && styles.activeMenuText]}
      />
    );
  };

  const drawerHeaderComponent = () => (
    <Surface style={styles.headerContainer} elevation={2}>
      <View style={styles.headerContent}>
        {getUserInfo()}
        <Button mode="contained" onPress={() => router.navigate("/(drawer)/churchSearch")} style={styles.churchButton} buttonColor="#FFFFFF" textColor="#0D47A1" icon={() => <MaterialIcons name={!currentChurch ? "search" : "church"} size={20} color="#0D47A1" />}>
          {!currentChurch ? t("churchSearch.findChurch") : (currentChurch.name || t("churchSearch.selectChurch"))}
        </Button>
      </View>
    </Surface>
  );

  const getUserInfo = () => {
    const currentUserChurch = useUserStore.getState().currentUserChurch;
    if (!currentUserChurch?.person || !user) return null;


    return (
      <View style={styles.userInfoSection}>
        <View style={styles.userRow}>
          <View style={styles.avatarContainer}>{currentUserChurch.person.photo ? <Avatar.Image size={48} source={{ uri: EnvironmentHelper.ContentRoot + currentUserChurch.person.photo }} /> : <Avatar.Text size={48} label={`${user.firstName?.[0] || "U"}${user.lastName?.[0] || "S"}`} />}</View>
          <View style={styles.userTextContainer}>
            <Text variant="titleMedium" numberOfLines={1} style={styles.userName}>
              {`${user.firstName} ${user.lastName}`}
            </Text>
            <View style={styles.actionButtons}>
              <TouchableRipple
                style={styles.profileDropdownButton}
                onPress={() => setShowProfileMenu(!showProfileMenu)}>
                <View style={styles.profileDropdownContent}>
                  <MaterialIcons name="edit" size={16} color="#0D47A1" />
                  <Text style={styles.profileDropdownText}>{t("navigation.editProfile")}</Text>
                  <MaterialIcons
                    name={showProfileMenu ? "expand-less" : "expand-more"}
                    size={18}
                    color="#0D47A1"
                  />
                </View>
              </TouchableRipple>
              {user && (
                <TouchableRipple style={styles.messageIconButton} onPress={() => router.navigate("/(drawer)/searchMessageUser")}>
                  <>
                    <MaterialCommunityIcons name="email-outline" size={20} color="#0D47A1" />
                  </>
                </TouchableRipple>
              )}
            </View>
          </View>
        </View>
        {showProfileMenu && (
          <View style={styles.profileSubmenu}>
            <TouchableRipple style={styles.submenuItem} onPress={editLoginInfoAction}>
              <View style={styles.submenuItemContent}>
                <MaterialIcons name="lock" size={18} color="#0D47A1" />
                <Text style={styles.submenuItemText}>{t("profileEdit.loginInformation")}</Text>
              </View>
            </TouchableRipple>
            <TouchableRipple style={styles.submenuItem} onPress={editDirectoryListingAction}>
              <View style={styles.submenuItemContent}>
                <MaterialIcons name="person" size={18} color="#0D47A1" />
                <Text style={styles.submenuItemText}>{t("profileEdit.directoryListing")}</Text>
              </View>
            </TouchableRipple>
          </View>
        )}
      </View>
    );
  };

  const editLoginInfoAction = () => {
    const currentUserChurch = useUserStore.getState().currentUserChurch;
    const extra = Constants.expoConfig?.extra || {};
    const stage = extra.STAGE;

    let url: string;
    const baseUrl = stage === "prod"
      ? "https://app.chums.org/login"
      : "https://app.staging.chums.org/login";

    const loginParams = new URLSearchParams({
      returnUrl: "/profile?hideHeader=true",
      hideHeader: "true",
    });

    url = `${baseUrl}?${loginParams.toString()}`;

    if (currentUserChurch?.jwt) url += "&jwt=" + currentUserChurch.jwt;

    closeDrawerAndNavigate(() => {
      router.push({
        pathname: "websiteUrlRoot",
        params: { url, title: t("profileEdit.loginInformation") }
      });
    });
  };

  const editDirectoryListingAction = () => {
    closeDrawerAndNavigate(() => {
      router.push("/(drawer)/profileEdit");
    });
  };

  const closeDrawerAndNavigate = (navigateAction: () => void) => {
    setShowProfileMenu(false);
    setTimeout(() => {
      try {
        if (navigation && typeof navigation.closeDrawer === 'function') {
          navigation.closeDrawer();
        } else {
          navigation.dispatch(DrawerActions.closeDrawer());
        }
      } catch (error) {
        console.warn('Failed to close drawer:', error);
      }
      navigateAction();
    }, 100);
  };

  const drawerFooterComponent = () => {
    return (
      <Surface style={styles.footerContainer} elevation={1}>
        <Button mode="outlined" onPress={user ? logoutAction : () => router.navigate("/auth/login")} style={styles.logoutButton} icon={() => <MaterialIcons name={user ? "logout" : "login"} size={24} color="#0D47A1" />} loading={isLoggingOut} disasbled={isLoggingOut}>
          {isLoggingOut ? t("drawer.signingOut") : user ? t("drawer.logout") : t("drawer.login")}
        </Button>
        <Text variant="bodySmall" style={styles.versionText}>
          Version {pkg.version}
        </Text>
      </Surface>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {drawerHeaderComponent()}
        {links.length === 0 ? (
          <View style={{ padding: 20 }}>
            <Text>{t("navigation.loadingNavigation")}</Text>
          </View>
        ) : (
          <View style={styles.menuContainer}>
            {links.map((item, index) => (
              <View key={item.id || index}>{listItem(!!(item as any).photo, item)}</View>
            ))}
          </View>
        )}
        {drawerFooterComponent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF"
  },
  headerContainer: {
    backgroundColor: "#FFFFFF", // Clean white background
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0"
  },
  headerContent: {
    padding: 16
  },
  userInfoSection: {
    marginBottom: 16
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  avatarContainer: {
    // Avatar styling handled by component
  },
  userTextContainer: {
    flex: 1,
    minWidth: 0
  },
  userName: {
    fontWeight: "600",
    fontSize: 18, // H3 from style guide
    lineHeight: 24,
    marginBottom: 4,
    color: "#3c3c3c" // Dark gray from style guide
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  profileDropdownButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: "#F6F6F8"
  },
  profileDropdownContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  profileDropdownText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0D47A1"
  },
  profileSubmenu: {
    marginTop: 12,
    marginLeft: 60,
    backgroundColor: "#F6F6F8",
    borderRadius: 8,
    overflow: "hidden"
  },
  submenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  submenuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  submenuItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3c3c3c"
  },
  messageIconButton: {
    padding: 8,
    borderRadius: 24,
    backgroundColor: "#F6F6F8"
  },
  churchButton: {
    borderRadius: 8,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    marginTop: 8
  },
  listItem: {
    minHeight: 48, // Style guide menu item height
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0"
  },
  tabIcon: {
    width: 24,
    height: 24,
    marginRight: 8
  },
  scrollContainer: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16 // Reduced padding following 8px grid
  },
  footerContainer: {
    padding: 16,
    marginTop: "auto", // Push to bottom
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0"
  },
  logoutButton: {
    marginBottom: 8
  },
  versionText: {
    textAlign: "center",
    color: "#9E9E9E" // Medium gray from style guide
  },
  drawerIcon: {
    marginLeft: 0,
    marginRight: 16, // 16px right margin from style guide
    alignSelf: "center"
  },
  listItemText: {
    fontSize: 16, // Body text from style guide
    fontWeight: "500",
    color: "#3c3c3c" // Dark gray from style guide
  },
  separator: {
    marginVertical: 8,
    backgroundColor: "#F0F0F0",
    height: 1
  },
  activeMenuItem: {
    backgroundColor: "#0D47A1",
  },
  activeMenuText: {
    color: "#fff",
    fontWeight: "600",
  },
});
