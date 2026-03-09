import React from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { VolunteerSignupDetail } from "../../../src/components/volunteer/VolunteerSignupDetail";
import { useThemeColors } from "../../../src/theme";

const VolunteerSignupScreen = () => {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const tc = useThemeColors();

  return (
    <SafeAreaProvider>
      <View style={[styles.container, { backgroundColor: tc.background }]}>
        <VolunteerSignupDetail planId={planId!} />
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: "#F6F6F8" } });

export default VolunteerSignupScreen;
