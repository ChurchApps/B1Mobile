import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { useThemeColors } from "../../theme";

interface SermonsTabBarProps {
  activeSection: "playlists" | "recent";
  onTabChange: (section: "playlists" | "recent") => void;
}

export const SermonsTabBar: React.FC<SermonsTabBarProps> = ({ activeSection, onTabChange }) => {
  const tc = useThemeColors();
  return (
    <View style={[styles.tabContainer, { backgroundColor: tc.surface, borderBottomColor: tc.border }]}>
      <TouchableOpacity
        style={[styles.tab, activeSection === "playlists" && { borderBottomColor: tc.primary }]}
        onPress={() => onTabChange("playlists")}>
        <Text variant="labelLarge" style={[styles.tabText, { color: activeSection === "playlists" ? tc.primary : tc.textSecondary }, activeSection === "playlists" && styles.activeTabText]}>
          Series
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeSection === "recent" && { borderBottomColor: tc.primary }]}
        onPress={() => onTabChange("recent")}>
        <Text variant="labelLarge" style={[styles.tabText, { color: activeSection === "recent" ? tc.primary : tc.textSecondary }, activeSection === "recent" && styles.activeTabText]}>
          Recent
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
  activeTab: {},
  tabText: { fontWeight: "500" },
  activeTabText: { fontWeight: "700" }
});
