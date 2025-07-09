import * as Notifications from "expo-notifications";
import { DeviceEventEmitter } from "react-native";
import * as Device from "expo-device";

export const pushEventBus = {
  emit(eventName: string, data?: any) {
    DeviceEventEmitter.emit(eventName, data);
  },
  addListener(eventName: string, callback: (data?: any) => void) {
    DeviceEventEmitter.addListener(eventName, callback);
  },
  removeListener(eventName: string) {
    DeviceEventEmitter.removeAllListeners(eventName);
  }
};
export class PushNotificationHelper {
  static async registerForPushNotificationsAsync() {
    if (!Device.isDevice) {
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return null;
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      return tokenData.data;
    } catch (error) {
      console.error("Error getting Expo push token:", error);
      return null;
    }
  }

  static async NotificationListener() {
    // Foreground notification handler
    Notifications.addNotificationReceivedListener(notification => {
      pushEventBus.emit("badge", JSON.stringify(notification));
    });

    // Handle when the user taps on the notification from background state
    Notifications.addNotificationResponseReceivedListener(() => {
      // Handle notification response
    });

    // Handle notifications from quit state
    const lastNotification = await Notifications.getLastNotificationResponseAsync();
    if (lastNotification) {
      // Handle app opened from notification
    }
  }
}
