import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../../theme";

export type ProfileTabSection = "profile" | "household" | "account" | "visibility";

interface ProfileTabBarProps {
  activeSection: ProfileTabSection;
  onTabChange: (section: ProfileTabSection) => void;
  hasChanges?: boolean;
}

export const ProfileTabBar: React.FC<ProfileTabBarProps> = ({ activeSection, onTabChange, hasChanges }) => {
  const { t } = useTranslation();
  const tc = useThemeColors();

  const tabs: { key: ProfileTabSection; label: string }[] = [
    { key: "profile", label: t("profileEdit.profile") },
    { key: "household", label: t("profileEdit.household") },
    { key: "account", label: t("profileEdit.account") },
    { key: "visibility", label: t("profileEdit.visibility") }
  ];

  return (
    <View style={[styles.tabContainer, { backgroundColor: tc.surface, borderBottomColor: tc.border }]}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeSection === tab.key && { borderBottomColor: tc.primary }]}
          onPress={() => onTabChange(tab.key)}>
          <View style={styles.tabContent}>
            <Text
              variant="labelLarge"
              style={[
                styles.tabText,
                { color: tc.textSecondary },
                activeSection === tab.key && { color: tc.primary, fontWeight: "700" }
              ]}>
              {tab.label}
            </Text>
            {tab.key === "profile" && hasChanges && (
              <View style={[styles.changeIndicator, { backgroundColor: tc.warning }]} />
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
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  tabText: { fontWeight: "500" },
  changeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4
  }
});
