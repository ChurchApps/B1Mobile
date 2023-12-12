import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Text, FlatList, Image, Dimensions, PixelRatio, TouchableOpacity, ScrollView } from 'react-native';
import { LinkInterface, UserHelper, Utilities, EnvironmentHelper } from '../helpers';
import { Loader } from '../components';
import { globalStyles } from '../helpers';
import { ImageButton } from '../components/ImageButton';
import { widthPercentageToDP, } from 'react-native-responsive-screen';
import { NavigationHelper } from '../helpers/NavigationHelper';
import { MainHeader } from '../components';
import { Constants, ApiHelper, MessageInterface, UserSearchInterface, ConversationCheckInterface, } from '../helpers';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view'
import { NotificationTab } from '../components';

interface Props {
  navigation: {
    navigate: (screenName: string, params: any) => void;
    goBack: () => void;
    openDrawer: () => void;
  };
}

export const DashboardScreen = (props: Props) => {
  const { navigate, goBack, openDrawer } = props.navigation;
  const [isLoading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [NotificationModal, setNotificationModal] = useState(false);
  const [NotificationData, setNotificationData] = useState([])
  const [Chatlist, setChatList] = useState([])
  const [UserData, setUserData] = useState([])
  const [mergeData, setMergedData] = useState([])
  const [dimension, setDimension] = useState(Dimensions.get('screen'));
  const [routes] = React.useState([
    { key: 'first', title: 'MESSAGES' },
    { key: 'second', title: 'NOTIFICATIONS' },
  ]);

  useEffect(() => {
    Dimensions.addEventListener('change', () => {
      const dim = Dimensions.get('screen')
      setDimension(dim);
    })
    UserHelper.addOpenScreenEvent('Dashboard');
  }, [])

  useEffect(() => {
  }, [dimension])

  useEffect(() => {
    checkRedirect();
  },
    [])

  const LeftComponent = (
    <TouchableOpacity onPress={() => openDrawer()}>
      <Image source={Constants.Images.ic_menu} style={globalStyles.menuIcon} />
    </TouchableOpacity>);

  const mainComponent = (<Text style={globalStyles.headerText}>Home</Text>);

  const RightComponent = (
    <TouchableOpacity onPress={() => toggleTabView()}>
      <Image source={Constants.Images.dash_bell} style={globalStyles.menuIcon} />
    </TouchableOpacity>
  );

  const checkRedirect = () => {
    if (!UserHelper.currentUserChurch) props.navigation.navigate("ChurchSearch", {})
    else Utilities.trackEvent("Dashboard Screen");
  }

  const toggleTabView = () => {
    setNotificationModal(!NotificationModal);
  };

  const getButton = (topItem: boolean, item: LinkInterface) => {
    let img = require("../assets/images/dash_worship.png"); //https://www.pexels.com/photo/man-raising-his-left-hand-2351722/
    if (item.photo) {
      img = { uri: item.photo }
    } else {
      switch (item.linkType) {
        case "url":
          img = require("../assets/images/dash_url.png"); //https://www.pexels.com/photo/selective-focus-photography-of-macbook-pro-with-turned-on-screen-on-brown-wooden-table-68763/
          break;
        case "directory":
          img = require("../assets/images/dash_directory.png"); //https://www.pexels.com/photo/smiling-women-and-men-sitting-on-green-grass-1231230/
          break;
        case "checkin":
          img = require("../assets/images/dash_checkin.png"); //https://www.pexels.com/photo/silver-imac-apple-magic-keyboard-and-magic-mouse-on-wooden-table-38568/
          break;
        case "donation":
          img = require("../assets/images/dash_donation.png"); //https://www.pexels.com/photo/person-s-holds-brown-gift-box-842876/
          break;
        case "lessons":
          img = require("../assets/images/dash_lessons.png"); //https://www.pexels.com/photo/children-sitting-on-brown-wooden-chairs-8088103/
          break;
        case "bible":
          img = require("../assets/images/dash_bible.png"); //https://www.pexels.com/photo/pink-pencil-on-open-bible-page-and-pink-272337/
          break;
        case "votd":
          img = require("../assets/images/dash_votd.png"); //https://www.pexels.com/photo/empty-gray-road-under-white-clouds-3041347/
          break;
      }
    }
    return (<ImageButton image={img} text={item.text} onPress={() => NavigationHelper.navigateToScreen(item, navigate)} />);
  }

  const getButtons = () => {
    return <FlatList data={UserHelper.links} renderItem={({ item }) => getButton(false, item)} keyExtractor={(item: any) => item.id} />
  }

  const getBrand = () => {
    if (UserHelper.churchAppearance?.logoLight) return <Image source={{ uri: UserHelper.churchAppearance?.logoLight }} style={{ width: "100%", height: widthPercentageToDP(25) }} />
    else return <Text style={{ fontSize: 20, width: "100%", textAlign: "center", marginTop: 0 }}>{UserHelper.currentUserChurch?.church?.name}</Text>
  }

  return (
    <SafeAreaView style={globalStyles.homeContainer} >
      <MainHeader leftComponent={LeftComponent} mainComponent={mainComponent} rightComponent={RightComponent} />
      <View style={globalStyles.webViewContainer}>
        {getBrand()}

        {getButtons()}
      </View>
      {isLoading && <Loader isLoading={isLoading} />}

      {
        NotificationModal ?
          <NotificationTab />
          : null
      }
    </SafeAreaView>
  );
};


