import { eventBus } from "../../../src/helpers/PushNotificationHelper";
import React, { useEffect, useState } from "react";
import { IconButton } from "react-native-paper";
import { useAppTheme } from "../../../src/theme";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { View } from "react-native";

interface Props {
  toggleNotifications: () => void;
  name?: string;
  isDetail?: boolean;
}

interface NotificationData {
  type: string;
  chatId?: string;
  notificationId?: string;
  [key: string]: unknown;
}

interface ChatParams {
  chatId: string;
}

export const HeaderBell = (props: Props) => {
  const { theme, componentStyles } = useAppTheme();
  const [badgeCount, setBadgeCount] = useState(0);
  const navigation = useNavigation();

  const handleNotification = (content: { data?: NotificationData }) => {
    try {
      const state = navigation.getState();
      if (!state?.routes?.length) {
        setBadgeCount(prevCount => prevCount + 1);
        return;
      }

      const currentRoute = state.routes[state.index];
      const routeName = currentRoute?.name;
      const params = currentRoute?.params as ChatParams | undefined;

      // Don't increment badge if we're viewing the relevant content
      if (content.data?.type === "chat" && content.data?.chatId) {
        // If we're in the message screen with the same chat, just update messages
        if (routeName === "messageScreen" && content.data.chatId === params?.chatId) {
          eventBus.emit("updateChatMessages", content.data);
          return;
        }
      }

      // If we're in the notifications screen, don't increment badge for any notifications
      if (routeName === "notifications") {
        // Just emit the update event but don't increment badge
        if (content.data?.type === "chat") {
          eventBus.emit("updateChatMessages", content.data);
        }
        return;
      }

      // For all other cases, increment the badge
      setBadgeCount(prevCount => prevCount + 1);
    } catch (error) {
      console.error("Error handling notification in HeaderBell:", error);
      // If there's any issue with navigation state, just increment the badge
      setBadgeCount(prevCount => prevCount + 1);
    }
  };

  useEffect(() => {
    // Listen for all notifications
    eventBus.addListener("notification", handleNotification);
    // Listen for notification read events
    eventBus.addListener("notificationRead", () => setBadgeCount(0));

    return () => {
      eventBus.removeListener("notification");
      eventBus.removeListener("notificationRead");
    };
  }, []);

  const handlePress = () => {
    setBadgeCount(0);
    eventBus.emit("notificationRead");
    props.toggleNotifications();
  };

  if (props?.name) {
    return (
      <View style={{ marginRight: props?.isDetail ? -12 : 0 }}>
        <MaterialIcons name={props.name as any} size={24} onPress={handlePress} style={componentStyles.button} color="#FFFFFF" />
      </View>
    );
  }
  return (
    <View style={{ marginRight: props?.isDetail ? -12 : 0 }}>
      <IconButton icon={badgeCount > 0 ? "bell-badge" : "bell"} iconColor={badgeCount > 0 ? theme.colors.error : theme.colors.onPrimary} size={24} onPress={handlePress} style={componentStyles.button} />
    </View>
  );
};
