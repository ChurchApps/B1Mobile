import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Text, FlatList, Image, Dimensions, PixelRatio, TouchableOpacity, ScrollView } from 'react-native';
import { LinkInterface, UserHelper, Utilities } from '../helpers';
import { Loader } from '../components';
import { globalStyles } from '../helpers';
import { ImageButton } from '../components/ImageButton';
import { widthPercentageToDP, } from 'react-native-responsive-screen';
import { NavigationHelper } from '../helpers/NavigationHelper';
import { MainHeader } from '../components';
import { Constants, ApiHelper, MessageInterface, UserSearchInterface, ConversationCheckInterface, } from '../helpers';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view'

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

  const wd = (number: string) => {
    let givenWidth = typeof number === "number" ? number : parseFloat(number);
    return PixelRatio.roundToNearestPixel((dimension.width * givenWidth) / 100);
  };

  const hd = (number: string) => {
    let givenWidth = typeof number === "number" ? number : parseFloat(number);
    return PixelRatio.roundToNearestPixel((dimension.height * givenWidth) / 100);
  };

  useEffect(() => {
    getNotifications();
  }, [])

  useEffect(() => {
    if (Chatlist.length > 0 && UserData.length > 0) {
      const merged = [];
      Chatlist.forEach(item1 => {
        const commonId = UserHelper.currentUserChurch.person.id == item1.fromPersonId ? item1.toPersonId : item1.fromPersonId// item1.toPersonId;
        const matchingItem2 = UserData.find(item2 => item2.id === commonId);
        if (matchingItem2) {
          merged.push({
            id: commonId,
            message: item1.conversation.messages[0].content,
            displayName: matchingItem2.name.display,
          });
        }
      });
      setMergedData(merged);
    }
  }, [Chatlist, UserData])

  const getNotifications = () => {
    ApiHelper.get("/notifications/my", "MessagingApi").then((data) => {
      if (data && data.length != 0) {
        setNotificationData(data);
      }
    })
  }
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
    getPreviousConversations();
  }, [])

  useEffect(() => {
    checkRedirect();
  },
    [])

  const getPreviousConversations = () => {
    // setLoading(true);
    ApiHelper.get("/privateMessages", "MessagingApi").then((data: ConversationCheckInterface[]) => {
      console.log("private message api response =====>",data)
      setChatList(data)
      // setLoading(false);
      var userIdList: string[] = []
      if (Object.keys(data).length != 0) {
        userIdList = data.map((e) => UserHelper.currentUserChurch.person.id == e.fromPersonId ? e.toPersonId : e.fromPersonId);
        if (userIdList.length != 0) {
          ApiHelper.get("/people/ids?ids=" + userIdList.join(','), "MembershipApi").then((userData: UserSearchInterface[]) => {
            // setLoading(false);
            for (let i = 0; i < userData.length; i++) {
              const singleUser: UserSearchInterface = userData[i];
              const tempConvo: ConversationCheckInterface | undefined = data.find(x => x.fromPersonId == singleUser.id || x.toPersonId == singleUser.id)
              userData[i].conversationId = tempConvo?.conversationId
            }
            setUserData(userData)
          })
        }
      }
    })
  }

  const renderChatListItems = (item: any, index: number) => {
    let userchatDetails = {
      id: item.id,
      DisplayName: item.displayName
    }
    return (
      <TouchableOpacity onPress={() => props.navigation.navigate('MessagesScreen', { userDetails: userchatDetails })}>
        <View style={[globalStyles.messageContainer, { alignSelf: 'flex-start' }]}>
          <Image source={Constants.Images.ic_user} style={[globalStyles.churchListIcon, { tintColor: Constants.Colors.app_color, height: widthPercentageToDP('9%'), width: widthPercentageToDP('9%') }]} />
          <View>
            <Text style={[globalStyles.senderNameText, { alignSelf: 'flex-start' }]}>
              {item.displayName}
            </Text>
            <View style={[globalStyles.messageView, {
              width: item.message.length > 15 ? widthPercentageToDP('65%') : widthPercentageToDP((item.message.length + 14).toString() + "%"),
              alignSelf: 'flex-start'
            }]}>
              <Text>{item.message}</Text>
            </View>
          </View>

        </View>
      </TouchableOpacity>

    )
  }
  const renderItems = (item: any, index: number) => {
    return (
      <View style={globalStyles.NotificationView}>
        <View style={globalStyles.bellIconView}><Image source={Constants.Images.dash_bell} style={globalStyles.bellIcon} /></View>
        <View style={globalStyles.notimsgView}><Text style={globalStyles.NotificationText}>{item.message}</Text>
        </View>
      </View>
    )
  }

  const LeftComponent = (
    <TouchableOpacity onPress={() => openDrawer()}>
      <Image source={Constants.Images.ic_menu} style={globalStyles.menuIcon} />
    </TouchableOpacity>);

  const mainComponent = (<Text style={globalStyles.headerText}>Home</Text>);

  const RightComponent = (
    <TouchableOpacity onPress={() => { toggleTabView() }}>
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

  const renderLabel = ({ route, focused, color }) => {
    return (
      <View>
        <Text style={[focused ? globalStyles.activeTabTextColor : globalStyles.tabTextColor]}>
          {route.title}
        </Text>
      </View>
    )
  }

  const MessagesRoute = () => (
    <View style={globalStyles.MessagetabView}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={mergeData}
        renderItem={({ item, index }) => renderChatListItems(item, index)}
        keyExtractor={(item: any) => item.id}
        ItemSeparatorComponent={({ item }) => <View style={globalStyles.cardListSeperator} />}
      />
    </View>
  );

  const NotificationRoute = () => (
    <View style={globalStyles.NotificationtabView} >
      <FlatList
        showsVerticalScrollIndicator={false}
        data={NotificationData}
        renderItem={({ item, index }) => renderItems(item, index)}
        keyExtractor={(item: any) => item.id}
        ItemSeparatorComponent={({ item }) => <View style={globalStyles.cardListSeperator} />}
      /></View>
  );

  const renderScene = SceneMap({
    first: MessagesRoute,
    second: NotificationRoute,
  });

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
          <View style={globalStyles.tabBar}>
            <TabView
              navigationState={{ index, routes }}
              renderScene={renderScene}
              onIndexChange={setIndex}
              swipeEnabled={false}
              renderTabBar={props => <TabBar renderLabel={renderLabel}{...props} indicatorStyle={{ backgroundColor: Constants.Colors.Active_TabColor }} style={globalStyles.TabIndicatorStyle}/>}
              initialLayout={{ width: wd('100'), height: hd('200') }}
              sceneContainerStyle={{ marginTop: 0 }}
            />

          </View>
          : null
      }
    </SafeAreaView>
  );
};


