import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";

export const GettingStartedHelper: React.FC = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.helperSection}>
      <View style={styles.helperContent}>
        <MaterialIcons name="info-outline" size={32} color="#9E9E9E" style={styles.helperIcon} />
        <Text variant="titleMedium" style={styles.helperTitle}>
          {t("churchSearch.gettingStarted")}
        </Text>
        <Text variant="bodyMedium" style={styles.helperText}>
          {t("churchSearch.gettingStartedHelp")}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  helperSection: {
    padding: 32
  },
  helperContent: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  helperIcon: {
    marginBottom: 16
  },
  helperTitle: {
    color: "#3c3c3c",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center"
  },
  helperText: {
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 20
  }
});