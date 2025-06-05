import { ApiHelper } from "@churchapps/mobilehelper";
import { UserHelper } from "./UserHelper";
import * as Notifications from "expo-notifications";
import { DeviceEventEmitter, PermissionsAndroid, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import { CacheHelper } from "./CacheHelper";
import { LoginUserChurchInterface } from "./Interfaces";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

export class PushNotificationHelper {
  static async registerUserDevice() {
    const fcmToken = CacheHelper.fcmToken;
    const deviceName = await DeviceInfo.getDeviceName();
    const deviceInfo = await PushNotificationHelper.getDeviceInfo();
    const currentChurch = UserHelper.currentUserChurch?.church || CacheHelper.church;
    const tst: LoginUserChurchInterface[] = UserHelper.userChurches;
    const currentData: LoginUserChurchInterface | undefined = tst?.find((value, index) => value.church.id == currentChurch!.id);
    if (currentData != null || currentData != undefined) {
      ApiHelper.post("/devices/register", { personId: currentData.person.id, fcmToken, label: deviceName, deviceInfo: JSON.stringify(deviceInfo) }, "MessagingApi");
    }
  }

  static async getDeviceInfo() {
    const details: any = {};
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
        console.log("Notification permission denied");
      }
    } catch (error) {
      console.log("Error requesting notification permission:", error);
    }
  }

  static async NotificationPermissionAndroid() {
    if (Platform.OS === "android") {
      try {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      } catch (error) {}
    }
  }

  static async GetFCMToken() {
    console.log("GET TOKEN");
    let fcmToken = CacheHelper.fcmToken;
    console.log("fcmToken", fcmToken);
    if (!fcmToken) {
      try {
        // Get the Expo push token
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: "f72e5911-b8d5-467c-ad9e-423c180e9938" // Your EAS project ID
        });

        console.log("Expo push token:", token);

        if (token.data) {
          fcmToken = token.data;
          await CacheHelper.setValue("fcmToken", fcmToken);
          console.log("Expo push token generated:", fcmToken);
        }
      } catch (error) {
        console.log(error, "Expo push token not created");
      }
    }
  }

  static async NotificationListener() {
    try {
      // Listen for notifications received while app is foregrounded
      const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
        console.log("Notification received in foreground:", notification);
        const badge = JSON.stringify(notification);
        eventBus.emit("badge", badge);
      });

      // Listen for user interactions with notifications
      const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
        console.log("Notification response received:", response);
        // Handle notification tap
      });

      // Get notification that opened the app
      const lastNotificationResponse = await Notifications.getLastNotificationResponseAsync();
      if (lastNotificationResponse) {
        console.log("App opened from notification:", lastNotificationResponse);
      }

      console.log("Expo notification listeners set up");

      // Return cleanup function
      return () => {
        foregroundSubscription.remove();
        responseSubscription.remove();
      };
    } catch (error) {
      console.log("Error setting up notification listeners:", error);
    }
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
