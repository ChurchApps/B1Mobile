// Firebase configuration for Expo
// This file initializes Firebase for the app using Expo Firebase SDK

import * as Analytics from 'expo-firebase-analytics';

// Firebase is automatically initialized with Expo
// Configuration is handled through app.json and GoogleService files

export const enableFirebaseAnalytics = async () => {
  try {
    await Analytics.setAnalyticsCollectionEnabled(true);
    console.log('Firebase Analytics collection enabled.');
  } catch (error) {
    console.log('Firebase Analytics collection enabling error:', error);
  }
};

export const logAnalyticsEvent = async (eventName: string, parameters?: any) => {
  try {
    await Analytics.logEvent(eventName, parameters);
    console.log('Analytics event (disabled):', eventName, parameters);
  } catch (error) {
    console.log('Analytics event logging error:', error);
  }
}; 