import * as Notifications from "expo-notifications";
import { DeviceEventEmitter, PermissionsAndroid, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import * as Device from "expo-device";
import { CacheHelper } from "./CacheHelper";
import { usePathname } from "expo-router";

// Track current screen
let currentScreen = "";

// Function to update current screen
export const updateCurrentScreen = (screen: string) => {
  currentScreen = screen;
};

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async notification => {
    const appState = await Notifications.getLastNotificationResponseAsync();
    const isAppInForeground = appState === null;
    const isInMessageScreen = currentScreen === "/(drawer)/messageScreen";

    // If app is in foreground, we'll handle it internally
    if (isAppInForeground) {
      eventBus.emit("notification", notification.request.content);
      return {
        shouldShowAlert: false,
        shouldPlaySound: !isInMessageScreen, // Don't play sound if in message screen
        shouldSetBadge: true,
        shouldShowBanner: false,
        shouldShowList: false
      };
    }

    // If app is in background or closed, show system notification
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true
    };
  }
});

export class PushNotificationHelper {
  static async registerUserDevice() {
    // TODO: Update to use useUserStore - this needs refactoring to accept user data as parameter
    // const fcmToken = CacheHelper.fcmToken;
    // const deviceName = await DeviceInfo.getDeviceName();
    // const deviceInfo = await PushNotificationHelper.getDeviceInfo();
    // const currentChurch = UserHelper.currentUserChurch?.church || CacheHelper.church;
    // const tst: LoginUserChurchInterface[] = UserHelper.userChurches;
    // const currentData: LoginUserChurchInterface | undefined = tst?.find(value => value.church.id == currentChurch!.id);
    // if (currentData != null || currentData != undefined) {
    //   ApiHelper.post("/devices/register", { personId: currentData.person.id, fcmToken, label: deviceName, deviceInfo: JSON.stringify(deviceInfo) }, "MessagingApi");
    // }
  }

  static async getDeviceInfo() {
    const details: Record<string, unknown> = {};
    details.appName = DeviceInfo.getApplicationName();
    details.buildId = await DeviceInfo.getBuildId();
    details.buildNumber = DeviceInfo.getBuildNumber();
    details.brand = DeviceInfo.getBrand();
    details.device = await DeviceInfo.getDevice();
    details.deviceId = DeviceInfo.getDeviceId();
    details.deviceType = DeviceInfo.getDeviceType();
    details.hardware = await DeviceInfo.getHardware();
    details.manufacturer = await DeviceInfo.getManufacturer();
    details.version = DeviceInfo.getReadableVersion();
    return details;
  }

  static async requestUserPermission() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus === "granted") {
        await PushNotificationHelper.GetFCMToken();
      } else {
        // Permission not granted, but we continue without notification permissions
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  }

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

  static async NotificationPermissionAndroid() {
    if (Platform.OS === "android") {
      try {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      } catch {
        // Permission request failed, but we continue without notification permissions
      }
    }
  }

  static async GetFCMToken() {
    let fcmToken = CacheHelper.fcmToken;
    if (!fcmToken) {
      try {
        // Get the Expo push token
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: "f72e5911-b8d5-467c-ad9e-423c180e9938" // Your EAS project ID
        });

        if (token.data) {
          fcmToken = token.data;
          await CacheHelper.setValue("fcmToken", fcmToken);
        }
      } catch (error) {
        console.error("Expo push token not created:", error);
      }
    }
  }

  static async NotificationListener() {
    try {
      // Track screen changes using pathname
      const pathname = usePathname();
      if (pathname) {
        currentScreen = pathname;
      }

      // Listen for notifications received while app is foregrounded
      const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
        const content = notification.request.content;

        // Emit notification event for internal handling
        eventBus.emit("notification", content);

        // If it's a chat notification and we're in the chat, update the messages
        if (content.data?.type === "chat") {
          eventBus.emit("chatNotification", content.data);
        }
      });

      // Listen for user interactions with notifications
      const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
        const content = response.notification.request.content;

        // Handle navigation based on notification type
        if (content.data?.type === "chat") {
          eventBus.emit("navigateToChat", content.data);
        } else if (content.data?.type === "message") {
          eventBus.emit("navigateToMessage", content.data);
        }
        // Add more navigation types as needed
      });

      // Get notification that opened the app
      const lastNotificationResponse = await Notifications.getLastNotificationResponseAsync();
      if (lastNotificationResponse) {
        const content = lastNotificationResponse.notification.request.content;

        // Handle navigation for app launch from notification
        if (content.data?.type === "chat") {
          eventBus.emit("navigateToChat", content.data);
        } else if (content.data?.type === "message") {
          eventBus.emit("navigateToMessage", content.data);
        }
      }

      return () => {
        foregroundSubscription.remove();
        responseSubscription.remove();
      };
    } catch (error) {
      console.error("Error setting up notification listeners:", error);
    }
  }

  // Add method to check if we're in a specific chat
  static isInChat(): boolean {
    // This should be implemented based on your navigation state
    // You'll need to track the current chat ID in your navigation state
    return false; // Placeholder
  }
}

export const eventBus = {
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

export const pushEventBus = eventBus;
