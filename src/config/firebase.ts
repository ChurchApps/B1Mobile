// Firebase configuration for Expo
// This file initializes Firebase for the app using Expo Firebase SDK

import { getApp, initializeApp, getApps } from "@react-native-firebase/app";
import { getAnalytics, logEvent, setAnalyticsCollectionEnabled } from "@react-native-firebase/analytics";

// Firebase is automatically initialized with Expo
// Configuration is handled through app.json and GoogleService files

let isInitialized = false;

export const initializeFirebase = async () => {
  try {
    // Check if Firebase is already initialized
    if (getApps().length === 0) {
      // Firebase will be automatically initialized by React Native Firebase
      // when the app starts with the config files
    }
    
    const app = getApp();
    const analytics = getAnalytics(app);

    // Enable analytics
    await setAnalyticsCollectionEnabled(analytics, true);
    isInitialized = true;
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
};

export const logAnalyticsEvent = async (eventName: string, parameters?: any) => {
  try {
    // Check if Firebase is initialized
    if (!isInitialized) {
      console.warn("Firebase not initialized yet, skipping analytics event:", eventName);
      return;
    }
    
    const app = getApp();
    const analytics = getAnalytics(app);
    await logEvent(analytics, eventName, parameters);
  } catch (error) {
    console.error("Analytics event logging error:", error);
  }
};

export const testFirebaseFeatures = async (): Promise<boolean> => {
  try {
    if (!isInitialized) {
      console.warn("Firebase not initialized yet, cannot test features");
      return false;
    }
    
    const app = getApp();
    const analytics = getAnalytics(app);

    // Test analytics
    await logEvent(analytics, "test_event", { test: true });
    console.log("Firebase test event logged successfully");

    return true;
  } catch (error) {
    console.error("Firebase features test failed:", error);
    return false;
  }
};
