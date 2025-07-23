import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";

type TabSection = "overview" | "donate" | "manage" | "history";

interface DonationTabBarProps {
  activeSection: TabSection;
  onTabChange: (section: TabSection) => void;
}

export const DonationTabBar: React.FC<DonationTabBarProps> = ({ activeSection, onTabChange }) => {
  const tabs: { key: TabSection; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "donate", label: "Give" },
    { key: "manage", label: "Manage" },
    { key: "history", label: "History" }
  ];

  return (
    <View style={styles.tabContainer}>
      {tabs.map(tab => (
        <TouchableOpacity 
          key={tab.key}
          style={[styles.tab, activeSection === tab.key && styles.activeTab]} 
          onPress={() => onTabChange(tab.key)}>
          <Text variant="labelLarge" style={[styles.tabText, activeSection === tab.key && styles.activeTabText]}>
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