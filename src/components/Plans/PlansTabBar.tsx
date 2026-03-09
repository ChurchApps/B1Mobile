import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../../theme";

interface PlansTabBarProps {
  activeSection: "upcoming" | "past";
  onTabChange: (section: "upcoming" | "past") => void;
}

export const PlansTabBar: React.FC<PlansTabBarProps> = ({ activeSection, onTabChange }) => {
  const { t } = useTranslation();
  const tc = useThemeColors();

  return (
    <View style={[styles.tabContainer, { backgroundColor: tc.surface, borderBottomColor: tc.border }]}>
      <TouchableOpacity
        style={[styles.tab, activeSection === "upcoming" && { borderBottomColor: tc.primary }]}
        onPress={() => onTabChange("upcoming")}
      >
        <Text variant="labelLarge" style={[styles.tabText, { color: activeSection === "upcoming" ? tc.primary : tc.textSecondary }, activeSection === "upcoming" && styles.activeTabText]}>
          {t("plans.upcoming")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeSection === "past" && { borderBottomColor: tc.primary }]}
        onPress={() => onTabChange("past")}
      >
        <Text variant="labelLarge" style={[styles.tabText, { color: activeSection === "past" ? tc.primary : tc.textSecondary }, activeSection === "past" && styles.activeTabText]}>
          {t("plans.past")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    borderBottomWidth: 1
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent"
  },
  tabText: { fontWeight: "500" },
  activeTabText: { fontWeight: "700" }
});
