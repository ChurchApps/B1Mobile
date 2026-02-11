import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";

export const SearchLoadingIndicator: React.FC = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#0D47A1" />
      <Text variant="bodyMedium" style={styles.loadingText}>
        Searching churches...
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 32,
    alignItems: "center"
  },
  loadingText: {
    color: "#9E9E9E",
    marginTop: 16,
    textAlign: "center"
  }
});
