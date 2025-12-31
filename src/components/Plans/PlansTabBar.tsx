import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { useTranslation } from "react-i18next";

interface PlansTabBarProps {
  activeSection: "upcoming" | "past";
  onTabChange: (section: "upcoming" | "past") => void;
}

export const PlansTabBar: React.FC<PlansTabBarProps> = ({ activeSection, onTabChange }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeSection === "upcoming" && styles.activeTab]}
        onPress={() => onTabChange("upcoming")}
      >
        <Text variant="labelLarge" style={[styles.tabText, activeSection === "upcoming" && styles.activeTabText]}>
          {t("plans.upcoming")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeSection === "past" && styles.activeTab]}
        onPress={() => onTabChange("past")}
      >
        <Text variant="labelLarge" style={[styles.tabText, activeSection === "past" && styles.activeTabText]}>
          {t("plans.past")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0"
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent"
  },
  activeTab: {
    borderBottomColor: "#0D47A1"
  },
  tabText: {
    color: "#9E9E9E",
    fontWeight: "500"
  },
  activeTabText: {
    color: "#0D47A1",
    fontWeight: "700"
  }
});
