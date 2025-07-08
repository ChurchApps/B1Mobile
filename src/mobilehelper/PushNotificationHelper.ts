import * as Notifications from 'expo-notifications';
import { DeviceEventEmitter } from 'react-native';
import * as Device from 'expo-device';

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
      console.log("Must use a physical device for Push Notifications");
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log("Push notification permission not granted");
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
    console.log('Setting up notification listeners...');

    // Foreground notification handler
    Notifications.addNotificationReceivedListener(notification => {
      console.log("Notification received in foreground:", JSON.stringify(notification));
      pushEventBus.emit("badge", JSON.stringify(notification));
    });

    // Handle when the user taps on the notification from background state
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Notification opened from background:", JSON.stringify(response.notification));
    });

    // Handle notifications from quit state
    const lastNotification = await Notifications.getLastNotificationResponseAsync();
    if (lastNotification) {
      console.log("Notification caused app to open from quit state:", JSON.stringify(lastNotification.notification));
    }
  }
}
