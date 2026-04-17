import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Card } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { OptimizedImage } from "../OptimizedImage";
import { DateHelper, getPrimaryGradientColors } from "../../helpers";
import { PlaylistInterface } from "@churchapps/helpers";
import { useAppTheme, useThemeColors, CommonStyles } from "../../theme";

interface PlaylistCardProps {
  playlist: PlaylistInterface;
  onPress: (playlist: PlaylistInterface) => void;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onPress }) => {
  const colors = useThemeColors();
  const { theme } = useAppTheme();
  const hasImage = playlist.thumbnail && playlist.thumbnail.trim() !== "";
  const fallbackGradientColors = getPrimaryGradientColors(theme.colors.primary, "three-stop");

  return (
    <TouchableOpacity onPress={() => onPress(playlist)}>
      <Card style={[styles.playlistCard, { shadowColor: colors.shadowBlack }]}>
        <View style={styles.playlistContent}>
          <View style={CommonStyles.absoluteFill}>
            {hasImage ? (
              <OptimizedImage source={{ uri: playlist.thumbnail }} style={CommonStyles.fillImage} contentFit="cover" />
            ) : (
              <LinearGradient colors={fallbackGradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[CommonStyles.fillImage, styles.playlistFallback]}>
                <View style={[CommonStyles.absoluteFill, { opacity: 0.3 }]}>
                  <View style={styles.playlistCircle1} />
                  <View style={styles.playlistCircle2} />
                </View>
                <View style={styles.playlistIcon}>
                  <MaterialIcons name="playlist-play" size={32} color={colors.onPrimary} opacity={0.9} />
                </View>
              </LinearGradient>
            )}
          </View>
          <View style={[CommonStyles.absoluteBottom, CommonStyles.overlayDark, CommonStyles.rowBetween, { padding: 16 }]}>
            <View style={styles.playlistInfo}>
              <Text variant="titleMedium" style={[styles.playlistTitle, { color: colors.white }]} numberOfLines={2}>
                {playlist.title}
              </Text>
              {playlist.description && (
                <Text variant="bodySmall" style={[styles.playlistDescription, { color: colors.white }]} numberOfLines={2}>
                  {playlist.description}
                </Text>
              )}
              <Text variant="bodySmall" style={[styles.playlistDate, { color: colors.white }]}>
                {playlist.publishDate ? DateHelper.prettyDate(DateHelper.toDate(playlist.publishDate)) : ""}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.white} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  playlistCard: {
    marginBottom: 12,
    borderRadius: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    overflow: "hidden"
  },
  playlistContent: {
    position: "relative",
    aspectRatio: 16 / 9
  },
  playlistFallback: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden"
  },
  playlistCircle1: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    top: -20,
    right: -20
  },
  playlistCircle2: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.08)",
    bottom: -15,
    left: -15
  },
  playlistIcon: { zIndex: 2 },
  playlistInfo: {
    flex: 1,
    marginRight: 12
  },
  playlistTitle: {
    fontWeight: "600",
    marginBottom: 4,
    fontSize: 16
  },
  playlistDescription: {
    opacity: 0.9,
    marginBottom: 4,
    fontSize: 14
  },
  playlistDate: {
    opacity: 0.8,
    fontSize: 12
  }
});
