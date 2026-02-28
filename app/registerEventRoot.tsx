import React from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { EventRegistrationScreen } from "../src/components/registration/EventRegistrationScreen";

export default function RegisterEventRoot() {
  const { eventId, churchId } = useLocalSearchParams<{ eventId: string; churchId: string }>();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <EventRegistrationScreen eventId={eventId} churchId={churchId} onDone={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F6F8" }
});
