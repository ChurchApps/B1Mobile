import { ApiHelper, DimensionHelper } from "@churchapps/mobilehelper";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Linking, Text, TouchableOpacity, View } from 'react-native';
import RNRestart from 'react-native-restart';
import MessageIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CacheHelper, Constants, EnvironmentHelper, UserHelper, globalStyles } from '../helpers';
import { ErrorHelper } from '../helpers/ErrorHelper';
import { NavigationHelper } from '../helpers/NavigationHelper';

export function CustomDrawer(props: any) {
  const { navigate, goBack, openDrawer } = props.navigation;
  const [churchName, setChurchName] = useState('');
  const [churchEmpty, setChurchEmpty] = useState(true);
  const [drawerList, setDrawerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState('');

  const menuList: any[] = [];

  useEffect(() => {
    getChurch();
  }, [props.navigation])

  const getChurch = async () => {
    try {
      if (UserHelper.user) setUser(UserHelper.user);

      if (CacheHelper.church !== null) {
        setChurchName(CacheHelper.church.name ?? "")
        setChurchEmpty(false)
        getDrawerList(CacheHelper.church.id);
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

  const getDrawerList = (churchId: any) => {
    setLoading(true);
    ApiHelper.getAnonymous("/links/church/" + churchId + "?category=b1Tab", "ContentApi").then(data => {
      setLoading(false);
      console.log("drawer data is -=--->", data)
      if (UserHelper.currentUserChurch)
        {
          let showPlans = false;
          UserHelper.currentUserChurch.groups.forEach(group => {
            console.log("TAGS", group.tags)
            if (group.tags.indexOf("team")>-1) showPlans = true;
          });
          if (showPlans)
            console.log(showPlans)
          data.push({
            "category": "b1Tab",
            "churchId": churchId,
            "icon": "calendar-month",
            "id": "", // You may want to change this to a unique ID
            "linkData": "",
            "linkType": "Plans",
            "parentId": null,
            "photo": null,
            "sort": "10",
            "text": "Plans",
            "url": ""
          }); 
        }
      
      setDrawerList(data);
      UserHelper.links = data;
      //if (data.length > 0) navigateToScreen(data[0]);
            navigate('Dashboard')

    });
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
    if (tab_icon === "calendar-month") tab_icon = "calendar-today"; //not sure why this is missing from https://oblador.github.io/react-native-vector-icons/
    //console.log(tab_icon);
    return (

      <TouchableOpacity style={globalStyles.headerView} onPress={() => NavigationHelper.navigateToScreen(item, navigate)}>
        {topItem ? <Image source={item.image} style={globalStyles.tabIcon} /> :
          <Icon name={tab_icon} color={'black'} style={globalStyles.tabIcon} size={DimensionHelper.wp('5%')} />}
        <Text style={globalStyles.tabTitle}>{item.text}</Text>
      </TouchableOpacity>
    );
  }

  const drawerHeaderComponent = () => {
    return (
      <View>
        {getUserInfo()}
        <TouchableOpacity style={[globalStyles.churchBtn, { marginTop: churchEmpty ? DimensionHelper.wp('12%') : user != null ? DimensionHelper.wp('6%') : DimensionHelper.wp('12%') }]} onPress={() => navigate('ChurchSearch', {})}>
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
        <Text style={{ fontSize: DimensionHelper.wp('3.5%'), fontFamily: Constants.Fonts.RobotoRegular, color: '#a0d3fc', marginTop: DimensionHelper.wp('5%'), textAlign: 'center' }}>{'Version ' + pkg.version}</Text>
      </View>
    );
  }

  const getUserInfo = () => {
    if (UserHelper.currentUserChurch?.person && user != null) {
      return (<View>
        <View style={[globalStyles.headerView, { marginTop: DimensionHelper.wp('15%') }]}>
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
          <Text style={{ fontSize: DimensionHelper.wp('3.5%'), fontFamily: Constants.Fonts.RobotoRegular, color: 'white' }}>{'Edit profile'}</Text>
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
      return (<TouchableOpacity style={globalStyles.logoutBtn} onPress={() => navigate('AuthStack')}>
        <Text style={globalStyles.tabTitle}>Login</Text>
      </TouchableOpacity>);
    }
  }

  const messagesView = () => {
    return (
      <TouchableOpacity onPress={() => navigate('SearchMessageUser', {})}>
        <View style={globalStyles.messageRootView}>
          <MessageIcon name={"email"} color={'black'} style={globalStyles.tabIcon} size={DimensionHelper.wp('5%')} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View >
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
