import React from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { EventRegistrationScreen } from "../src/components/registration/EventRegistrationScreen";
import { useThemeColors } from "../src/theme";

export default function RegisterEventRoot() {
  const { eventId, churchId } = useLocalSearchParams<{ eventId: string; churchId: string }>();
  const router = useRouter();
  const tc = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: tc.background }]}>
      <EventRegistrationScreen eventId={eventId} churchId={churchId} onDone={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: "#F6F6F8" } });
