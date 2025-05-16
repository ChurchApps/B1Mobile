import { Stack } from 'expo-router';
export default function RootLayout() {

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