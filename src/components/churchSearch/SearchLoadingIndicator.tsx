import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { useThemeColors } from "../../theme";

export const SearchLoadingIndicator: React.FC = () => {
  const colors = useThemeColors();

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text variant="bodyMedium" style={[styles.loadingText, { color: colors.textHint }]}>
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
    marginTop: 16,
    textAlign: "center"
  }
});
