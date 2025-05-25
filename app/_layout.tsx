import { Stack } from 'expo-router';
import { useEffect } from 'react';
// import messaging from '@react-native-firebase/messaging';

// Initialize Firebase if modules are available
const initializeFirebase = async () => {
  try {
    // Only initialize if Firebase modules are properly linked
    const { default: app } = await import('@react-native-firebase/app');
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.log('Firebase not available or not properly configured:', error);
  }
};

export default function RootLayout() {
  useEffect(() => {
    initializeFirebase();
  }, []);

  // messaging().setBackgroundMessageHandler(async remoteMessage => {
  //   console.log('Message handled in the background!', remoteMessage);
  // });

  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName='auth'>
      <Stack.Screen name="auth" />
      <Stack.Screen name="index" />
      <Stack.Screen name="(drawer)" />
    </Stack>
  );
}
