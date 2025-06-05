import { eventBus } from "@/src/helpers/PushNotificationHelper";
import React, { useEffect, useState } from "react";
import { IconButton } from "react-native-paper";
import { useAppTheme } from "@/src/theme";
import { useNavigation } from "@react-navigation/native";

interface Props {
  toggleNotifications: () => void;
}

interface NotificationData {
  type: string;
  chatId?: string;
  [key: string]: any;
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
      if (!state?.routes?.length) return;

      const currentRoute = state.routes[state.index];
      const params = currentRoute?.params as ChatParams | undefined;

      // Don't increment badge if we're in the relevant chat
      if (content.data?.type === "chat" && content.data?.chatId && content.data.chatId === params?.chatId) {
        // Emit event to update chat messages
        eventBus.emit("updateChatMessages", content.data);
        return;
      }
      setBadgeCount(prevCount => prevCount + 1);
    } catch {
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

  return <IconButton icon={badgeCount > 0 ? "bell-badge" : "bell"} iconColor={theme.colors.onPrimary} size={24} onPress={handlePress} style={componentStyles.button} />;
};
