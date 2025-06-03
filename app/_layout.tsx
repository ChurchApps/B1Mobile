import React from 'react';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeApp } from 'firebase/app';
import { enableFirebaseAnalytics } from '../src/config/firebase';

export default function RootLayout() {
  useEffect(() => {

    console.log('Initializing Firebase...');
    initializeFirebase();
    enableFirebaseAnalytics();
    //console.log('Firebase initialization disabled temporarily');

  }, []);

  const initializeFirebase = () => {

    const firebaseConfig = {
      apiKey: "AIzaSyBP-v-oGjbwxiWZ2MH_cgcZXTQxxJfkDbA",
      projectId: "b1mobile",
      messagingSenderId: "873379055173",
      appId: "1:873379055173:android:8dce00e5e50b588be1452c"
    };

    initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} initialRouteName='auth'>
        <Stack.Screen name="auth" />
        <Stack.Screen name="index" />
        <Stack.Screen name="(drawer)" />
      </Stack>
    </SafeAreaProvider>
  );
}
