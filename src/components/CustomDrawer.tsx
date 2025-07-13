import { EnvironmentHelper, UserHelper, SecureStorageHelper } from "../../src/helpers";
import { NavigationUtils } from "../../src/helpers/NavigationUtils";
import { ErrorHelper } from "../mobilehelper";
import { ApiHelper, LinkInterface, Permissions } from "../mobilehelper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { clearAllCachedData } from "../../src/helpers/QueryClient";
import { Image, Linking, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Divider, List, Surface, Text, TouchableRipple } from "react-native-paper";
import { useUser, useCurrentChurch, useUserStore } from "../../src/stores/useUserStore";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { DrawerNavigationProp } from "@react-navigation/drawer";

export function CustomDrawer(props?: any) {
  // Use the drawer navigation prop if available, otherwise fallback to useNavigation
  const navigation = props?.navigation || useNavigation<DrawerNavigationProp<any>>();
  // Use hooks instead of local state
  const user = useUser();
  const currentChurch = useCurrentChurch();
  const { setLinks } = useUserStore();

  const [drawerList, setDrawerList] = useState<LinkInterface[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    getChurch();
    updateDrawerList();
  }, [currentChurch]);

  useEffect(() => {
    // Also trigger on initial mount
    updateDrawerList();
  }, []);

  const getChurch = async () => {
    try {
      if (currentChurch !== null) {
        getMemberData();
      }
    } catch (e: any) {
      ErrorHelper.logError("custom-drawer", e);
    }
  };

  const updateDrawerList = async () => {
    try {
      let tabs: LinkInterface[] = [];
      if (currentChurch?.id) {
        const tempTabs = await ApiHelper.getAnonymous("/links/church/" + currentChurch.id + "?category=b1Tab", "ContentApi");
        tempTabs.forEach((tab: LinkInterface) => {
          switch (tab.linkType) {
            case "groups":
            case "donation":
            case "directory":
            case "plans":
            case "lessons":
            case "website":
            case "checkin":
              break;
            default:
              tabs.push(tab);
              break;
          }
        });
      }

      let specialTabs = await getSpecialTabs();
      const data = tabs.concat(specialTabs);

      setDrawerList(data);
      setLinks(data);
    } catch (error) {
      console.error("Error updating drawer list:", error);
    }
  };

  const getSpecialTabs = async () => {
    let specialTabs: LinkInterface[] = [];
    let showWebsite = false,
      showDonations = false,
      showMyGroups = false,
      showPlans = false,
      showDirectory = false,
      showLessons = false,
      showChums = false,
      showCheckin = false,
      showSermons = false;
    const uc = useUserStore.getState().currentUserChurch;

    if (currentChurch?.id) {
      const page = await ApiHelper.getAnonymous("/pages/" + currentChurch.id + "/tree?url=/", "ContentApi");
      if (page.url) showWebsite = true;
      const gateways = await ApiHelper.getAnonymous("/gateways/churchId/" + currentChurch.id, "GivingApi");
      if (gateways.length > 0) showDonations = true;
      try {
        const playlists = await ApiHelper.getAnonymous("/playlists/public/" + currentChurch.id, "ContentApi");
        if (playlists.length > 0) showSermons = true;
      } catch (error) {
        console.error("Error checking for sermons:", error);
        // Still try to show sermons tab as it might be a temporary error
        showSermons = true;
      }
    }

    if (uc?.person) {
      try {
        const classrooms = await ApiHelper.get("/classrooms/person", "LessonsApi");
        showLessons = classrooms.length > 0;
      } catch {
        //do nothing
      }
      try {
        const campuses = await ApiHelper.get("/campuses", "AttendanceApi");
        showCheckin = campuses.length > 0;
      } catch {
        //do nothing
      }
      showChums = UserHelper.checkAccess(Permissions.membershipApi.people.edit);
      const memberStatus = uc.person?.membershipStatus?.toLowerCase();
      showDirectory = memberStatus === "member" || memberStatus === "staff";
      uc.groups.forEach(group => {
        if (group.tags.indexOf("team") > -1) showPlans = true;
      });
      showMyGroups = uc?.groups?.length > 0;
    }
    specialTabs.push({ linkType: "separator", linkData: "", category: "", text: "", icon: "", url: "" });
    if (showWebsite) specialTabs.push({ linkType: "url", linkData: "", category: "", text: "Website", icon: "home", url: EnvironmentHelper.B1WebRoot.replace("{subdomain}", currentChurch?.subDomain || "") });
    if (showMyGroups) specialTabs.push({ linkType: "groups", linkData: "", category: "", text: "My Groups", icon: "group", url: "" });
    if (showCheckin) specialTabs.push({ linkType: "checkin", linkData: "", category: "", text: "Check In", icon: "check_box", url: "" });
    if (showDonations) specialTabs.push({ linkType: "donation", linkData: "", category: "", text: "Donate", icon: "volunteer_activism", url: "" });
    if (showDirectory) specialTabs.push({ linkType: "directory", linkData: "", category: "", text: "Member Directory", icon: "groups", url: "" });
    if (showPlans) specialTabs.push({ linkType: "plans", linkData: "", category: "", text: "Plans", icon: "event", url: "" });
    if (showLessons) specialTabs.push({ linkType: "lessons", linkData: "", category: "", text: "Lessons", icon: "school", url: "" });
    if (showSermons) specialTabs.push({ linkType: "sermons", linkData: "", category: "", text: "Sermons", icon: "play_circle", url: "" });
    if (showChums) specialTabs.push({ linkType: "url", linkData: "", category: "", text: "Chums", icon: "account_circle", url: "https://app.chums.org/login?jwt=" + uc.jwt + "&churchId=" + uc.church?.id });
    return specialTabs;
  };

  const getMemberData = async () => {
    /*
    if (personId) {
      try {
        await ApiHelper.get("/people/" + personId, "MembershipApi");
      } catch (e) {
        ErrorHelper.logError(e);
      }
    }*/
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

    return (
      <List.Item
        title={item.text}
        left={() => (topItem ? <Image source={item.image} style={styles.tabIcon} /> : <MaterialIcons name={iconName} size={24} color="#0D47A1" style={styles.drawerIcon} />)}
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
        style={styles.listItem}
        titleStyle={styles.listItemText}
      />
    );
  };

  const drawerHeaderComponent = () => (
    <Surface style={styles.headerContainer} elevation={2}>
      <View style={styles.headerContent}>
        {getUserInfo()}
        <Button mode="contained" onPress={() => router.navigate("/(drawer)/churchSearch")} style={styles.churchButton} buttonColor="#FFFFFF" textColor="#0D47A1" icon={() => <MaterialIcons name={!currentChurch ? "search" : "church"} size={20} color="#0D47A1" />}>
          {!currentChurch ? "Find Church" : currentChurch.name || ""}
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
          <View style={styles.avatarContainer}>{currentUserChurch.person.photo ? <Avatar.Image size={48} source={{ uri: EnvironmentHelper.ContentRoot + currentUserChurch.person.photo }} /> : <Avatar.Text size={48} label={`${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`} />}</View>
          <View style={styles.userTextContainer}>
            <Text variant="titleMedium" numberOfLines={1} style={styles.userName}>
              {`${user.firstName} ${user.lastName}`}
            </Text>
            <View style={styles.actionButtons}>
              <Button mode="text" onPress={editProfileAction} style={styles.profileButton} textColor="#0D47A1" compact icon={() => <MaterialIcons name="edit" size={16} color="#0D47A1" />}>
                Edit Profile
              </Button>
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
      </View>
    );
  };

  const editProfileAction = () => {
    const currentUserChurch = useUserStore.getState().currentUserChurch;
    let url = "https://app.chums.org/login?returnUrl=/profile";
    if (currentUserChurch?.jwt) url += "&jwt=" + currentUserChurch.jwt;
    Linking.openURL(url);
    logoutAction();
  };

  const drawerFooterComponent = () => {
    const pkg = require("../../package.json");
    return (
      <Surface style={styles.footerContainer} elevation={1}>
        <Button mode="outlined" onPress={user ? logoutAction : () => router.navigate("/auth/login")} style={styles.logoutButton} icon={() => <MaterialIcons name={user ? "logout" : "login"} size={24} color="#0D47A1" />} loading={isLoggingOut} disabled={isLoggingOut}>
          {isLoggingOut ? "Signing out..." : user ? "Log out" : "Login"}
        </Button>
        <Text variant="bodySmall" style={styles.versionText}>
          Version {pkg.version}
        </Text>
      </Surface>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {drawerHeaderComponent()}
        {drawerList.length === 0 ? (
          <View style={{ padding: 20 }}>
            <Text>Loading navigation...</Text>
          </View>
        ) : (
          <View style={styles.menuContainer}>
            {drawerList.map((item, index) => (
              <View key={item.id || index}>{listItem(false, item)}</View>
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
    backgroundColor: "#F6F6F8" // Background from style guide
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
  profileButton: {
    margin: 0,
    padding: 0,
    minWidth: 0,
    height: 32
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
  }
});
