import { ApiHelper, ConversationCheckInterface, UserSearchInterface } from "../../src/helpers";
import { NavigationProps } from "../../src/interfaces";
import { useNavigation } from "@react-navigation/native";
import dayjs from "../helpers/dayjsConfig";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View, ScrollView } from "react-native";
import { Card, Text, Chip, Button } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { useQuery } from "@tanstack/react-query";
import { ListSkeleton } from "./common/Skeleton";
import { router } from "expo-router";
import { useCurrentUserChurch } from "../stores/useUserStore";
import { Avatar } from "./common/Avatar";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../theme";

export function NotificationTab() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const navigation: NavigationProps = useNavigation();
  const currentUserChurch = useCurrentUserChurch();

  const [isLoading, setLoading] = useState(false);
  const [Chatlist, setChatList] = useState<ConversationCheckInterface[]>([]);
  const [UserData, setUserData] = useState<UserSearchInterface[]>([]);
  const [mergeData, setMergedData] = useState<Array<Record<string, unknown>>>([]);

  const routes = [
    { key: "first", title: t("messages.messages") },
    { key: "second", title: t("notifications.notifications") }
  ];

  // Use react-query for notifications
  const { data: NotificationData = [] } = useQuery<Array<Record<string, unknown>>>({
    queryKey: ["/notifications/my", "MessagingApi"],
    enabled: !!currentUserChurch?.jwt,
    placeholderData: [],
    staleTime: 0,
    gcTime: 2 * 60 * 1000,
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
            message: item1.conversation?.messages?.[0]?.content || "",
            displayName: matchingItem2.name?.display || "",
            firstName: matchingItem2.name?.first || "",
            lastName: matchingItem2.name?.last || "",
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

  const getPreviousConversations = async () => {
    if (!currentUserChurch?.person?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data: ConversationCheckInterface[] = await ApiHelper.get("/privateMessages", "MessagingApi");
      if (data && data.length !== 0) {
        setChatList(data);
        const userIdList = data.map(e => (currentUserChurch?.person?.id == e.fromPersonId ? e.toPersonId : e.fromPersonId));
        if (userIdList.length !== 0) {
          try {
            const userData: UserSearchInterface[] = await ApiHelper.get("/people/basic?ids=" + userIdList.join(","), "MembershipApi");
            for (let i = 0; i < userData.length; i++) {
              const singleUser: UserSearchInterface = userData[i];
              const tempConvo: ConversationCheckInterface | undefined = data.find(x => x.fromPersonId == singleUser.id || x.toPersonId == singleUser.id);
              userData[i].conversationId = tempConvo?.conversationId;
            }
            setUserData(userData);
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching private messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderChatListItems = (item: any) => {
    const userchatDetails = { id: item.id, DisplayName: item.displayName, photo: item.photo };
    return (
      <Card style={[styles.messageCard, { backgroundColor: colors.surface, shadowColor: colors.shadowBlack }]} mode="elevated" onPress={() => router.push({ pathname: "/messageScreenRoot", params: { userDetails: JSON.stringify(userchatDetails) } })} accessibilityLabel={"Message from " + item.displayName} accessibilityRole="button">
        <Card.Content style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <View style={styles.avatarContainer}>
              <Avatar size={48} photoUrl={item.photo} firstName={item.firstName} lastName={item.lastName} style={[styles.avatar, { backgroundColor: colors.iconBackground }]} />
            </View>
            <View style={styles.messageInfo}>
              <Text variant="titleMedium" style={[styles.senderName, { color: colors.text }]}>
                {item.displayName}
              </Text>
              <Text variant="bodyMedium" style={[styles.messagePreview, { color: colors.disabled }]} numberOfLines={2}>
                {item.message}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.disabled} />
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
        case "schedule": return "calendar-today";
        case "message": return "message";
        case "group": return "group";
        case "donation": return "payment";
        default: return "notifications";
      }
    };

    const getTimeDisplay = () => {
      if (dayDiff === 0) {
        if (timeDifference === 0) return t("notifications.now");
        return `${timeDifference}h`;
      } else if (dayDiff === 1) {
        return t("notifications.yesterday");
      } else if (dayDiff < 7) {
        return `${dayDiff}d`;
      } else {
        return endDate.format("ll");
      }
    };

    return (
      <Card style={[styles.notificationCard, { backgroundColor: colors.surface, shadowColor: colors.shadowBlack }]} mode="elevated" onPress={() => navigation.navigate("PlanDetails", { id: item?.contentId })} accessibilityLabel={item.message} accessibilityRole="button">
        <Card.Content style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <View style={[styles.notificationIcon, { backgroundColor: colors.iconBackground }]}>
              <MaterialIcons name={getNotificationIcon(item?.type)} size={24} color={colors.primary} />
            </View>
            <View style={styles.notificationInfo}>
              <Text variant="bodyMedium" style={[styles.notificationMessage, { color: colors.text }]} numberOfLines={3}>
                {item.message}
              </Text>
              <View style={styles.notificationMeta}>
                <Chip mode="outlined" compact style={[styles.timeChip, { backgroundColor: colors.iconBackground, borderColor: colors.divider }]}>
                  <Text variant="bodySmall" style={[styles.timeText, { color: colors.disabled }]}>
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
    <View style={[styles.tabContainer, { backgroundColor: colors.background }]}>
      {isLoading ? (
        <ListSkeleton count={5} />
      ) : mergeData.length > 0 ? (
        <FlatList showsVerticalScrollIndicator={false} data={mergeData} renderItem={({ item }) => renderChatListItems(item)} keyExtractor={(item, index) => `message-${item.id}-${index}`} contentContainerStyle={styles.listContent} initialNumToRender={10} windowSize={8} removeClippedSubviews={true} maxToRenderPerBatch={5} updateCellsBatchingPeriod={100} />
      ) : (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <View style={styles.emptyState}>
            <MaterialIcons name="message" size={64} color={colors.divider} />
            <Text variant="headlineSmall" style={[styles.emptyTitle, { color: colors.text }]}>
              {t("notifications.noMessagesYet")}
            </Text>
            <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: colors.disabled }]}>
              {t("notifications.startConversation")}
            </Text>
            <Button mode="contained" onPress={() => router.push("/searchMessageUserRoot")} style={[styles.actionButton, { backgroundColor: colors.primary }]} accessibilityLabel="Find people to message">
              <Text style={[styles.actionButtonText, { color: colors.white }]}>{t("notifications.findPeople")}</Text>
            </Button>
          </View>
        </ScrollView>
      )}
    </View>
  );

  const NotificationRoute = () => (
    <View style={[styles.tabContainer, { backgroundColor: colors.background }]}>
      {isLoading ? (
        <ListSkeleton count={5} />
      ) : NotificationData.length > 0 ? (
        <FlatList showsVerticalScrollIndicator={false} data={NotificationData} renderItem={({ item }) => renderItems(item)} keyExtractor={(item, index) => `notification-${item.id}-${index}`} contentContainerStyle={styles.listContent} initialNumToRender={8} windowSize={8} removeClippedSubviews={true} maxToRenderPerBatch={4} updateCellsBatchingPeriod={100} />
      ) : (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <View style={styles.emptyState}>
            <MaterialIcons name="notifications" size={64} color={colors.divider} />
            <Text variant="headlineSmall" style={[styles.emptyTitle, { color: colors.text }]}>
              {t("notifications.noNotificationsYet")}
            </Text>
            <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: colors.disabled }]}>
              {t("notifications.wellNotifyYou")}
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );

  const renderScene = SceneMap({ first: MessagesRoute, second: NotificationRoute });

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={[styles.tabIndicator, { backgroundColor: colors.primary }]}
      style={[styles.tabBar, { backgroundColor: colors.surface, shadowColor: colors.shadowBlack, borderBottomColor: colors.border }]}
      labelStyle={styles.tabLabel}
      activeColor={colors.primary}
      inactiveColor={colors.disabled}
      renderLabel={({ route, focused, color }) => (
        <Text variant="titleSmall" style={[styles.tabLabel, { color, fontWeight: focused ? "700" : "500" }]}>
          {route.title}
        </Text>
      )}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TabView navigationState={{ index: 0, routes }} renderScene={renderScene} onIndexChange={() => {}} swipeEnabled={false} renderTabBar={renderTabBar} initialLayout={{ width: 400 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabContainer: { flex: 1 },
  tabBar: {
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderBottomWidth: 1
  },
  tabIndicator: {
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  messageContent: { padding: 16 },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center"
  },
  avatarContainer: { marginRight: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24
  },
  messageInfo: { flex: 1 },
  senderName: {
    fontWeight: "600",
    marginBottom: 4
  },
  messagePreview: { lineHeight: 20 },
  // Notification Card Styles
  notificationCard: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  notificationContent: { padding: 16 },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "flex-start"
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  notificationInfo: { flex: 1 },
  notificationMessage: {
    lineHeight: 20,
    marginBottom: 8
  },
  notificationMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  timeChip: {},
  timeText: { fontSize: 12 },
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
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center"
  },
  emptySubtitle: {
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20
  },
  actionButton: {
    paddingHorizontal: 24,
    borderRadius: 8
  },
  actionButtonText: { fontWeight: "600" }
});
