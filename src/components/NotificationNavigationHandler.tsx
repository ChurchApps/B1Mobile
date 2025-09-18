import { useEffect } from "react";
import { router } from "expo-router";
import { eventBus } from "../helpers/PushNotificationHelper";

/**
 * Component that handles navigation from push notifications
 * Should be mounted in the root layout to listen for navigation events
 */
export const NotificationNavigationHandler = () => {
  useEffect(() => {
    // Handle chat navigation events (for chat messages)
    const handleChatNavigation = (data: any) => {
      try {
        if (data?.chatId) {
          // Navigate to message screen with chat ID
          router.push({
            pathname: "/messageScreenRoot",
            params: {
              chatId: data.chatId
            }
          });
        } else {
          // Fallback: navigate to notifications screen to find messages
          router.push("/(drawer)/notifications");
        }
      } catch (error) {
        console.error("Error navigating to chat:", error);
      }
    };

    // Handle general notification navigation events
    const handleNotificationNavigation = (data: any) => {
      try {
        // For general notifications, navigate to notifications screen
        router.push("/(drawer)/notifications");
      } catch (error) {
        console.error("Error navigating to notifications:", error);
      }
    };

    // Add event listeners
    eventBus.addListener("navigateToChat", handleChatNavigation);
    eventBus.addListener("navigateToNotification", handleNotificationNavigation);

    // Cleanup on unmount
    return () => {
      eventBus.removeListener("navigateToChat");
      eventBus.removeListener("navigateToNotification");
    };
  }, []);

  // This component doesn't render anything, it just handles navigation events
  return null;
};
