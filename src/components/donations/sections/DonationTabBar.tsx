import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../../../theme";

type TabSection = "overview" | "donate" | "manage" | "history";

interface DonationTabBarProps {
  activeSection: TabSection;
  onTabChange: (section: TabSection) => void;
}

export const DonationTabBar: React.FC<DonationTabBarProps> = ({ activeSection, onTabChange }) => {
  const { t } = useTranslation();
  const colors = useThemeColors();

  const tabs: { key: TabSection; label: string }[] = [
    { key: "overview", label: t("donations.overview") },
    { key: "donate", label: t("donations.donate") },
    { key: "manage", label: t("donations.manage") },
    { key: "history", label: t("donations.history") }
  ];

  return (
    <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeSection === tab.key && { borderBottomColor: colors.primary }]}
          onPress={() => onTabChange(tab.key)}>
          <Text
            variant="labelLarge"
            style={[
              styles.tabText,
              { color: colors.textSecondary },
              activeSection === tab.key && { color: colors.primary, fontWeight: "700" }
            ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
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
  tabText: { fontWeight: "500" }
});
