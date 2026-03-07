import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../../theme";

export const GettingStartedHelper: React.FC = () => {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <View style={styles.helperSection}>
      <View style={[styles.helperContent, { backgroundColor: colors.card }]}>
        <MaterialIcons name="info-outline" size={32} color={colors.iconColor} style={styles.helperIcon} />
        <Text variant="titleMedium" style={[styles.helperTitle, { color: colors.text }]}>
          {t("churchSearch.gettingStarted")}
        </Text>
        <Text variant="bodyMedium" style={[styles.helperText, { color: colors.textHint }]}>
          {t("churchSearch.gettingStartedHelp")}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  helperSection: { padding: 32 },
  helperContent: {
    alignItems: "center",
    padding: 24,
    borderRadius: 16,
    elevation: 1,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  helperIcon: { marginBottom: 16 },
  helperTitle: {
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center"
  },
  helperText: {
    textAlign: "center",
    lineHeight: 20
  }
});
