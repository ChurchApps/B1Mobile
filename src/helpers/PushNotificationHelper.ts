import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiHelper } from './ApiHelper'
import { LoginUserChurchInterface } from './Interfaces';
import DeviceInfo from 'react-native-device-info';

export class PushNotificationHelper {

   static async registerUserDevice() {
    const fcmToken = await AsyncStorage.getItem("fcmToken");
    const deviceName = await DeviceInfo.getDeviceName();
    const deviceInfo = await PushNotificationHelper.getDeviceInfo();
    console.log("device info is as =====>", deviceInfo)
    const currentChurch = JSON.parse((await AsyncStorage.getItem('CHURCH_DATA'))!)
    const churchesString  = await AsyncStorage.getItem("CHURCHES_DATA")
    const tst : LoginUserChurchInterface[] = JSON.parse(churchesString)
    const currentData : LoginUserChurchInterface | undefined = tst.find((value, index) => value.church.id == currentChurch!.id);
    if(currentData != null || currentData != undefined){
    console.log("person object in helper class churches data----->",currentData.person.id)
    ApiHelper.post("/devices/register", {"personId":currentData.person.id  , fcmToken, label: deviceName, deviceInfo:JSON.stringify(deviceInfo) }, "MessagingApi").then(async(data)=>{
      console.log("register device api response ====>", data)
    });
  }
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