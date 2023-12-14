import React, { useState, useEffect, } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, Dimensions, SafeAreaView, PixelRatio } from 'react-native';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import { ApiHelper, UserHelper, UserSearchInterface, ConversationCheckInterface, EnvironmentHelper, Constants, globalStyles } from '../helpers';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { useNavigation } from '@react-navigation/native';
import { Loader } from './Loader';



export function NotificationTab(props: any) {
  const navigation = useNavigation();

  const [isLoading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
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
  const getNotifications = () => {
    setLoading(true)
    ApiHelper.get("/notifications/my", "MessagingApi").then((data) => {
      if (data && data.length != 0) setNotificationData(data);
    })
  }

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
            photo: matchingItem2.photo
          });
        }
      });
      setMergedData(merged);
    }
  }, [Chatlist, UserData])

  useEffect(() => {
  }, [dimension])
  useEffect(() => {
    getPreviousConversations();
  }, [])

  const getPreviousConversations = () => {
    setLoading(true);
    ApiHelper.get("/privateMessages", "MessagingApi").then((data: ConversationCheckInterface[]) => {
      console.log("private message api response =====>", data)
      if (data && data.length != 0) {
        setChatList(data);
      }
      setLoading(false);
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
    console.log("item ---->", item)
    let userchatDetails = {
      id: item.id,
      DisplayName: item.displayName,
      photo: item.photo
    }
    console.log("user chat details--->", userchatDetails)
    return (
      <TouchableOpacity onPress={() => navigation.navigate('MessagesScreen', { userDetails: userchatDetails })}>
        <View style={[globalStyles.messageContainer, { alignSelf: 'flex-start' }]}>
          <Image source={item.photo ? { uri: EnvironmentHelper.ContentRoot + item.photo } : Constants.Images.ic_user} style={[globalStyles.churchListIcon, { tintColor: item.photo ? '' : Constants.Colors.app_color, height: widthPercentageToDP('9%'), width: widthPercentageToDP('9%'), borderRadius: widthPercentageToDP('9%') }]} />
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
  const renderLabel = ({ route, focused, color }) => {
    return (
      <View>
        <Text style={[focused ? globalStyles.activeTabTextColor : globalStyles.tabTextColor]}>
          {route.title}
        </Text>
      </View>
    )
  }

  const renderScene = SceneMap({
    first: MessagesRoute,
    second: NotificationRoute,
  });
  return (
    <View style={globalStyles.tabBar} >

      {isLoading && <Loader isLoading={isLoading} />}



      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        swipeEnabled={false}
        renderTabBar={props => <TabBar renderLabel={renderLabel}{...props} indicatorStyle={{ backgroundColor: Constants.Colors.Active_TabColor }} style={globalStyles.TabIndicatorStyle} />}
        initialLayout={{ width: wd('100'), height: hd('200') }}
        sceneContainerStyle={{ marginTop: 0 }}
      />

    </View>


  )

}