import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { OptimizedImage } from "./OptimizedImage";
import { DateHelper, adjustHexColor } from "../helpers";
import { SermonInterface } from "@churchapps/helpers";
import { useAppTheme, useThemeColors, CommonStyles } from "../theme";

interface SermonCardProps {
  sermon: SermonInterface;
  onPress: (sermon: SermonInterface) => void;
  showDuration?: boolean;
}

export const SermonCard: React.FC<SermonCardProps> = ({ sermon, onPress, showDuration = true }) => {
  const colors = useThemeColors();
  const { theme } = useAppTheme();
  const hasImage = sermon.thumbnail && sermon.thumbnail.trim() !== "";
  const fallbackGradientColors = [adjustHexColor(theme.colors.primary, -12), adjustHexColor(theme.colors.primary, 18), adjustHexColor(theme.colors.primary, 28)] as const;

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <TouchableOpacity onPress={() => onPress(sermon)}>
      <Card style={[styles.sermonCard, { shadowColor: colors.shadowBlack }]}>
        <View style={styles.sermonContent}>
          <View style={styles.sermonImageContainer}>
            {hasImage ? (
              <OptimizedImage source={{ uri: sermon.thumbnail }} style={CommonStyles.fillImage} contentFit="cover" />
            ) : (
              <LinearGradient colors={fallbackGradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[CommonStyles.fillImage, styles.sermonFallback]}>
                <View style={[CommonStyles.absoluteFill, { opacity: 0.3 }]}>
                  <View style={styles.patternCircle1} />
                  <View style={styles.patternCircle2} />
                  <View style={styles.patternCircle3} />
                </View>
                <View style={styles.fallbackIcon}>
                  <MaterialIcons name="play-circle-outline" size={32} color={colors.white} opacity={0.9} />
                </View>
              </LinearGradient>
            )}

            {/* Play button overlay */}
            <View style={styles.playOverlay}>
              <MaterialIcons name="play-circle-filled" size={24} color={colors.white} />
            </View>

            {/* Duration badge */}
            {showDuration && sermon.duration ? (
              <View style={styles.durationBadge}>
                <Text style={[styles.durationText, { color: colors.white }]}>{formatDuration(sermon.duration)}</Text>
              </View>
            ) : null}

            {/* Text overlay at bottom */}
            <View style={[CommonStyles.absoluteBottom, CommonStyles.overlayDark, { padding: 16 }]}>
              <View style={styles.sermonInfo}>
                <Text variant="titleMedium" style={[styles.sermonTitle, { color: colors.white }]} numberOfLines={2}>
                  {sermon.title || "Untitled Sermon"}
                </Text>
                <Text variant="bodySmall" style={[styles.sermonDate, { color: colors.white }]}>
                  {sermon.publishDate ? DateHelper.prettyDate(DateHelper.toDate(sermon.publishDate)) : ""}
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    overflow: "hidden"
  },
  sermonContent: { position: "relative" },
  sermonImageContainer: {
    position: "relative",
    aspectRatio: 16 / 9,
    width: "100%"
  },
  sermonFallback: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden"
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
  fallbackIcon: { zIndex: 2 },
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
    fontSize: 12,
    fontWeight: "600"
  },
  sermonInfo: { flex: 1 },
  sermonTitle: {
    fontWeight: "600",
    marginBottom: 4
  },
  sermonDate: { opacity: 0.9 }
});
