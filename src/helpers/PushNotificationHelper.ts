import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiHelper } from './ApiHelper';
import { UserHelper } from './UserHelper';
import DeviceInfo from 'react-native-device-info';

export class PushNotificationHelper {

  static async registerUserDevice() {
    const fcmToken = await AsyncStorage.getItem("fcmToken");
    console.log("Registering Device for user id:", UserHelper.user.id);
    const deviceName = await DeviceInfo.getDeviceName();
    const deviceInfo = await PushNotificationHelper.getDeviceInfo();
    ApiHelper.post("/devices/register", {"userId":UserHelper.user.id , fcmToken, label: deviceName, deviceInfo:JSON.stringify(deviceInfo) }, "MessagingApi");
  }

  static async getDeviceInfo() {
    const details: any = {}
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
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      console.log('Authorization status:', authStatus);
      PushNotificationHelper.GetFCMToken();
    }
  }

  static async GetFCMToken() {
    let fcmToken = await AsyncStorage.getItem("fcmToken")
    console.log("fcm token ", fcmToken)
    if (!fcmToken) {
      try {
        let fcmToken = await messaging().getToken();
        if (fcmToken) {
          await AsyncStorage.setItem("fcmToken", fcmToken)
        }
      } catch (error) {
        console.log(error, "fcm token not created")
      }
    }

  }

  static NotificationListener = () => {
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        JSON.stringify(remoteMessage.notification),
      );
    });
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            JSON.stringify(remoteMessage.notification),
          );

        }
      });
    messaging().onMessage(async remoteMessage => {
      console.log("notification on forground state.......", JSON.stringify(remoteMessage))
    })

  }

}