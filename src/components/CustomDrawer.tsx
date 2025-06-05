import { CacheHelper, EnvironmentHelper, UserHelper } from "@/src/helpers";
import { ErrorHelper } from "@/src/helpers/ErrorHelper";
import { NavigationHelper } from "@/src/helpers/NavigationHelper";
import { ApiHelper, LinkInterface, Permissions } from "@churchapps/mobilehelper";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Linking, ScrollView, StyleSheet, View } from "react-native";
import RNRestart from "react-native-restart";
import { DimensionHelper } from "../helpers/DimensionHelper";
import { useAppTheme } from "@/src/theme";
import { Avatar, Button, Card, Divider, List, Surface, Text, TouchableRipple, useTheme } from "react-native-paper";

export function CustomDrawer(props: any) {
  const { spacing } = useAppTheme();
  const paperTheme = useTheme();
  const [churchName, setChurchName] = useState("");
  const [churchEmpty, setChurchEmpty] = useState(true);
  const [drawerList, setDrawerList] = useState<LinkInterface[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState("");

  useEffect(() => {
    getChurch();
    updateDrawerList();
  }, [props.navigation]);

  const getChurch = async () => {
    try {
      if (UserHelper.user) setUser(UserHelper.user);

      if (CacheHelper.church !== null) {
        setChurchName(CacheHelper.church.name ?? "");
        setChurchEmpty(false);
        //updateDrawerList();
        getMemberData(UserHelper.currentUserChurch?.person?.id);
        if (CacheHelper.church.id) {
          //userChurch = await ApiHelper.post("/churches/select", { churchId: CacheHelper.church.id }, "MembershipApi");
          //if (userChurch) await UserHelper.setCurrentUserChurch(userChurch);
        }
      }
    } catch (e: any) {
      ErrorHelper.logError("custom-drawer", e);
    }
  };

  const updateDrawerList = async () => {
    let tabs: LinkInterface[] = [];
    if (CacheHelper.church) {
      const tempTabs = await ApiHelper.getAnonymous("/links/church/" + CacheHelper.church?.id + "?category=b1Tab", "ContentApi");
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
    UserHelper.links = data;
    if (data.length > 0) {
      if (data[0].linkType === "groups") router.navigate("/(drawer)/myGroups");
      else router.navigate("/(drawer)/dashboard");
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
      showCheckin;
    const uc = UserHelper.currentUserChurch;

    if (CacheHelper.church) {
      const page = await ApiHelper.getAnonymous("/pages/" + CacheHelper.church.id + "/tree?url=/", "ContentApi");
      if (page.url) showWebsite = true;
      const gateways = await ApiHelper.getAnonymous("/gateways/churchId/" + CacheHelper.church.id, "GivingApi");
      if (gateways.length > 0) showDonations = true;
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
    if (showWebsite)
      specialTabs.push({ linkType: "url", linkData: "", category: "", text: "Website", icon: "home", url: EnvironmentHelper.B1WebRoot.replace("{subdomain}", CacheHelper.church!.subDomain || "") });
    if (showMyGroups) specialTabs.push({ linkType: "groups", linkData: "", category: "", text: "My Groups", icon: "group", url: "" });
    if (showCheckin) specialTabs.push({ linkType: "checkin", linkData: "", category: "", text: "Check In", icon: "check_box", url: "" });
    if (showDonations) specialTabs.push({ linkType: "donation", linkData: "", category: "", text: "Donate", icon: "volunteer_activism", url: "" });
    if (showDirectory) specialTabs.push({ linkType: "directory", linkData: "", category: "", text: "Member Directory", icon: "groups", url: "" });
    if (showPlans) specialTabs.push({ linkType: "plans", linkData: "", category: "", text: "Plans", icon: "event", url: "" });
    if (showLessons) specialTabs.push({ linkType: "lessons", linkData: "", category: "", text: "Lessons", icon: "school", url: "" });
    if (showChums)
      specialTabs.push({ linkType: "url", linkData: "", category: "", text: "Chums", icon: "account_circle", url: "https://app.chums.org/login?jwt=" + uc.jwt + "&churchId=" + uc.church?.id });
    return specialTabs;
  };

  const getMemberData = async (personId: any) => {
    if (personId)
      ApiHelper.get("/people/" + personId, "MembershipApi").then(data => {
        setUserProfile(data.photo);
      });
  };

  const logoutAction = async () => {
    await AsyncStorage.getAllKeys()
      .then(keys => AsyncStorage.multiRemove(keys.filter(key => key != "CHURCH_DATA")))
      .then(() => RNRestart.Restart());
  };

  const listItem = (topItem: boolean, item: any) => {
    if (item.linkType === "separator") {
      return <Divider style={{ marginVertical: spacing.sm }} />;
    }

    const icon = item.icon ? item.icon.split("_").join("-") : "";
    const iconName = icon === "calendar-month" ? "calendar-today" : icon === "local-library-outlined" ? "local-library" : icon;

    return (
      <List.Item
        title={item.text}
        left={() => (topItem ? <Image source={item.image} style={styles.tabIcon} /> : <MaterialIcons name={iconName} size={24} color={paperTheme.colors.primary} style={styles.drawerIcon} />)}
        onPress={() => {
          NavigationHelper.navigateToScreen(item, router.navigate);
          props.navigation.closeDrawer();
        }}
        style={[styles.listItem, { paddingLeft: 20 }]}
        titleStyle={styles.listItemText}
      />
    );
  };

  const drawerHeaderComponent = () => (
    <Surface style={styles.headerContainer} elevation={1}>
      {getUserInfo()}
      <Button
        mode="outlined"
        onPress={() => router.navigate("/(drawer)/churchSearch")}
        style={styles.churchButton}
        icon={() => <MaterialIcons name={churchEmpty ? "search" : "church"} size={24} color={paperTheme.colors.primary} />}>
        {churchEmpty ? "Find your church..." : churchName}
      </Button>
    </Surface>
  );

  const getUserInfo = () => {
    if (!UserHelper.currentUserChurch?.person || !user) return null;

    return (
      <Card style={styles.userCard}>
        <Card.Content style={styles.userCardContent}>
          <View style={styles.userInfoContainer}>
            <View style={styles.avatarContainer}>
              {UserHelper.currentUserChurch.person.photo ? (
                <Avatar.Image size={DimensionHelper.wp(12)} source={{ uri: EnvironmentHelper.ContentRoot + UserHelper.currentUserChurch.person.photo }} />
              ) : (
                <Avatar.Text size={DimensionHelper.wp(12)} label={`${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`} />
              )}
            </View>
            <View style={styles.userTextContainer}>
              <Text variant="titleMedium" numberOfLines={2} style={styles.userName}>
                {`${user.firstName} ${user.lastName}`}
              </Text>
              <View style={styles.buttonContainer}>
                <Button
                  mode="text"
                  onPress={editProfileAction}
                  style={styles.editProfileButton}
                  textColor={paperTheme.colors.primary}
                  icon={() => <MaterialIcons name="edit" size={18} color={paperTheme.colors.primary} />}>
                  Profile
                </Button>
                {UserHelper.user && (
                  <TouchableRipple style={styles.messageButton} onPress={() => router.navigate("/(drawer)/searchMessageUser")}>
                    <MaterialCommunityIcons name="email-outline" size={20} color={paperTheme.colors.onSurface} />
                  </TouchableRipple>
                )}
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const editProfileAction = () => {
    let url = "https://app.chums.org/login?returnUrl=/profile";
    if (UserHelper.currentUserChurch.jwt) url += "&jwt=" + UserHelper.currentUserChurch.jwt;
    Linking.openURL(url);
    logoutAction();
  };

  const drawerFooterComponent = () => {
    const pkg = require("../../package.json");
    return (
      <Surface style={styles.footerContainer} elevation={1}>
        <Button
          mode="outlined"
          onPress={UserHelper.user ? logoutAction : () => router.navigate("/auth/login")}
          style={styles.logoutButton}
          icon={() => <MaterialIcons name={UserHelper.user ? "logout" : "login"} size={24} color={paperTheme.colors.primary} />}>
          {UserHelper.user ? "Log out" : "Login"}
        </Button>
        <Text variant="bodySmall" style={styles.versionText}>
          Version {pkg.version}
        </Text>
      </Surface>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {drawerHeaderComponent()}
        {drawerList.map((item, index) => (
          <View key={item.id || index}>{listItem(false, item)}</View>
        ))}
        {drawerFooterComponent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa"
  },
  headerContainer: {
    padding: 16,
    backgroundColor: "white",
    marginBottom: 8
  },
  userCard: {
    marginBottom: 16,
    backgroundColor: "white"
  },
  userCardContent: {
    padding: 12
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12
  },
  avatarContainer: {
    marginTop: 4
  },
  userTextContainer: {
    flex: 1,
    minWidth: 0
  },
  userName: {
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  editProfileButton: {
    margin: 0,
    padding: 0,
    minWidth: 0,
    height: 32
  },
  messageButton: {
    padding: 4
  },
  churchButton: {
    marginTop: 8
  },
  listItem: {
    paddingVertical: 8
  },
  tabIcon: {
    width: 24,
    height: 24,
    marginRight: 8
  },
  footerContainer: {
    padding: 16,
    marginTop: 8,
    backgroundColor: "white"
  },
  logoutButton: {
    marginBottom: 8
  },
  versionText: {
    textAlign: "center",
    color: "#a0d3fc"
  },
  drawerIcon: {
    marginRight: 8,
    alignSelf: "center"
  },
  listItemText: {
    fontSize: 16,
    fontWeight: "500"
  }
});
