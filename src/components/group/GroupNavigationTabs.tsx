import React, { useRef, useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent, Dimensions } from "react-native";
import { Text, Card, Avatar } from "react-native-paper";

interface TabItem {
  key: string;
  label: string;
  icon: string;
  onPress?: () => void;
}

interface GroupNavigationTabsProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
  tabs: TabItem[];
  tabWidth?: number;
}

export const GroupNavigationTabs: React.FC<GroupNavigationTabsProps> = ({ activeTab, onTabChange, tabs, tabWidth = 80 }) => {
  const scrollRef = useRef<ScrollView>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  useEffect(() => {
    // check if content is overflowed
    setShowRightArrow(tabs.length * tabWidth > Dimensions.get("window").width);
  }, [tabs.length, tabWidth]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    setShowLeftArrow(contentOffset.x > 5);
    setShowRightArrow(contentOffset.x + layoutMeasurement.width < contentSize.width - 5);
  };

  const scrollBy = (direction: "left" | "right") => {
    scrollRef.current?.scrollTo({
      x: direction === "left" ? Math.max((scrollRef.current as any)?.contentOffsetX - tabWidth * 2, 0) : ((scrollRef.current as any)?.contentOffsetX || 0) + tabWidth * 2,
      animated: true
    });
  };

  const scrollToActiveTab = (index: number) => {
    const screenWidth = Dimensions.get("window").width;
    const scrollOffset = index * tabWidth - screenWidth / 2 + tabWidth / 2;
    scrollRef.current?.scrollTo({ x: Math.max(scrollOffset, 0), animated: true });
  };

  return (
    <View style={styles.container}>
      <Card style={styles.navigationCard}>
        <Card.Content style={styles.cardContent}>
          <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={16} contentContainerStyle={styles.scrollContainer}>
            {tabs.map((tab, index) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.navButton, activeTab === index && styles.activeNavButton, { width: tabWidth }]}
                onPress={() => {
                  if (tab.onPress) tab.onPress();
                  else {
                    onTabChange(index);
                    scrollToActiveTab(index);
                  }
                }}>
                <View style={styles.navButtonIcon}>
                  <Avatar.Icon size={40} icon={tab.icon} style={[styles.navButtonAvatar, activeTab === index && styles.activeNavButtonAvatar]} />
                </View>
                <Text style={[styles.navButtonText, activeTab === index && styles.activeNavButtonText]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>

      {/* Absolute Left Arrow */}
      {showLeftArrow && (
        <TouchableOpacity style={[styles.arrowButton, styles.leftArrow]} onPress={() => scrollBy("left")}>
          <Text style={styles.arrowText}>{"<"}</Text>
        </TouchableOpacity>
      )}

      {/* Absolute Right Arrow */}
      {showRightArrow && (
        <TouchableOpacity style={[styles.arrowButton, styles.rightArrow]} onPress={() => scrollBy("right")}>
          <Text style={styles.arrowText}>{">"}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  navigationCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    elevation: 3
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative"
  },
  scrollContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  navButton: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    backgroundColor: "#F6F6F8",
    marginHorizontal: 4
  },
  activeNavButton: {
    backgroundColor: "#E3F2FD",
    borderWidth: 2,
    borderColor: "#0D47A1"
  },
  navButtonIcon: {
    marginBottom: 4
  },
  navButtonAvatar: {
    backgroundColor: "#9E9E9E"
  },
  activeNavButtonAvatar: {
    backgroundColor: "#0D47A1"
  },
  navButtonText: {
    color: "#9E9E9E",
    textAlign: "center",
    fontWeight: "500",
    fontSize: 11,
    lineHeight: 12
  },
  activeNavButtonText: {
    color: "#0D47A1",
    fontWeight: "700",
    fontSize: 11,
    lineHeight: 12
  },
  arrowButton: {
    width: 50,
    height: "100%",
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)", // optional overlay
    borderRadius: 25
  },
  leftArrow: {
    left: 0,
    top: 0,
    bottom: 0,
    marginLeft: 8
  },
  rightArrow: {
    right: 0,
    top: 0,
    bottom: 0,
    marginRight: 8
  },
  arrowText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0D47A1"
  }
});
