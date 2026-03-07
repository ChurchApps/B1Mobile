import React, { useRef, useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent, Dimensions } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColors } from "../../theme";

interface TabItem {
  key: string;
  label: string;
  icon: string;
  onPress?: () => void;
  leaderOnly?: boolean;
}

interface GroupNavigationTabsProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
  tabs: TabItem[];
  tabWidth?: number;
  isLeader?: boolean;
}

export const GroupNavigationTabs: React.FC<GroupNavigationTabsProps> = ({
  activeTab,
  onTabChange,
  tabs,
  tabWidth = 64,
  isLeader = false
}) => {
  const tc = useThemeColors();
  const scrollRef = useRef<ScrollView>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(false);

  // Filter tabs based on leader status
  const visibleTabs = tabs.filter(tab => !tab.leaderOnly || isLeader);

  useEffect(() => {
    const screenWidth = Dimensions.get("window").width - 32; // Account for margins
    setShowRightGradient(visibleTabs.length * tabWidth > screenWidth);
  }, [visibleTabs.length, tabWidth]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    setShowLeftGradient(contentOffset.x > 5);
    setShowRightGradient(contentOffset.x + layoutMeasurement.width < contentSize.width - 5);
  };

  const scrollToActiveTab = (index: number) => {
    const screenWidth = Dimensions.get("window").width;
    const scrollOffset = index * tabWidth - screenWidth / 2 + tabWidth / 2;
    scrollRef.current?.scrollTo({ x: Math.max(scrollOffset, 0), animated: true });
  };

  // Find the actual index in the original tabs array for a visible tab
  const getOriginalIndex = (visibleIndex: number): number => {
    const visibleTab = visibleTabs[visibleIndex];
    return tabs.findIndex(t => t.key === visibleTab.key);
  };

  // Find the visible index for the current active tab
  const getVisibleActiveIndex = (): number => {
    const activeTabKey = tabs[activeTab]?.key;
    return visibleTabs.findIndex(t => t.key === activeTabKey);
  };

  const visibleActiveIndex = getVisibleActiveIndex();

  return (
    <View style={styles.container}>
      <View style={[styles.tabBar, { backgroundColor: tc.surface, shadowColor: tc.shadowBlack }]}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContainer}
        >
          {visibleTabs.map((tab, index) => {
            const isActive = index === visibleActiveIndex;
            const originalIndex = getOriginalIndex(index);

            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, { width: tabWidth }]}
                onPress={() => {
                  if (tab.onPress) {
                    tab.onPress();
                  } else {
                    onTabChange(originalIndex);
                    scrollToActiveTab(index);
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: tc.iconBackground }, isActive && { backgroundColor: tc.primary, shadowColor: tc.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }]}>
                  <MaterialCommunityIcons
                    name={tab.icon as any}
                    size={22}
                    color={isActive ? tc.white : tc.textSecondary}
                  />
                </View>
                <Text
                  style={[styles.label, { color: tc.textSecondary }, isActive && { color: tc.primary, fontWeight: "700" }]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
                {isActive && <View style={[styles.activeIndicator, { backgroundColor: tc.primary }]} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Gradient fade indicators */}
        {showLeftGradient && (
          <View style={[styles.gradientOverlay, styles.leftGradient, { backgroundColor: tc.isDark ? "rgba(30,30,30,0.9)" : "rgba(255,255,255,0.9)" }]} pointerEvents="none" />
        )}
        {showRightGradient && (
          <View style={[styles.gradientOverlay, styles.rightGradient, { backgroundColor: tc.isDark ? "rgba(30,30,30,0.9)" : "rgba(255,255,255,0.9)" }]} pointerEvents="none" />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    marginHorizontal: 16
  },
  tabBar: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
    overflow: "hidden"
  },
  scrollContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    position: "relative"
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: -0.2
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    width: 20,
    height: 3,
    borderRadius: 1.5
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 32,
    zIndex: 10
  },
  leftGradient: {
    left: 0,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16
  },
  rightGradient: {
    right: 0,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16
  }
});
