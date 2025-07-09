import { ApiHelper, Constants, ConversationCheckInterface, EnvironmentHelper, UserHelper, UserSearchInterface, globalStyles } from "../../src/helpers";
import { NavigationProps } from "../../src/interfaces";
import { DimensionHelper } from "@/helpers/DimensionHelper";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useEffect, useState, useMemo } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { Loader } from "./Loader";
import { router } from "expo-router";
import { OptimizedImage } from "./OptimizedImage";

export function NotificationTab() {
  const navigation: NavigationProps = useNavigation();

  const [isLoading, setLoading] = useState(false);
  const [NotificationData, setNotificationData] = useState<Array<Record<string, unknown>>>([]);
  const [Chatlist, setChatList] = useState<ConversationCheckInterface[]>([]);
  const [UserData, setUserData] = useState<UserSearchInterface[]>([]);
  const [mergeData, setMergedData] = useState<Array<Record<string, unknown>>>([]);

  const [routes] = React.useState([
    { key: "first", title: "MESSAGES" },
    { key: "second", title: "NOTIFICATIONS" }
  ]);

  useEffect(() => {
    getNotifications();
  }, []);
  const getNotifications = () => {
    setLoading(true);
    ApiHelper.get("/notifications/my", "MessagingApi")
      .then(data => {
        if (data && Array.isArray(data)) setNotificationData(data);
        else setNotificationData([]);
      })
      .catch(err => {
        console.error("Error fetching notifications:", err);
        setNotificationData([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (Chatlist.length > 0 && UserData.length > 0) {
      setLoading(true);
      const merged: any[] = [];
      Chatlist.forEach((item1: any) => {
        const commonId = UserHelper.currentUserChurch.person.id == item1.fromPersonId ? item1.toPersonId : item1.fromPersonId; // item1.toPersonId;
        const matchingItem2: any = UserData.find((item2: any) => item2.id === commonId);
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
      setLoading(false);
    }
  }, [Chatlist, UserData]);

  useEffect(() => {
    getPreviousConversations();
  }, []);

  const getPreviousConversations = () => {
    setLoading(true);
    ApiHelper.get("/privateMessages", "MessagingApi").then((data: ConversationCheckInterface[]) => {
      if (data && data.length != 0) {
        setChatList(data);
      }
      setLoading(false);
      let userIdList: string[] = [];
      if (Object.keys(data).length != 0) {
        userIdList = data.map(e => (UserHelper.currentUserChurch.person.id == e.fromPersonId ? e.toPersonId : e.fromPersonId));
        if (userIdList.length != 0) {
          ApiHelper.get("/people/basic?ids=" + userIdList.join(","), "MembershipApi").then((userData: UserSearchInterface[]) => {
            // setLoading(false);
            for (let i = 0; i < userData.length; i++) {
              const singleUser: UserSearchInterface = userData[i];
              const tempConvo: ConversationCheckInterface | undefined = data.find(x => x.fromPersonId == singleUser.id || x.toPersonId == singleUser.id);
              userData[i].conversationId = tempConvo?.conversationId;
            }
            setUserData(userData);
          });
        }
      }
    });
  };

  const renderChatListItems = (item: any) => {
    let userchatDetails = {
      id: item.id,
      DisplayName: item.displayName,
      photo: item.photo
    };
    return (
      <TouchableOpacity onPress={() => router.push({ pathname: "/(drawer)/messageScreen", params: { userDetails: JSON.stringify(userchatDetails) } })}>
        <View style={[globalStyles.messageContainer, { alignSelf: "flex-start", backgroundColor: "#f8f9fa", padding: DimensionHelper.wp(3), borderRadius: DimensionHelper.wp(2), marginHorizontal: DimensionHelper.wp(3) }]}>
          <OptimizedImage source={item.photo ? { uri: EnvironmentHelper.ContentRoot + item.photo } : Constants.Images.ic_user} style={[globalStyles.churchListIcon, { height: DimensionHelper.wp(12), width: DimensionHelper.wp(12), borderRadius: DimensionHelper.wp(12) }]} tintColor={item.photo ? undefined : Constants.Colors.app_color} placeholder={Constants.Images.ic_user} />
          <View style={{ marginLeft: DimensionHelper.wp(2), flex: 1 }}>
            <Text style={[globalStyles.senderNameText, { fontSize: DimensionHelper.wp(4.2), color: "#2c3e50", marginBottom: DimensionHelper.wp(1) }]}>{item.displayName}</Text>
            <View
              style={[
                globalStyles.messageView,
                {
                  width: "100%",
                  backgroundColor: "#ffffff",
                  borderColor: "#e9ecef",
                  padding: DimensionHelper.wp(2)
                }
              ]}>
              <Text style={{ fontSize: DimensionHelper.wp(3.8), color: "#495057" }}>{item.message}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  const renderItems = (item: any) => {
    const timeInfo = useMemo(() => {
      const currentDate = dayjs();
      const endDate = dayjs(item?.timeSent);
      const timeDifference = currentDate.diff(endDate, "hours");
      const dayDiff = currentDate.diff(endDate, "days");
      return { timeDifference, dayDiff };
    }, [item?.timeSent]);

    const { timeDifference, dayDiff } = timeInfo;
    return (
      <TouchableOpacity
        style={[
          globalStyles.NotificationView,
          {
            backgroundColor: "#ffffff",
            marginHorizontal: DimensionHelper.wp(3),
            marginVertical: DimensionHelper.wp(1.5),
            padding: DimensionHelper.wp(3),
            borderRadius: DimensionHelper.wp(2),
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2
          }
        ]}
        onPress={() => {
          navigation.navigate("PlanDetails", { id: item?.contentId });
        }}>
        <View style={[globalStyles.bellIconView, { backgroundColor: Constants.Colors.app_color_light, padding: DimensionHelper.wp(2), borderRadius: DimensionHelper.wp(2) }]}>
          <Image source={Constants.Images.dash_bell} style={[globalStyles.bellIcon, { width: DimensionHelper.wp(6), height: DimensionHelper.wp(6) }]} tintColor={Constants.Colors.app_color} />
        </View>
        <View style={[globalStyles.notimsgView, { flex: 1, marginHorizontal: DimensionHelper.wp(2) }]}>
          <Text style={{ fontSize: DimensionHelper.wp(3.8), color: "#2c3e50", fontFamily: Constants.Fonts.RobotoRegular }}>{item.message}</Text>
        </View>
        <View style={[globalStyles.timeSentView, { backgroundColor: "#f8f9fa", paddingHorizontal: DimensionHelper.wp(2), paddingVertical: DimensionHelper.wp(1), borderRadius: DimensionHelper.wp(2) }]}>
          <Text style={{ fontSize: DimensionHelper.wp(3.5), color: "#6c757d", fontFamily: Constants.Fonts.RobotoMedium }}>{dayDiff === 0 ? `${timeDifference}h` : `${dayDiff}d`}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const MessagesRoute = () => (
    <View style={globalStyles.MessagetabView}>
      <FlatList showsVerticalScrollIndicator={false} data={mergeData} renderItem={({ item }) => renderChatListItems(item)} keyExtractor={item => String(item.id)} />
    </View>
  );

  const NotificationRoute = () => (
    <View style={[globalStyles.NotificationtabView, { flex: 1, justifyContent: "center", alignItems: "center" }]}>
      {isLoading ? (
        <Loader isLoading={true} />
      ) : NotificationData.length > 0 ? (
        <FlatList showsVerticalScrollIndicator={false} data={NotificationData} renderItem={({ item }) => renderItems(item)} keyExtractor={item => String(item.id)} />
      ) : (
        <View style={{ alignItems: "center", padding: DimensionHelper.wp(5) }}>
          <Image source={Constants.Images.dash_bell} style={{ width: DimensionHelper.wp(15), height: DimensionHelper.wp(15), marginBottom: DimensionHelper.wp(3) }} tintColor={Constants.Colors.app_color_light} />
          <Text style={{ fontSize: DimensionHelper.wp(4), color: "#6c757d", textAlign: "center", fontFamily: Constants.Fonts.RobotoMedium }}>No notifications yet</Text>
          <Text style={{ fontSize: DimensionHelper.wp(3.5), color: "#adb5bd", textAlign: "center", marginTop: DimensionHelper.wp(1), fontFamily: Constants.Fonts.RobotoRegular }}>We'll notify you when something new arrives</Text>
        </View>
      )}
    </View>
  );

  const renderScene = SceneMap({
    first: MessagesRoute,
    second: NotificationRoute
  });

  const renderTabBar = (props: any) => <TabBar {...props} indicatorStyle={{ backgroundColor: Constants.Colors.Active_TabColor, height: DimensionHelper.wp(0.5) }} style={[globalStyles.TabIndicatorStyle, { backgroundColor: "#ffffff", elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }]} labelStyle={{ color: "#000000", fontSize: DimensionHelper.wp(4), fontFamily: Constants.Fonts.RobotoMedium }} activeColor="#000000" inactiveColor="#000000" inactiveOpacity={0.7} />;

  return (
    <View style={[globalStyles.tabBar, { backgroundColor: "#f8f9fa" }]}>
      {isLoading && <Loader isLoading={isLoading} />}
      <TabView navigationState={{ index: 0, routes }} renderScene={renderScene} onIndexChange={() => {}} swipeEnabled={false} renderTabBar={renderTabBar} initialLayout={{ width: DimensionHelper.wp(100), height: DimensionHelper.hp(200) }} />
    </View>
  );
}
