import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card, Chip } from "react-native-paper";
import { OptimizedImage } from "../OptimizedImage";

interface GroupHeroSectionProps {
  name: string;
  photoUrl?: string;
  memberCount: number;
  isLeader: boolean;
}

export const GroupHeroSection: React.FC<GroupHeroSectionProps> = ({
  name,
  photoUrl,
  memberCount,
  isLeader
}) => {
  return (
    <View style={styles.heroSection}>
      {photoUrl ? (
        <Card style={styles.heroCard}>
          <View style={styles.heroImageContainer}>
            <OptimizedImage source={{ uri: photoUrl }} style={styles.heroImage} contentFit="cover" priority="high" />
            <View style={styles.heroOverlay}>
              <Text variant="headlineLarge" style={styles.heroTitle}>
                {name}
              </Text>
              <View style={styles.heroStats}>
                <Chip icon="account-group" style={styles.statsChip}>
                  {memberCount} members
                </Chip>
                {isLeader && (
                  <Chip icon="crown" style={[styles.statsChip, styles.leaderChip]}>
                    Leader
                  </Chip>
                )}
              </View>
            </View>
          </View>
        </Card>
      ) : (
        <Card style={styles.heroCard}>
          <View style={[styles.heroImageContainer, styles.noImageHero]}>
            <View style={styles.heroOverlay}>
              <Text variant="headlineLarge" style={styles.heroTitle}>
                {name}
              </Text>
              <View style={styles.heroStats}>
                <Chip icon="account-group" style={styles.statsChip}>
                  {memberCount} members
                </Chip>
                {isLeader && (
                  <Chip icon="crown" style={[styles.statsChip, styles.leaderChip]}>
                    Leader
                  </Chip>
                )}
              </View>
            </View>
          </View>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 16
  },
  heroCard: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  heroImageContainer: {
    height: 220,
    position: "relative"
  },
  noImageHero: {
    backgroundColor: "#0D47A1",
    justifyContent: "center"
  },
  heroImage: {
    width: "100%",
    height: "100%"
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  heroTitle: {
    color: "#FFFFFF",
    fontWeight: "800",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  heroStats: {
    flexDirection: "row",
    gap: 8
  },
  statsChip: {
    backgroundColor: "rgba(255, 255, 255, 0.9)"
  },
  leaderChip: {
    backgroundColor: "rgba(255, 193, 7, 0.9)"
  }
});