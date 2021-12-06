import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, FlatList, Alert, ActivityIndicator, DevSettings } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Constants } from '../helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connect } from 'react-redux';
import { getDrawerList } from '../redux/actions/drawerItemsAction';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { getMemberData } from '../redux/actions/memberDataAction';
import { getToken } from '../helpers/_ApiHelper';
import API from '../helpers/ApiConstants';
import { globalStyles, EnvironmentHelper, UserHelper } from '../helpers';

// interface Props {
//     navigation: {
//         navigate: (screenName: string, params: any) => void;
//         goBack: () => void;
//         openDrawer: () => void;
//     };
//     onPress: () => void;
//     getDrawerItemList: (churchId: String, callback: any) => void;
// }

function Drawer(props: any) {
  const { navigate, goBack, openDrawer } = props.navigation;
  const [churchName, setChurchName] = useState('');
  const [churchEmpty, setChurchEmpty] = useState(true);
  const [drawerList, setDrawerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState('');

  const menuList: any[] = [];

  /*
  const menuList = [{
    id: 1,
    text: 'Bible',
    image: Constants.Images.ic_bible,
    url: 'https://biblegateway.com/'
  }, {
    id: 2,
    text: 'Preferences',
    image: Constants.Images.ic_preferences
  }, {
    id: 3,
    text: 'Members',
    image: Constants.Images.ic_groups
  }, {
    id: 4,
    text: 'Donate',
    image: Constants.Images.ic_give
  }];*/

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
    if (item.linkType == "checkin") navigate('ServiceScreen', {})
    if (item.linkType == "stream") navigate('HomeScreen', { url: "https://" + UserHelper.currentChurch.subDomain + ".streaminglive.church/", title: item.text })
    if (item.linkType == "lessons") navigate('HomeScreen', { url: "https://lessons.church/b1/" + UserHelper.currentChurch.id, title: item.text })
    if (item.linkType == "bible") navigate('HomeScreen', { url: bibleUrl, title: item.text })
    if (item.linkType == "donation") navigate('DonationScreen')
    if (item.linkType == "directory") navigate('MembersSearch')
    if (item.linkType == "url") navigate('HomeScreen', { url: item.url, title: item.text })
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
    props.getDrawerItemList(churchId, (err: any, res: any) => {
      setLoading(false);
      if (!err) {
        if (res.data.length != 0) {
          res.data.forEach((item: any) => {
            if (item.text == 'Home') {
              navigateToScreen(item)
            }
          })
          setDrawerList(res.data)
        } else {
          setDrawerList([])
        }
      } else {
        Alert.alert("Alert", err.message);
      }
    });
  }

  const getMemberData = async (personId: any) => {
    const token = await getToken("MembershipApi")
    if (token !== null) {
      props.getMemberDataApi(personId, token, (err: any, res: any) => {
        if (!err) {
          if (res.data) {
            setUserProfile(res.data.photo)
          }
        } else {
          Alert.alert("Alert", err.message);
        }
      });
    }
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

const mapStateToProps = (state: any) => {
  return {
    drawerlist: state.drawerlist,
    login_data: state.login_data,
    member_data: state.member_data,
  };
};
const mapDispatchToProps = (dispatch: any) => {
  return {
    getDrawerItemList: (churchId: any, callback: any) => dispatch(getDrawerList(churchId, callback)),
    getMemberDataApi: (personId: any, token: any, callback: any) => dispatch(getMemberData(personId, token, callback)),
  }
}

export const CustomDrawer = connect(mapStateToProps, mapDispatchToProps)(Drawer);