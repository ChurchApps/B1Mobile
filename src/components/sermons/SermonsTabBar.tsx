import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";

interface SermonsTabBarProps {
  activeSection: "playlists" | "recent";
  onTabChange: (section: "playlists" | "recent") => void;
}

export const SermonsTabBar: React.FC<SermonsTabBarProps> = ({ activeSection, onTabChange }) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tab, activeSection === "playlists" && styles.activeTab]} 
        onPress={() => onTabChange("playlists")}>
        <Text variant="labelLarge" style={[styles.tabText, activeSection === "playlists" && styles.activeTabText]}>
          Series
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeSection === "recent" && styles.activeTab]} 
        onPress={() => onTabChange("recent")}>
        <Text variant="labelLarge" style={[styles.tabText, activeSection === "recent" && styles.activeTabText]}>
          Recent
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