import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { initializeFirebase } from '../src/config/firebase';

export default function RootLayout() {
  useEffect(() => {
    // initializeFirebase();
    console.log('Firebase initialization disabled temporarily');
  }, []);

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
