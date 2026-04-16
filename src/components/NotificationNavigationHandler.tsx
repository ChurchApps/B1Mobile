import { useEffect } from "react";
import { eventBus } from "../helpers/PushNotificationHelper";
import * as Notifications from "expo-notifications";
import { canHandleNotification, markNotificationHandled, navigateFromNotificationData } from "../helpers/NotificationNavigation";

/**
 * Component that handles navigation from push notifications
 * Should be mounted in the root layout to listen for navigation events
 */
export const NotificationNavigationHandler = () => {
  useEffect(() => {
    const checkInitialNotification = async () => {
      const response = await Notifications.getLastNotificationResponseAsync();
      const notificationId = response?.notification?.request?.identifier;
      const data = response?.notification?.request?.content?.data;

      if (canHandleNotification(notificationId) && navigateFromNotificationData(data, "replace")) {
        markNotificationHandled(notificationId);
      }
    };

    // Handle chat navigation events (for chat messages)
    const handleChatNavigation = (data: any) => {
      try {
        navigateFromNotificationData(data);
      } catch (error) {
        console.error("Error navigating to chat:", error);
      }
    };

    // Handle general notification navigation events
    const handleNotificationNavigation = (data: any) => {
      try {
        navigateFromNotificationData(data);
      } catch (error) {
        console.error("Error navigating to notifications:", error);
      }
    };

    // Add event listeners
    const chatSub = eventBus.addListener("navigateToChat", handleChatNavigation);
    const notifSub = eventBus.addListener("navigateToNotification", handleNotificationNavigation);
    checkInitialNotification();

    // Cleanup on unmount
    return () => {
      chatSub.remove();
      notifSub.remove();
    };
  }, []);

  // This component doesn't render anything, it just handles navigation events
  return null;
};
