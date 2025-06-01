import { CacheHelper, Constants, EnvironmentHelper, UserHelper, globalStyles } from '@/src/helpers';
import { ErrorHelper } from '@/src/helpers/ErrorHelper';
import { NavigationHelper } from '@/src/helpers/NavigationHelper';
import { ApiHelper, LinkInterface, Permissions } from "@churchapps/mobilehelper";
import MessageIcon from '@expo/vector-icons/MaterialCommunityIcons';
import Icon from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Linking, Text, TouchableOpacity, View } from 'react-native';
import RNRestart from 'react-native-restart';
import { DimensionHelper } from '../helpers/DimensionHelper';

export function CustomDrawer(props: any) {
  const { goBack, openDrawer } = props.navigation;
  const [churchName, setChurchName] = useState('');
  const [churchEmpty, setChurchEmpty] = useState(true);
  const [drawerList, setDrawerList] = useState<LinkInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState('');

  const menuList: any[] = [];

  useEffect(() => {
    getChurch();
    updateDrawerList();
  }, [props.navigation])

  const getChurch = async () => {
    try {
      if (UserHelper.user) setUser(UserHelper.user);

      if (CacheHelper.church !== null) {
        setChurchName(CacheHelper.church.name ?? "")
        setChurchEmpty(false)
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
  }

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
    const data = tabs.concat(specialTabs)

    //setLoading(false);
    setDrawerList(data);
    UserHelper.links = data;
    setLoading(false);
    if (data.length > 0) {
      if (data[0].linkType === "groups") router.navigate('/(drawer)/myGroups');
      else router.navigate('/(drawer)/dashboard')
    }

    //if (data.length > 0) navigate(data[0].linkType);
    //if (data.length > 0) navigateToScreen(data[0]);
    //router.navigate('/(drawer)/dashboard')


  }


  const getSpecialTabs = async () => {
    let specialTabs: LinkInterface[] = [];
    let showWebsite = false, showDonations = false, showMyGroups = false, showPlans = false, showDirectory = false, showLessons = false, showChums = false, showCheckin;
    const uc = UserHelper.currentUserChurch;

    if (CacheHelper.church) {
      const page = await ApiHelper.getAnonymous("/pages/" + CacheHelper.church.id + "/tree?url=/", "ContentApi")
      if (page.url) showWebsite = true;
      const gateways = await ApiHelper.getAnonymous("/gateways/churchId/" + CacheHelper.church.id, "GivingApi");
      if (gateways.length > 0) showDonations = true;

    }

    if (uc?.person) {
      try {
        const classrooms = await ApiHelper.get("/classrooms/person", "LessonsApi");
        showLessons = classrooms.length > 0;
      } catch { }
      try {
        const campuses = await ApiHelper.get("/campuses", "AttendanceApi");
        showCheckin = campuses.length > 0;
      } catch { }
      showChums = UserHelper.checkAccess(Permissions.membershipApi.people.edit);
      const memberStatus = uc.person?.membershipStatus?.toLowerCase();
      showDirectory = memberStatus === "member" || memberStatus === "staff";
      uc.groups.forEach(group => {
        if (group.tags.indexOf("team") > -1) showPlans = true;
      });
      showMyGroups = uc?.groups?.length > 0;
    }
    specialTabs.push({ linkType: 'separator', linkData: "", category: "", text: '', icon: '', url: "" });
    if (showWebsite) specialTabs.push({ linkType: "url", linkData: "", category: "", text: 'Website', icon: 'home', url: EnvironmentHelper.B1WebRoot.replace("{subdomain}", CacheHelper.church!.subDomain || "") });
    if (showMyGroups) specialTabs.push({ linkType: "groups", linkData: "", category: "", text: 'My Groups', icon: 'group', url: "" });
    if (showCheckin) specialTabs.push({ linkType: "checkin", linkData: "", category: "", text: 'Check In', icon: 'check_box', url: "" });
    if (showDonations) specialTabs.push({ linkType: "donation", linkData: "", category: "", text: 'Donate', icon: 'volunteer_activism', url: "" });
    if (showDirectory) specialTabs.push({ linkType: "directory", linkData: "", category: "", text: 'Member Directory', icon: 'groups', url: "" });
    if (showPlans) specialTabs.push({ linkType: "plans", linkData: "", category: "", text: 'Plans', icon: 'event', url: "" });
    if (showLessons) specialTabs.push({ linkType: "lessons", linkData: "", category: "", text: 'Lessons', icon: 'school', url: "" });
    if (showChums) specialTabs.push({ linkType: "url", linkData: "", category: "", text: 'Chums', icon: 'account_circle', url: "https://app.chums.org/login?jwt=" + uc.jwt + "&churchId=" + uc.church?.id });
    return specialTabs;
  }

  const getMemberData = async (personId: any) => {
    if (personId) ApiHelper.get("/people/" + personId, "MembershipApi").then(data => { setUserProfile(data.photo); });
  }

  const logoutAction = async () => {
    await AsyncStorage.getAllKeys()
      .then((keys) => AsyncStorage.multiRemove(keys.filter((key) => key != "CHURCH_DATA")))
      .then(() => RNRestart.Restart());
  }

  const listItem = (topItem: boolean, item: any) => {
    var tab_icon = item.icon != undefined ? item.icon.split("_").join("-") : '';
    if (tab_icon === "calendar-month") {
      tab_icon = "calendar-today";
    } else if (tab_icon === "local-library-outlined") {
      tab_icon = "local-library";
    }
    if (item.linkType == 'separator') {
      return (
        <View style={[globalStyles.BorderSeparatorView, { width: '100%', borderColor: '#175ec1' }]} />
      )
    }
    return (
      <TouchableOpacity style={globalStyles.headerView} onPress={() => { NavigationHelper.navigateToScreen(item, router.navigate), props.navigation.closeDrawer() }}>
        {topItem ? <Image source={item.image} style={globalStyles.tabIcon} /> :
          <Icon name={tab_icon} color={'black'} style={globalStyles.tabIcon} size={DimensionHelper.wp(5)} />}
        <Text style={globalStyles.tabTitle}>{item.text}</Text>
      </TouchableOpacity>
    );
  }

  const drawerHeaderComponent = () => {
    return (
      <View>
        {getUserInfo()}
        <TouchableOpacity style={[globalStyles.churchBtn, { marginTop: churchEmpty ? DimensionHelper.wp(12) : user != null ? DimensionHelper.wp(6) : DimensionHelper.wp(12) }]} onPress={() => router.navigate('/(drawer)/churchSearch')}>
          {churchEmpty && <Image source={Constants.Images.ic_search} style={globalStyles.searchIcon} />}
          <Text style={{ ...globalStyles.churchText }}>
            {churchEmpty ? 'Find your church...' : churchName}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const drawerFooterComponent = () => {
    let pkg = require('../../package.json');
    return (
      <View>
        {loginOutToggle()}
        <Text style={{ fontSize: DimensionHelper.wp(3.5), fontFamily: Constants.Fonts.RobotoRegular, color: '#a0d3fc', marginTop: DimensionHelper.wp(5), textAlign: 'center' }}>{'Version ' + pkg.version}</Text>
      </View>
    );
  }

  const getUserInfo = () => {
    if (UserHelper.currentUserChurch?.person && user != null) {
      return (<View>
        <View style={[globalStyles.headerView, { marginTop: DimensionHelper.wp(15) }]}>
          {(UserHelper.currentUserChurch.person.photo == null || UserHelper.currentUserChurch.person.photo == undefined)
            ? null
            : <Image
              source={{ uri: (EnvironmentHelper.ContentRoot + UserHelper.currentUserChurch.person.photo) || "" }}
              style={globalStyles.userIcon}
            />}
          <Text style={globalStyles.userNameText}>{user != null ? `${user.firstName} ${user.lastName}` : ''}</Text>
          {UserHelper.user ? messagesView() : null}
        </View>
        <TouchableOpacity style={globalStyles.headerView} onPress={() => editProfileAction()}>
          <Text style={{ fontSize: DimensionHelper.wp(3.5), fontFamily: Constants.Fonts.RobotoRegular, color: 'white' }}>{'Edit profile'}</Text>
        </TouchableOpacity>
      </View>)
    }
  }

  const editProfileAction = () => {
    let url = "https://app.chums.org/login?returnUrl=/profile";
    if (UserHelper.currentUserChurch.jwt) url += "&jwt=" + UserHelper.currentUserChurch.jwt;
    Linking.openURL(url);
    logoutAction();
  }

  const loginOutToggle = () => {
    if (UserHelper.user) {
      return (<TouchableOpacity style={globalStyles.logoutBtn} onPress={() => logoutAction()}>
        <Text style={globalStyles.tabTitle}>Log out</Text>
      </TouchableOpacity>);
    } else {
      return (<TouchableOpacity style={globalStyles.logoutBtn} onPress={() => router.navigate('/auth/login')}>
        <Text style={globalStyles.tabTitle}>Login</Text>
      </TouchableOpacity>);
    }
  }

  const messagesView = () => {
    return (
      <TouchableOpacity onPress={() => router.navigate('/(drawer)/searchMessageUser')}>
        <View style={globalStyles.messageRootView}>
          <MessageIcon name={"email"} color={'black'} style={globalStyles.tabIcon} size={DimensionHelper.wp(5)} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View>
      {
        loading ? <ActivityIndicator size='small' color='gray' animating={loading} /> :
          <FlatList
            data={drawerList}
            renderItem={({ item }) => listItem(false, item)}
            keyExtractor={(item: any) => item.id}
            ListHeaderComponent={drawerHeaderComponent()}
            ListFooterComponent={drawerFooterComponent()}
          />
      }
    </View>
  );
};
