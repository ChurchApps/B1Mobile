import { ApiHelper, ConversationCheckInterface, UserSearchInterface } from "../../src/helpers";
import { NavigationProps } from "../../src/interfaces";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View, ScrollView } from "react-native";
import { Provider as PaperProvider, Card, Text, MD3LightTheme, Chip, Button } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "./Loader";
import { router } from "expo-router";
import { useCurrentUserChurch } from "../stores/useUserStore";
import { Avatar } from "./common/Avatar";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#0D47A1",
    secondary: "#F6F6F8",
    surface: "#FFFFFF",
    background: "#F6F6F8",
    elevation: {
      level0: "transparent",
      level1: "#FFFFFF",
      level2: "#F6F6F8",
      level3: "#F0F0F0",
      level4: "#E9ECEF",
      level5: "#E2E6EA"
    }
  }
};

export function NotificationTab() {
  const navigation: NavigationProps = useNavigation();
  const currentUserChurch = useCurrentUserChurch();

  const [isLoading, setLoading] = useState(false);
  const [Chatlist, setChatList] = useState<ConversationCheckInterface[]>([]);
  const [UserData, setUserData] = useState<UserSearchInterface[]>([]);
  const [mergeData, setMergedData] = useState<Array<Record<string, unknown>>>([]);

  const [routes] = React.useState([
    { key: "first", title: "Messages" },
    { key: "second", title: "Notifications" }
  ]);

  // Use react-query for notifications
  const { data: NotificationData = [] } = useQuery<Array<Record<string, unknown>>>({
    queryKey: ["/notifications/my", "MessagingApi"],
    enabled: !!currentUserChurch?.jwt,
    placeholderData: [],
    staleTime: 0, // Instant stale - notifications are real-time
    gcTime: 2 * 60 * 1000, // 2 minutes
    select: data => (Array.isArray(data) ? data : [])
  });

  useEffect(() => {
    if (Chatlist.length > 0 && UserData.length > 0) {
      setLoading(true);
      const merged: any[] = [];
      Chatlist.forEach((item1: any) => {
        const commonId = currentUserChurch?.person?.id == item1.fromPersonId ? item1.toPersonId : item1.fromPersonId;
        const matchingItem2: any = UserData.find((item2: any) => item2.id === commonId);
        if (matchingItem2) {
          merged.push({
            id: commonId,
            message: item1.conversation.messages?.[0]?.content || "",
            displayName: matchingItem2.name.display,
            firstName: matchingItem2.name.first,
            lastName: matchingItem2.name.last,
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
    if (!currentUserChurch?.person?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    ApiHelper.get("/privateMessages", "MessagingApi")
      .then((data: ConversationCheckInterface[]) => {
        if (data && data.length != 0) {
          setChatList(data);
        }
        setLoading(false);
        let userIdList: string[] = [];
        if (Object.keys(data).length != 0) {
          userIdList = data.map(e => (currentUserChurch?.person?.id == e.fromPersonId ? e.toPersonId : e.fromPersonId));
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
      })
      .catch(err => {
        setLoading(false);
      });
  };

  const renderChatListItems = (item: any) => {
    let userchatDetails = {
      id: item.id,
      DisplayName: item.displayName,
      photo: item.photo
    };
    return (
      <Card style={styles.messageCard} mode="elevated" onPress={() => router.push({ pathname: "/messageScreenRoot", params: { userDetails: JSON.stringify(userchatDetails) } })}>
        <Card.Content style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <View style={styles.avatarContainer}>
              <Avatar size={48} photoUrl={item.photo} firstName={item.firstName} lastName={item.lastName} style={styles.avatar} />
            </View>
            <View style={styles.messageInfo}>
              <Text variant="titleMedium" style={styles.senderName}>
                {item.displayName}
              </Text>
              <Text variant="bodyMedium" style={styles.messagePreview} numberOfLines={2}>
                {item.message}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#9E9E9E" />
          </View>
        </Card.Content>
      </Card>
    );
  };
  const renderItems = (item: any) => {
    const currentDate = dayjs();
    const endDate = dayjs(item?.timeSent);
    const timeDifference = currentDate.diff(endDate, "hours");
    const dayDiff = currentDate.diff(endDate, "days");

    const getNotificationIcon = (type: string) => {
      switch (type?.toLowerCase()) {
        case "plan":
        case "schedule":
          return "calendar-today";
        case "message":
          return "message";
        case "group":
          return "group";
        case "donation":
          return "payment";
        default:
          return "notifications";
      }
    };

    const getTimeDisplay = () => {
      if (dayDiff === 0) {
        if (timeDifference === 0) return "now";
        return `${timeDifference}h`;
      } else if (dayDiff === 1) {
        return "yesterday";
      } else if (dayDiff < 7) {
        return `${dayDiff}d`;
      } else {
        return endDate.format("MMM D");
      }
    };

    return (
      <Card style={styles.notificationCard} mode="elevated" onPress={() => navigation.navigate("PlanDetails", { id: item?.contentId })}>
        <Card.Content style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <View style={styles.notificationIcon}>
              <MaterialIcons name={getNotificationIcon(item?.type)} size={24} color="#0D47A1" />
            </View>
            <View style={styles.notificationInfo}>
              <Text variant="bodyMedium" style={styles.notificationMessage} numberOfLines={3}>
                {item.message}
              </Text>
              <View style={styles.notificationMeta}>
                <Chip mode="outlined" compact style={styles.timeChip}>
                  <Text variant="bodySmall" style={styles.timeText}>
                    {getTimeDisplay()}
                  </Text>
                </Chip>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const MessagesRoute = () => (
    <View style={styles.tabContainer}>
      {isLoading ? (
        <Loader isLoading={true} />
      ) : mergeData.length > 0 ? (
        <FlatList showsVerticalScrollIndicator={false} data={mergeData} renderItem={({ item }) => renderChatListItems(item)} keyExtractor={(item, index) => `message-${item.id}-${index}`} contentContainerStyle={styles.listContent} initialNumToRender={10} windowSize={8} removeClippedSubviews={true} maxToRenderPerBatch={5} updateCellsBatchingPeriod={100} />
      ) : (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <View style={styles.emptyState}>
            <MaterialIcons name="message" size={64} color="#E0E0E0" />
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              No messages yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtitle}>
              Start a conversation with someone from your church
            </Text>
            <Button mode="contained" onPress={() => router.push("/searchMessageUserRoot")} style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Find People</Text>
            </Button>
          </View>
        </ScrollView>
      )}
    </View>
  );

  const NotificationRoute = () => (
    <View style={styles.tabContainer}>
      {isLoading ? (
        <Loader isLoading={true} />
      ) : NotificationData.length > 0 ? (
        <FlatList showsVerticalScrollIndicator={false} data={NotificationData} renderItem={({ item }) => renderItems(item)} keyExtractor={(item, index) => `notification-${item.id}-${index}`} contentContainerStyle={styles.listContent} initialNumToRender={8} windowSize={8} removeClippedSubviews={true} maxToRenderPerBatch={4} updateCellsBatchingPeriod={100} />
      ) : (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <View style={styles.emptyState}>
            <MaterialIcons name="notifications" size={64} color="#E0E0E0" />
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              No notifications yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtitle}>
              We'll notify you when something new arrives
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );

  const renderScene = SceneMap({
    first: MessagesRoute,
    second: NotificationRoute
  });

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor="#0D47A1"
      inactiveColor="#9E9E9E"
      renderLabel={({ route, focused, color }) => (
        <Text variant="titleSmall" style={[styles.tabLabel, { color, fontWeight: focused ? "700" : "500" }]}>
          {route.title}
        </Text>
      )}
    />
  );

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <TabView navigationState={{ index: 0, routes }} renderScene={renderScene} onIndexChange={() => {}} swipeEnabled={false} renderTabBar={renderTabBar} initialLayout={{ width: 400 }} />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F8"
  },
  tabContainer: {
    flex: 1,
    backgroundColor: "#F6F6F8"
  },
  tabBar: {
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0"
  },
  tabIndicator: {
    backgroundColor: "#0D47A1",
    height: 3,
    borderRadius: 1.5
  },
  tabLabel: {
    fontSize: 16,
    textTransform: "capitalize",
    letterSpacing: 0.5
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 24
  },
  // Message Card Styles
  messageCard: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    backgroundColor: "#FFFFFF"
  },
  messageContent: {
    padding: 16
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center"
  },
  avatarContainer: {
    marginRight: 12
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F6F6F8"
  },
  messageInfo: {
    flex: 1
  },
  senderName: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 4
  },
  messagePreview: {
    color: "#9E9E9E",
    lineHeight: 20
  },
  // Notification Card Styles
  notificationCard: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    backgroundColor: "#FFFFFF"
  },
  notificationContent: {
    padding: 16
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "flex-start"
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F6F6F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  notificationInfo: {
    flex: 1
  },
  notificationMessage: {
    color: "#3c3c3c",
    lineHeight: 20,
    marginBottom: 8
  },
  notificationMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  timeChip: {
    backgroundColor: "#F6F6F8",
    borderColor: "#E0E0E0"
  },
  timeText: {
    color: "#9E9E9E",
    fontSize: 12
  },
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24
  },
  emptyState: {
    alignItems: "center",
    maxWidth: 300
  },
  emptyTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center"
  },
  emptySubtitle: {
    color: "#9E9E9E",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20
  },
  actionButton: {
    backgroundColor: "#0D47A1",
    paddingHorizontal: 24,
    borderRadius: 8
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "600"
  }
});
