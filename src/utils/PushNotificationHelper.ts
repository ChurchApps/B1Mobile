import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  if (enabled) {
    console.log('Authorization status:', authStatus);
    GetFCMToken();
  }
}

export async function GetFCMToken() {
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

export const NotificationListener = () => {
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