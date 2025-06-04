import { CacheHelper, Constants, EnvironmentHelper, UserHelper, globalStyles } from '@/src/helpers'; // Constants needed for Images, Fonts
import { ErrorHelper } from '@/src/helpers/ErrorHelper';
import { NavigationHelper } from '@/src/helpers/NavigationHelper';
import { ApiHelper, LinkInterface, Permissions } from "@churchapps/mobilehelper";
// MessageIcon and Icon are replaced by Paper.Icon or Drawer.Item icon prop
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, usePathname } from 'expo-router'; // usePathname to determine active route
import { useEffect, useState } from 'react';
import { FlatList, Image, Linking, View, StyleSheet } from 'react-native'; // Text, TouchableOpacity, ActivityIndicator removed
import RNRestart from 'react-native-restart';
import { DimensionHelper } from '../helpers/DimensionHelper';
import { ActivityIndicator as PaperActivityIndicator, Avatar, Button as PaperButton, Text as PaperText, useTheme, Drawer, Divider } from 'react-native-paper';

export function CustomDrawer(props: any) {
  const theme = useTheme();
  const pathname = usePathname(); // Get current route to set active Drawer.Item
  // const { goBack, openDrawer } = props.navigation; // Not directly used, props.navigation passed to navigateToScreen
  const [churchName, setChurchName] = useState('');
  const [churchEmpty, setChurchEmpty] = useState(true);
  const [drawerList, setDrawerList] = useState<LinkInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  // const [userProfile, setUserProfile] = useState(''); // Seems unused, original getMemberData only set this

  // Logic for getChurch, updateDrawerList, getSpecialTabs, getMemberData, logoutAction, editProfileAction remains mostly the same
  // Minor adjustments for API responses and ensuring arrays are initialized for map/filter
  useEffect(() => {
    setLoading(true); // Start loading when component mounts or navigation changes
    getChurch();
    updateDrawerList();
  }, [props.navigation]); // Original dependencies

  const getChurch = async () => { /* ... original logic ... */
    try {
      if (UserHelper.user) setUser(UserHelper.user);
      if (CacheHelper.church) {
        setChurchName(CacheHelper.church.name ?? "");
        setChurchEmpty(false);
        if (UserHelper.currentUserChurch?.person?.id) getMemberData(UserHelper.currentUserChurch.person.id);
      }
    } catch (e: any) { ErrorHelper.logError("custom-drawer-getChurch", e); }
  };
  const updateDrawerList = async () => { /* ... original logic, ensure tempTabs, specialTabs default to [] ... */
    let tabs: LinkInterface[] = [];
    if (CacheHelper.church) {
      const tempTabsRaw = await ApiHelper.getAnonymous(`/links/church/${CacheHelper.church?.id}?category=b1Tab`, "ContentApi") || [];
      tempTabsRaw.forEach((tab: LinkInterface) => { /* ... original switch ... */
        switch (tab.linkType) {
          case "groups": case "donation": case "directory": case "plans": case "lessons": case "website": case "checkin": break;
          default: tabs.push(tab); break;
        }
      });
    }
    let specialTabs = await getSpecialTabs() || [];
    const data = [...tabs, ...specialTabs]; // Ensure a new array for state update
    setDrawerList(data);
    UserHelper.links = data; // This global assignment might need review for better state management practice
    setLoading(false);
    // Initial navigation logic seems complex and might conflict with Expo Router's own default route handling.
    // Commenting out for now, ensure default route is handled by Expo Router config.
    // if (data.length > 0) {
    //   if (data[0].linkType === "groups") router.navigate('/(drawer)/myGroups');
    //   else router.navigate('/(drawer)/dashboard');
    // }
  };
  const getSpecialTabs = async (): Promise<LinkInterface[]> => { /* ... original logic, ensure return type and default empty array ... */
    let specialTabs: LinkInterface[] = [];
    let showWebsite = false, showDonations = false, showMyGroups = false, showPlans = false, showDirectory = false, showLessons = false, showChums = false, showCheckin = false;
    const uc = UserHelper.currentUserChurch;
    if (CacheHelper.church) {
      try { const page = await ApiHelper.getAnonymous(`/pages/${CacheHelper.church.id}/tree?url=/`, "ContentApi"); if (page?.url) showWebsite = true; } catch (e) { console.log(e)}
      try { const gateways = await ApiHelper.getAnonymous(`/gateways/churchId/${CacheHelper.church.id}`, "GivingApi"); if (gateways?.length > 0) showDonations = true; } catch (e) { console.log(e)}
    }
    if (uc?.person) { /* ... original permission checks ... */
      try { const classrooms = await ApiHelper.get("/classrooms/person", "LessonsApi"); showLessons = classrooms.length > 0; } catch { }
      try { const campuses = await ApiHelper.get("/campuses", "AttendanceApi"); showCheckin = campuses.length > 0; } catch { }
      showChums = UserHelper.checkAccess(Permissions.membershipApi.people.edit);
      const memberStatus = uc.person?.membershipStatus?.toLowerCase();
      showDirectory = memberStatus === "member" || memberStatus === "staff";
      (uc.groups || []).forEach(group => { if (group.tags.indexOf("team") > -1) showPlans = true; });
      showMyGroups = (uc?.groups || []).length > 0;
    }
    specialTabs.push({ id:"sep", linkType: 'separator', linkData: "", category: "", text: '', icon: '', url: "" }); // Added ID for key
    if (showWebsite) specialTabs.push({ id:"web", linkType: "url", linkData: "", category: "", text: 'Website', icon: 'home', url: EnvironmentHelper.B1WebRoot.replace("{subdomain}", CacheHelper.church!.subDomain || "") });
    if (showMyGroups) specialTabs.push({id:"groups", linkType: "groups", linkData: "", category: "", text: 'My Groups', icon: 'account-group', url: "" }); // Mapped icon
    if (showCheckin) specialTabs.push({ id:"checkin", linkType: "checkin", linkData: "", category: "", text: 'Check In', icon: 'check-all', url: "" }); // Mapped icon
    if (showDonations) specialTabs.push({ id:"donate", linkType: "donation", linkData: "", category: "", text: 'Donate', icon: 'gift', url: "" }); // Mapped icon
    if (showDirectory) specialTabs.push({ id:"directory", linkType: "directory", linkData: "", category: "", text: 'Member Directory', icon: 'card-account-details', url: "" }); // Mapped icon
    if (showPlans) specialTabs.push({ id:"plans", linkType: "plans", linkData: "", category: "", text: 'Plans', icon: 'calendar-check', url: "" }); // Mapped icon
    if (showLessons) specialTabs.push({ id:"lessons", linkType: "lessons", linkData: "", category: "", text: 'Lessons', icon: 'school', url: "" });
    if (showChums) specialTabs.push({ id:"chums",linkType: "url", linkData: "", category: "", text: 'Chums', icon: 'account-circle', url: "https://app.chums.org/login?jwt=" + uc.jwt + "&churchId=" + uc.church?.id });
    return specialTabs;
  };
  const getMemberData = async (personId: any) => { if (personId) ApiHelper.get(`/people/${personId}`, "MembershipApi").then(data => { /* setUserProfile(data.photo); */ }); }; // setUserProfile was unused
  const logoutAction = async () => { await AsyncStorage.getAllKeys().then((keys) => AsyncStorage.multiRemove(keys.filter((key) => key !== "CHURCH_DATA"))).then(() => RNRestart.Restart()); };
  const editProfileAction = () => { /* ... original logic ... */
    let url = "https://app.chums.org/login?returnUrl=/profile";
    if (UserHelper.currentUserChurch?.jwt) url += "&jwt=" + UserHelper.currentUserChurch.jwt;
    Linking.openURL(url);
    logoutAction(); // This seems to log out immediately after opening link, might be unintentional.
  };

  const mapIcon = (iconName: string | undefined) => {
    if (!iconName) return 'circle-medium'; // Default icon
    const MDIconName = iconName.replace(/_/g, '-');
    // Add more specific mappings if needed, e.g., 'volunteer_activism' -> 'gift'
    switch (MDIconName) {
      case 'group': return 'account-group';
      case 'check-box': return 'check-all';
      case 'volunteer-activism': return 'gift';
      case 'groups': return 'card-account-details-outline'; // Example, if 'groups' icon for directory
      case 'event': return 'calendar-check';
      case 'school': return 'school-outline';
      case 'account-circle': return 'account-circle-outline';
      case 'home': return 'home-outline';
      default: return MDIconName;
    }
  };

  const listItem = ({ item }: { item: LinkInterface }) => {
    if (item.linkType === 'separator') {
      return <Divider style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />;
    }
    // Determine if the item is active based on current route
    // This is a basic check, might need refinement based on how item.url and item.linkType map to actual routes
    const isActive = pathname.startsWith(`/(drawer)/${item.linkType}`) || (item.url && pathname.includes(item.url));

    return (
      <Drawer.Item
        icon={mapIcon(item.icon)}
        label={item.text}
        active={isActive}
        onPress={() => { NavigationHelper.navigateToScreen(item, router.navigate); props.navigation.closeDrawer(); }}
        style={[styles.drawerItem, isActive && { backgroundColor: theme.colors.primaryContainer }]}
        labelStyle={{ color: isActive ? theme.colors.onPrimaryContainer : theme.colors.onSurface }}
        // theme={{ colors: { secondaryContainer: theme.colors.primaryContainer, onSecondaryContainer: theme.colors.onPrimaryContainer } }} // For active item theming
      />
    );
  };

  const drawerHeaderComponent = () => (
    <View style={styles.headerContainer}>
      {getUserInfo()}
      <PaperButton
        icon="magnify"
        mode="outlined"
        onPress={() => router.navigate('/(drawer)/churchSearch')}
        style={[styles.churchButton, {borderColor: theme.colors.outline}]}
        labelStyle={{color: theme.colors.onSurface}}
        textColor={theme.colors.onSurface} // For icon color
      >
        {churchEmpty ? 'Find your church...' : churchName}
      </PaperButton>
    </View>
  );

  const drawerFooterComponent = () => {
    let pkg = require('../../package.json');
    return (
      <View style={styles.footerContainer}>
        {loginOutToggle()}
        <PaperText variant="labelSmall" style={{ color: theme.colors.onSurfaceDisabled, textAlign: 'center', marginTop: DimensionHelper.wp(5) }}>
          {'Version ' + pkg.version}
        </PaperText>
      </View>
    );
  };

  const getUserInfo = () => {
    if (UserHelper.currentUserChurch?.person && user) { // Ensure user is not null
      return (
        <View style={styles.userInfoContainer}>
          {UserHelper.currentUserChurch.person.photo ? (
            <Avatar.Image
              source={{ uri: EnvironmentHelper.ContentRoot + UserHelper.currentUserChurch.person.photo }}
              size={DimensionHelper.wp(15)} // Adjusted size
              style={styles.userAvatar}
            />
          ) : (
            <Avatar.Icon icon="account-circle" size={DimensionHelper.wp(15)} style={styles.userAvatar} />
          )}
          <PaperText variant="titleMedium" style={[styles.userNameText, { color: theme.colors.onSurface }]}>
            {`${user.firstName} ${user.lastName}`}
          </PaperText>
          <View style={{flexDirection:'row', justifyContent:'space-around', width:'100%'}}>
            <PaperButton mode="text" onPress={editProfileAction} textColor={theme.colors.primary}>Edit Profile</PaperButton>
            {messagesView()}
          </View>
        </View>
      );
    }
    return null;
  };

  const loginOutToggle = () => {
    if (UserHelper.user) {
      return (
        <PaperButton mode="outlined" onPress={logoutAction} style={styles.authButton} textColor={theme.colors.primary}>
          Log Out
        </PaperButton>
      );
    } else {
      return (
        <PaperButton mode="contained" onPress={() => router.navigate('/auth/login')} style={styles.authButton}>
          Login
        </PaperButton>
      );
    }
  };

  const messagesView = () => (
    <PaperIconButton icon="email" iconColor={theme.colors.primary} size={DimensionHelper.wp(5)} onPress={() => router.navigate('/(drawer)/searchMessageUser')} />
  );

  const styles = StyleSheet.create({
    drawerItem: { marginVertical: 2 },
    headerContainer: { padding: theme.spacing?.md, borderBottomWidth: 1, borderBottomColor: theme.colors.outlineVariant },
    userInfoContainer: { alignItems: 'center', marginBottom: theme.spacing?.md },
    userAvatar: { marginBottom: theme.spacing?.sm },
    userNameText: { marginVertical: theme.spacing?.xs },
    churchButton: { marginTop: theme.spacing?.md, borderColor: theme.colors.outline },
    footerContainer: { padding: theme.spacing?.md, borderTopWidth: 1, borderTopColor: theme.colors.outlineVariant },
    authButton: { marginTop: theme.spacing?.sm },
    divider: { marginVertical: theme.spacing?.xs },
    activityIndicator: { flex: 1, justifyContent: 'center', alignItems: 'center'},
    mainContainer: { flex: 1, backgroundColor: theme.colors.surface } // For root View
  });

  return (
    <View style={styles.mainContainer}>
      {loading ? (
        <View style={styles.activityIndicator}><PaperActivityIndicator animating={true} color={theme.colors.primary} /></View>
      ) : (
        <Drawer.Section style={{flexGrow:1}}>
          <FlatList
            data={drawerList}
            renderItem={listItem}
            keyExtractor={(item) => item.id || item.text} // Ensure unique key
            ListHeaderComponent={drawerHeaderComponent}
            ListFooterComponent={drawerFooterComponent}
            showsVerticalScrollIndicator={false}
          />
        </Drawer.Section>
      )}
    </View>
  );
}
