import React from "react";
import { View, StyleSheet } from "react-native";
import { Card } from "react-native-paper";

export const GroupDetailsSkeleton: React.FC = () => {
  return (
    <View>
      {/* Skeleton Hero Section */}
      <View style={styles.heroSection}>
        <Card style={styles.heroCard}>
          <View style={[styles.heroImageContainer, styles.skeletonHero]}>
            <View style={styles.heroOverlay}>
              <View style={[styles.skeletonText, { width: "60%", height: 28, marginBottom: 12 }]} />
              <View style={styles.heroStats}>
                <View style={[styles.skeletonText, { width: 80, height: 20 }]} />
              </View>
            </View>
          </View>
        </Card>
      </View>

      {/* Skeleton Navigation */}
      <Card style={styles.navigationCard}>
        <Card.Content>
          <View style={styles.navigationGrid}>
            {[1, 2, 3, 4].map(i => (
              <View key={i} style={styles.navButton}>
                <View style={[styles.skeletonCircle, { width: 40, height: 40, marginBottom: 4 }]} />
                <View style={[styles.skeletonText, { width: 50, height: 12 }]} />
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  heroSection: {
    marginBottom: 16
  },
  heroCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3
  },
  heroImageContainer: {
    height: 200,
    position: "relative"
  },
  skeletonHero: {
    backgroundColor: "#E9ECEF"
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.3)"
  },
  heroStats: {
    flexDirection: "row",
    alignItems: "center"
  },
  navigationCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2
  },
  navigationGrid: {
    flexDirection: "row",
    justifyContent: "space-around"
  },
  navButton: {
    alignItems: "center",
    padding: 8
  },
  skeletonText: {
    backgroundColor: "#E9ECEF",
    borderRadius: 4
  },
  skeletonCircle: {
    backgroundColor: "#E9ECEF",
    borderRadius: 50
  }
});