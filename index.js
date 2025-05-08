import "react-native-gesture-handler";
/**
 * @format
 */

import { registerRootComponent } from "expo";
import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";
import { firebaseConfig } from "./firebase.config";

// Initialize Firebase
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// Initialize Firebase
const app =
  initializeApp(
    firebaseConfig
  );

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging =
  getMessaging(
    app
  );

// Handle background messages
messaging.onBackgroundMessage(
  (
    payload
  ) => {
    console.log(
      "Message handled in the background!",
      payload
    );
  }
);

AppRegistry.registerComponent(
  appName,
  () =>
    App
);

registerRootComponent(
  App
);
