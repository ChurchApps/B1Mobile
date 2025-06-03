// Firebase configuration for Expo
// This file initializes Firebase for the app using Expo Firebase SDK

import analytics from '@react-native-firebase/analytics';

// Firebase is automatically initialized with Expo
// Configuration is handled through app.json and GoogleService files

export const initializeFirebase = async () => {
  try {
    // Firebase is automatically initialized with Expo
    console.log('Firebase initialized with Expo SDK');

    // Enable analytics
    await analytics().setAnalyticsCollectionEnabled(true);
    console.log('Firebase Analytics enabled successfully');
  } catch (error) {
    console.log('Firebase initialization error:', error);
  }
};

export const logAnalyticsEvent = async (eventName: string, parameters?: any) => {
  try {
    await analytics().logEvent(eventName, parameters);
    console.log('Analytics event logged:', eventName, parameters);
  } catch (error) {
    console.log('Analytics event logging error:', error);
  }
};
