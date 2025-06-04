import React from 'react';
import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';

function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Surface style={styles.container}>
        <Text variant="headlineMedium">This screen doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text variant="bodyMedium" style={{ color: '#0a7ea4', textDecorationLine: 'underline' }}>Go to home screen!</Text>
        </Link>
      </Surface>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
export default NotFoundScreen
