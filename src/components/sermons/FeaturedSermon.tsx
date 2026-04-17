import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Card } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { OptimizedImage } from "../OptimizedImage";
import { DateHelper, adjustHexColor, hexToRgba } from "../../helpers";
import { SermonInterface } from "@churchapps/helpers";
import { useAppTheme, useThemeColors, CommonStyles } from "../../theme";

interface FeaturedSermonProps {
  sermon: SermonInterface;
  onPress: (sermon: SermonInterface) => void;
}

export const FeaturedSermon: React.FC<FeaturedSermonProps> = ({ sermon, onPress }) => {
  const colors = useThemeColors();
  const { theme } = useAppTheme();
  const hasImage = sermon.thumbnail && sermon.thumbnail.trim() !== "";
  const fallbackGradientColors = [adjustHexColor(theme.colors.primary, -12), adjustHexColor(theme.colors.primary, 18), adjustHexColor(theme.colors.primary, 28)] as const;

  return (
    <TouchableOpacity onPress={() => onPress(sermon)}>
      <Card style={[styles.heroCard, { shadowColor: colors.shadowBlack }]}>
        <View style={styles.heroContainer}>
          {hasImage ? (
            <OptimizedImage source={{ uri: sermon.thumbnail }} style={styles.heroImage} contentFit="cover" />
          ) : (
            <LinearGradient colors={fallbackGradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[CommonStyles.absoluteFill, CommonStyles.fillImage, styles.heroFallback]}>
              <View style={[CommonStyles.absoluteFill, { opacity: 0.2 }]}>
                <View style={styles.heroCircle1} />
                <View style={styles.heroCircle2} />
                <View style={styles.heroCircle3} />
              </View>
              <View style={styles.heroIcon}>
                <MaterialIcons name="video-library" size={48} color={colors.onPrimary} opacity={0.9} />
              </View>
            </LinearGradient>
          )}
          <View style={[CommonStyles.absoluteFill, { backgroundColor: "rgba(0,0,0,0.5)", padding: 24, justifyContent: "space-between", flexDirection: "row", alignItems: "flex-end" }]}>
            <View style={styles.heroContent}>
              <Text variant="labelMedium" style={[styles.heroLabel, { color: colors.white }]}>
                Latest Sermon
              </Text>
              <Text variant="headlineSmall" style={[styles.heroTitle, { color: colors.white }]} numberOfLines={2}>
                {sermon.title || "Untitled Sermon"}
              </Text>
              <Text variant="bodyMedium" style={[styles.heroDate, { color: colors.white }]}>
                {sermon.publishDate ? DateHelper.prettyDate(DateHelper.toDate(sermon.publishDate)) : ""}
              </Text>
              {(sermon.duration && (
                <Text variant="bodySmall" style={[styles.heroDuration, { color: colors.white }]}>
                  {Math.floor(sermon.duration / 60)}:{(sermon.duration % 60).toString().padStart(2, "0")}
                </Text>
              )) ||
                null}
            </View>
            <View style={[CommonStyles.circularButtonLg, styles.playButton, { backgroundColor: hexToRgba(colors.primary, 0.9), shadowColor: colors.primary }]}>
              <MaterialIcons name="play-arrow" size={32} color={colors.onPrimary} />
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
  heroContent: {
    flex: 1,
    marginRight: 16
  },
  heroLabel: {
    opacity: 0.9,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  heroTitle: {
    fontWeight: "700",
    marginBottom: 8
  },
  heroDate: {
    opacity: 0.9,
    marginBottom: 4
  },
  heroDuration: { opacity: 0.8 },
  playButton: {
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  }
});
