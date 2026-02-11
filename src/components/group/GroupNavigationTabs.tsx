import React, { useRef, useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent, Dimensions } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
      <View style={styles.tabBar}>
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
                <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                  <MaterialCommunityIcons
                    name={tab.icon as any}
                    size={22}
                    color={isActive ? "#FFFFFF" : "#6B7280"}
                  />
                </View>
                <Text
                  style={[styles.label, isActive && styles.activeLabel]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Gradient fade indicators */}
        {showLeftGradient && (
          <View style={[styles.gradientOverlay, styles.leftGradient]} pointerEvents="none" />
        )}
        {showRightGradient && (
          <View style={[styles.gradientOverlay, styles.rightGradient]} pointerEvents="none" />
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: "#000",
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
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6
  },
  activeIconContainer: {
    backgroundColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    letterSpacing: -0.2
  },
  activeLabel: {
    color: "#2563EB",
    fontWeight: "700"
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    width: 20,
    height: 3,
    backgroundColor: "#2563EB",
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
    backgroundColor: "rgba(255,255,255,0.9)",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16
  },
  rightGradient: {
    right: 0,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16
  }
});
