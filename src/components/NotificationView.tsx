import { DimensionHelper } from '@churchapps/mobilehelper';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useState, } from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { ApiHelper, Constants, ConversationCheckInterface, EnvironmentHelper, UserHelper, UserSearchInterface, globalStyles } from '../helpers';
import { Loader } from './Loader';


export function NotificationTab(props: any) {
  const navigation = useNavigation();

  const [isLoading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [NotificationData, setNotificationData] = useState([])
  const [Chatlist, setChatList] = useState<any[]>([])
  const [UserData, setUserData] = useState<any[]>([])
  const [mergeData, setMergedData] = useState<any[]>([])
  
  const [routes] = React.useState([
    { key: 'first', title: 'MESSAGES' },
    { key: 'second', title: 'NOTIFICATIONS' },
  ]);

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
      setLoading(true)
      const merged:any[] = [];
      Chatlist.forEach((item1:any) => {
        const commonId = UserHelper.currentUserChurch.person.id == item1.fromPersonId ? item1.toPersonId : item1.fromPersonId// item1.toPersonId;
        const matchingItem2:any = UserData.find((item2:any) => item2.id === commonId);
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
      setLoading(false)
    }
  }, [Chatlist, UserData])

  useEffect(() => {
    getPreviousConversations();
  }, [])

  const getPreviousConversations = () => {
    setLoading(true);
    ApiHelper.get("/privateMessages", "MessagingApi").then((data: ConversationCheckInterface[]) => {
      if (data && data.length != 0) {
        setChatList(data);
      }
      setLoading(false);
      var userIdList: string[] = []
      if (Object.keys(data).length != 0) {
        userIdList = data.map((e) => UserHelper.currentUserChurch.person.id == e.fromPersonId ? e.toPersonId : e.fromPersonId);
        if (userIdList.length != 0) {
          ApiHelper.get("/people/basic?ids=" + userIdList.join(','), "MembershipApi").then((userData: UserSearchInterface[]) => {
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
      DisplayName: item.displayName,
      photo: item.photo
    }
    return (
      <TouchableOpacity onPress={() => navigation.navigate('MessagesScreen', { userDetails: userchatDetails })}>
        <View style={[globalStyles.messageContainer, { alignSelf: 'flex-start' }]}>
          <Image source={item.photo ? { uri: EnvironmentHelper.ContentRoot + item.photo } : Constants.Images.ic_user} style={[globalStyles.churchListIcon, {height: DimensionHelper.wp('9%'), width: DimensionHelper.wp('9%'), borderRadius: DimensionHelper.wp('9%') }]} tintColor={ item.photo ? '#00000000' : Constants.Colors.app_color}/>
          <View>
            <Text style={[globalStyles.senderNameText, { alignSelf: 'flex-start' }]}>
              {item.displayName}
            </Text>
            <View style={[globalStyles.messageView, {
              width: item.message.length > 15 ? DimensionHelper.wp('65%') : DimensionHelper.wp((item.message.length + 14).toString() + "%"),
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
    const currentDate = moment();
   const endDate = moment(item?.timeSent)
    const timeDifference =currentDate.diff(endDate, 'hours') 
    const dayDiff = currentDate.diff(endDate, 'days');
    return (
      <TouchableOpacity style={globalStyles.NotificationView} onPress={()=>{navigation.navigate('PlanDetails', {id : item?.contentId})}}>
        <View style={globalStyles.bellIconView}><Image source={Constants.Images.dash_bell} style={globalStyles.bellIcon} tintColor={Constants.Colors.Black_color} /></View>
        <View style={globalStyles.notimsgView}><Text style={globalStyles.NotificationText}>{item.message}</Text>
        </View>
        <View style={globalStyles.timeSentView}><Text style={globalStyles.NotificationText}>{dayDiff === 0 ?  `${timeDifference}h` :  `${dayDiff}d`}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  const MessagesRoute = () => (
    <View style={globalStyles.MessagetabView}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={mergeData}
        renderItem={({ item, index }) => renderChatListItems(item, index)}
        keyExtractor={(item, index) => String(index)}
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
        keyExtractor={(item, index) => String(index)}
       
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
        initialLayout={{ width: DimensionHelper.wp('100'), height: DimensionHelper.hp('200') }}
        sceneContainerStyle={{ marginTop: 0 }}
      />

    </View>


  )

}