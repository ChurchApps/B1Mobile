import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Card } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { OptimizedImage } from "../OptimizedImage";
import { DateHelper } from "../../helpers";
import { SermonInterface } from "@churchapps/helpers";

interface FeaturedSermonProps {
  sermon: SermonInterface;
  onPress: (sermon: SermonInterface) => void;
}

export const FeaturedSermon: React.FC<FeaturedSermonProps> = ({ sermon, onPress }) => {
  const hasImage = sermon.thumbnail && sermon.thumbnail.trim() !== "";

  return (
    <TouchableOpacity onPress={() => onPress(sermon)}>
      <Card style={styles.heroCard}>
        <View style={styles.heroContainer}>
          {hasImage ? (
            <OptimizedImage source={{ uri: sermon.thumbnail }} style={styles.heroImage} contentFit="cover" />
          ) : (
            <LinearGradient colors={["#0D47A1", "#1976D2", "#2196F3"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.heroImage, styles.heroFallback]}>
              <View style={styles.heroPattern}>
                <View style={styles.heroCircle1} />
                <View style={styles.heroCircle2} />
                <View style={styles.heroCircle3} />
              </View>
              <View style={styles.heroIcon}>
                <MaterialIcons name="video-library" size={48} color="#FFFFFF" opacity={0.9} />
              </View>
            </LinearGradient>
          )}
          <View style={styles.heroOverlay}>
            <View style={styles.heroContent}>
              <Text variant="labelMedium" style={styles.heroLabel}>
                Latest Sermon
              </Text>
              <Text variant="headlineSmall" style={styles.heroTitle} numberOfLines={2}>
                {sermon.title || "Untitled Sermon"}
              </Text>
              <Text variant="bodyMedium" style={styles.heroDate}>
                {sermon.publishDate ? DateHelper.prettyDate(DateHelper.toDate(sermon.publishDate)) : ""}
              </Text>
              {(sermon.duration && (
                <Text variant="bodySmall" style={styles.heroDuration}>
                  {Math.floor(sermon.duration / 60)}:{(sermon.duration % 60).toString().padStart(2, "0")}
                </Text>
              )) ||
                null}
            </View>
            <View style={styles.playButton}>
              <MaterialIcons name="play-arrow" size={32} color="#FFFFFF" />
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  heroContainer: {
    position: "relative",
    aspectRatio: 16 / 9
  },
  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%"
  },
  heroFallback: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden"
  },
  heroPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2
  },
  heroCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.1)",
    top: -50,
    right: -50
  },
  heroCircle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.08)",
    bottom: -40,
    left: -40
  },
  heroCircle3: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.12)",
    top: "30%",
    left: "25%"
  },
  heroIcon: { zIndex: 2 },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 24,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "flex-end"
  },
  heroContent: {
    flex: 1,
    marginRight: 16
  },
  heroLabel: {
    color: "#FFFFFF",
    opacity: 0.9,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  heroTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginBottom: 8
  },
  heroDate: {
    color: "#FFFFFF",
    opacity: 0.9,
    marginBottom: 4
  },
  heroDuration: {
    color: "#FFFFFF",
    opacity: 0.8
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(21, 101, 192, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  }
});
