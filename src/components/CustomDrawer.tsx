import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, FlatList, Alert, ActivityIndicator, Platform } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ApiHelper, Constants } from '../helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { globalStyles, EnvironmentHelper, UserHelper } from '../helpers';
import { Permissions } from '../interfaces';
import RNRestart from 'react-native-restart';
import { NavigationHelper } from '../helpers/NavigationHelper';
import { ScrollView } from 'react-native-gesture-handler';


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

  const getDrawerList = (churchId: any) => {
    setLoading(true);
    ApiHelper.getAnonymous("/links/church/" + churchId + "?category=tab", "B1Api").then(data => {
      setLoading(false);
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
      .then(keys => AsyncStorage.multiRemove(keys))
      .then(() => RNRestart.Restart());
  }

  const listItem = (topItem: boolean, item: any) => {
    var tab_icon = item.icon != undefined ? item.icon.split("_").join("-") : '';
    if (tab_icon === "calendar-month") tab_icon = "calendar-today"; //not sure why this is missing from https://oblador.github.io/react-native-vector-icons/
    //console.log(tab_icon);

    return (

      <TouchableOpacity style={globalStyles.headerView} onPress={() => NavigationHelper.navigateToScreen(item, navigate)}>
        {topItem ? <Image source={item.image} style={globalStyles.tabIcon} /> :
          <Icon name={tab_icon} color={'black'} style={globalStyles.tabIcon} size={wp('5%')} />}
        <Text style={globalStyles.tabTitle}>{item.text}</Text>
      </TouchableOpacity>
    );
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

  const getUserInfo = () => {
    if (UserHelper.person) {
      return (<View style={globalStyles.headerView}>
        <Image source={{ uri: EnvironmentHelper.ContentRoot + UserHelper.person?.photo || "" }} style={globalStyles.userIcon} />
        <Text style={globalStyles.userNameText}>{user != null ? `${user.firstName} ${user.lastName}` : ''}</Text>
      </View>)
    }
  }

  return (
    <SafeAreaView >
      <ScrollView>
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
      </ScrollView>
    </SafeAreaView>

  );
};
