// Firebase configuration for Expo
// This file initializes Firebase for the app using Expo Firebase SDK

import { getApp } from "@react-native-firebase/app";
import { getAnalytics, logEvent, setAnalyticsCollectionEnabled } from "@react-native-firebase/analytics";

// Firebase is automatically initialized with Expo
// Configuration is handled through app.json and GoogleService files

export const initializeFirebase = async () => {
  try {
    // Get the Firebase app instance
    const app = getApp();
    const analytics = getAnalytics(app);

    // Enable analytics
    await setAnalyticsCollectionEnabled(analytics, true);
    console.log("Firebase Analytics enabled successfully");
  } catch (error) {
    console.log("Firebase initialization error:", error);
  }
};

export const logAnalyticsEvent = async (eventName: string, parameters?: any) => {
  try {
    const app = getApp();
    const analytics = getAnalytics(app);
    await logEvent(analytics, eventName, parameters);
    console.log("Analytics event logged:", eventName, parameters);
  } catch (error) {
    console.log("Analytics event logging error:", error);
  }
};

export const testFirebaseFeatures = async (): Promise<boolean> => {
  try {
    const app = getApp();
    const analytics = getAnalytics(app);

    // Test analytics
    await logEvent(analytics, "test_event", { test: true });

    return true;
  } catch (error) {
    console.error("Firebase features test failed:", error);
    return false;
  }
};
