import React from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { VolunteerSignupDetail } from "../../../src/components/volunteer/VolunteerSignupDetail";

const VolunteerSignupScreen = () => {
  const { planId } = useLocalSearchParams<{ planId: string }>();

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <VolunteerSignupDetail planId={planId!} />
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: "#F6F6F8" } });

export default VolunteerSignupScreen;
