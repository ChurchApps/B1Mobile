import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, FlatList, Alert, ActivityIndicator, DevSettings } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ApiHelper, Constants } from '../helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { globalStyles, EnvironmentHelper, UserHelper } from '../helpers';
import { Permissions } from '../interfaces';

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
      const user = await AsyncStorage.getItem('USER_DATA')
      if (user !== null) {
        setUser(JSON.parse(user))
      }
      const churchvalue = await AsyncStorage.getItem('CHURCH_DATA')
      if (churchvalue !== null) {
        const churchData = JSON.parse(churchvalue);
        setChurchName(churchData.name)
        setChurchEmpty(false)
        getDrawerList(churchData.id);
        getMemberData(churchData.personId);
      }

    } catch (e) {
      console.log(e)
    }
  }

  const navigateToScreen = (item: any) => {
    const bibleUrl = "https://biblia.com/api/plugins/embeddedbible?layout=normal&historyButtons=false&resourcePicker=false&shareButton=false&textSizeButton=false&startingReference=Ge1.1&resourceName=nirv";
    if (item.linkType == "stream") navigate('StreamScreen', { url: EnvironmentHelper.StreamingLiveRoot.replace("{subdomain}", UserHelper.currentChurch.subDomain || ""), title: item.text })
    if (item.linkType == "lessons") navigate('LessonsScreen', { url: EnvironmentHelper.LessonsRoot + "/b1/" + UserHelper.currentChurch.id, title: item.text })
    if (item.linkType == "bible") navigate('BibleScreen', { url: bibleUrl, title: item.text })
    if (item.linkType == "donation") navigate('DonationScreen')
    if (item.linkType == "url") navigate('WebsiteScreen', { url: item.url, title: item.text })
    if (item.linkType == "page") navigate('PageScreen', { url: item.url, title: item.text })
    if (item.linkType == "directory") {
      if (!UserHelper.person) Alert.alert("Alert", "You must be logged in to access this page.")
      else if (!UserHelper.checkAccess(Permissions.membershipApi.people.viewMembers)) Alert.alert("Alert", "Your account does not have permission to view the member directory.  Please contact your church staff to request access.")
      else navigate('MembersSearch')
    }
    if (item.linkType == "checkin") {
      if (!UserHelper.person) Alert.alert("Alert", "You must be logged in to access this page.")
      else navigate('ServiceScreen', {})
    }

    /*
    else {
      //TODO: Add "pages"
      if (item.url && item.url != '') {
        navigate('HomeScreen', { url: item.url, title: item.text })
      }
      
    }*/
  }

  const getDrawerList = (churchId: any) => {
    setLoading(true);
    ApiHelper.get("/links/church/" + churchId + "?category=tab", "B1Api").then(data => {
      setLoading(false);
      setDrawerList(data);
      if (data.length > 0) navigateToScreen(data[0]);
    });
  }

  const getMemberData = async (personId: any) => {
    if (personId) ApiHelper.get("/people/" + personId, "MembershipApi").then(data => { setUserProfile(data.photo); });
  }

  const logoutAction = async () => {
    await AsyncStorage.getAllKeys()
      .then(keys => AsyncStorage.multiRemove(keys))
      .then(() => DevSettings.reload());
  }

  const listItem = (topItem: boolean, item: any) => {
    var tab_icon = item.icon != undefined ? item.icon.slice(7) : '';
    return (
      <TouchableOpacity style={globalStyles.headerView} onPress={() => navigateToScreen(item)}>
        {topItem ? <Image source={item.image} style={globalStyles.tabIcon} /> :
          <Icon name={tab_icon} color={'black'} style={globalStyles.tabIcon} size={wp('6%')} />}
        <Text style={globalStyles.tabTitle}>{item.text}</Text>
      </TouchableOpacity>
    );
  }

  const loginOutToggle = () => {
    if (UserHelper.person) {
      return (<TouchableOpacity style={globalStyles.logoutBtn} onPress={() => logoutAction()}>
        <Text style={globalStyles.drawerText}>Log out</Text>
      </TouchableOpacity>);
    } else {
      return (<TouchableOpacity style={globalStyles.logoutBtn} onPress={() => navigate('AuthStack')}>
        <Text style={globalStyles.drawerText}>Login</Text>
      </TouchableOpacity>);
    }
  }

  const getUserInfo = () => {
    if (UserHelper.person) {
      return (<View style={globalStyles.headerView}>
        <Image source={{ uri: EnvironmentHelper.ContentRoot + UserHelper.person?.photo || "" }} style={globalStyles.userIcon} />
        <Text style={globalStyles.userNameText}>{user != null ? `${user.firstName} ${user.lastName}` : ''}</Text>
      </View>)
    }
  }

  return (
    <SafeAreaView>
      {getUserInfo()}
      <FlatList data={menuList} renderItem={({ item }) => listItem(true, item)} keyExtractor={(item: any) => item.id} />

      <TouchableOpacity style={globalStyles.churchBtn} onPress={() => navigate('ChurchSearch', {})}>
        {churchEmpty && <Image source={Constants.Images.ic_search} style={globalStyles.searchIcon} />}
        <Text style={{ ...globalStyles.churchText }}>
          {churchEmpty ? 'Find your church...' : churchName}
        </Text>
      </TouchableOpacity>

      {
        loading ? <ActivityIndicator size='small' color='gray' animating={loading} /> :
          <FlatList data={drawerList} renderItem={({ item }) => listItem(false, item)} keyExtractor={(item: any) => item.id} />
      }
      {loginOutToggle()}
    </SafeAreaView>

  );
};
