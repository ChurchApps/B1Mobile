import React from 'react';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeApp } from 'firebase/app';
import { initializeFirebase } from '../src/config/firebase';
import { PaperProvider } from 'react-native-paper';
import { useColorScheme } from 'react-native'; // Import useColorScheme
import { AppLightTheme, AppDarkTheme } from '../theme/AppThemes'; // Import custom themes

export default function RootLayout() {
  const colorScheme = useColorScheme(); // Get the current color scheme

  useEffect(() => {
    const setupFirebase = async () => {
      console.log('Initializing Firebase...');
      await initializeFirebase();
    };

    setupFirebase();
  }, []);

  const currentTheme = colorScheme === 'dark' ? AppDarkTheme : AppLightTheme; // Determine the theme

  return (
    <SafeAreaProvider>
      <PaperProvider theme={currentTheme}>
        <Stack screenOptions={{ headerShown: false }} initialRouteName='auth'>
          <Stack.Screen name="auth" />
          <Stack.Screen name="index" />
          <Stack.Screen name="(drawer)" />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
