import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { useTranslation } from "react-i18next";

export type ProfileTabSection = "profile" | "household" | "account" | "visibility";

interface ProfileTabBarProps {
  activeSection: ProfileTabSection;
  onTabChange: (section: ProfileTabSection) => void;
  hasChanges?: boolean;
}

export const ProfileTabBar: React.FC<ProfileTabBarProps> = ({ activeSection, onTabChange, hasChanges }) => {
  const { t } = useTranslation();

  const tabs: { key: ProfileTabSection; label: string }[] = [
    { key: "profile", label: t("profileEdit.profile") },
    { key: "household", label: t("profileEdit.household") },
    { key: "account", label: t("profileEdit.account") },
    { key: "visibility", label: t("profileEdit.visibility") }
  ];

  return (
    <View style={styles.tabContainer}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeSection === tab.key && styles.activeTab]}
          onPress={() => onTabChange(tab.key)}>
          <View style={styles.tabContent}>
            <Text variant="labelLarge" style={[styles.tabText, activeSection === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
            {tab.key === "profile" && hasChanges && (
              <View style={styles.changeIndicator} />
            )}
          </View>
        </TouchableOpacity>
      ))}
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
  activeTab: { borderBottomColor: "#0D47A1" },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  tabText: {
    color: "#9E9E9E",
    fontWeight: "500"
  },
  activeTabText: {
    color: "#0D47A1",
    fontWeight: "700"
  },
  changeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFC107"
  }
});
