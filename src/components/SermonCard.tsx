import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { OptimizedImage } from "./OptimizedImage";
import { DateHelper } from "../helpers";
import { SermonInterface } from "../mobilehelper";

interface SermonCardProps {
  sermon: SermonInterface;
  onPress: (sermon: SermonInterface) => void;
  showDuration?: boolean;
}

export const SermonCard: React.FC<SermonCardProps> = ({ sermon, onPress, showDuration = true }) => {
  const hasImage = sermon.thumbnail && sermon.thumbnail.trim() !== "";

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <TouchableOpacity onPress={() => onPress(sermon)}>
      <Card style={styles.sermonCard}>
        <View style={styles.sermonContent}>
          <View style={styles.sermonImageContainer}>
            {hasImage ? (
              <OptimizedImage source={{ uri: sermon.thumbnail }} style={styles.sermonImage} contentFit="cover" />
            ) : (
              <LinearGradient colors={["#0D47A1", "#1976D2", "#2196F3"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.sermonImage, styles.sermonFallback]}>
                <View style={styles.fallbackPattern}>
                  <View style={styles.patternCircle1} />
                  <View style={styles.patternCircle2} />
                  <View style={styles.patternCircle3} />
                </View>
                <View style={styles.fallbackIcon}>
                  <MaterialIcons name="play-circle-outline" size={32} color="#FFFFFF" opacity={0.9} />
                </View>
              </LinearGradient>
            )}

            {/* Play button overlay */}
            <View style={styles.playOverlay}>
              <MaterialIcons name="play-circle-filled" size={24} color="#FFFFFF" />
            </View>

            {/* Duration badge */}
            {showDuration && sermon.duration ? (
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{formatDuration(sermon.duration)}</Text>
              </View>
            ) : null}

            {/* Text overlay at bottom */}
            <View style={styles.textOverlay}>
              <View style={styles.sermonInfo}>
                <Text variant="titleMedium" style={styles.sermonTitle} numberOfLines={2}>
                  {sermon.title || "Untitled Sermon"}
                </Text>
                <Text variant="bodySmall" style={styles.sermonDate}>
                  {sermon.publishDate ? DateHelper.prettyDate(new Date(sermon.publishDate)) : ""}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  sermonCard: {
    marginBottom: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    overflow: "hidden"
  },
  sermonContent: {
    position: "relative"
  },
  sermonImageContainer: {
    position: "relative",
    aspectRatio: 16 / 9,
    width: "100%"
  },
  sermonImage: {
    width: "100%",
    height: "100%"
  },
  sermonFallback: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden"
  },
  fallbackPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3
  },
  patternCircle1: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.1)",
    top: -30,
    right: -30
  },
  patternCircle2: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.08)",
    bottom: -20,
    left: -20
  },
  patternCircle3: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.12)",
    top: "50%",
    left: "20%",
    marginTop: -30
  },
  fallbackIcon: {
    zIndex: 2
  },
  playOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 20,
    padding: 6
  },
  durationBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  durationText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600"
  },
  textOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 16
  },
  sermonInfo: {
    flex: 1
  },
  sermonTitle: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 4
  },
  sermonDate: {
    color: "#FFFFFF",
    opacity: 0.9
  }
});
