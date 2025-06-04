import React from 'react';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeApp } from 'firebase/app';
import { initializeFirebase } from '../src/config/firebase';
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';
import { Colors } from '@/constants/Colors';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.tint,
    background: Colors.light.background,
    // surface: Colors.light.background,
    // text: Colors.light.text,
    // placeholder: Colors.light.icon,
  },
};

export default function RootLayout() {
  useEffect(() => {
    const setupFirebase = async () => {
      console.log('Initializing Firebase...');
      await initializeFirebase();
    };

    setupFirebase();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }} initialRouteName='auth'>
          <Stack.Screen name="auth" />
          <Stack.Screen name="index" />
          <Stack.Screen name="(drawer)" />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
