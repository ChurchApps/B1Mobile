import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Card } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { OptimizedImage } from "../OptimizedImage";
import { DateHelper } from "../../helpers";
import { PlaylistInterface } from "../../mobilehelper";

interface PlaylistCardProps {
  playlist: PlaylistInterface;
  onPress: (playlist: PlaylistInterface) => void;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onPress }) => {
  const hasImage = playlist.thumbnail && playlist.thumbnail.trim() !== "";

  return (
    <TouchableOpacity onPress={() => onPress(playlist)}>
      <Card style={styles.playlistCard}>
        <View style={styles.playlistContent}>
          <View style={styles.playlistImageContainer}>
            {hasImage ? (
              <OptimizedImage source={{ uri: playlist.thumbnail }} style={styles.playlistImage} contentFit="cover" />
            ) : (
              <LinearGradient colors={["#0D47A1", "#1976D2", "#2196F3"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.playlistImage, styles.playlistFallback]}>
                <View style={styles.playlistPattern}>
                  <View style={styles.playlistCircle1} />
                  <View style={styles.playlistCircle2} />
                </View>
                <View style={styles.playlistIcon}>
                  <MaterialIcons name="playlist-play" size={32} color="#FFFFFF" opacity={0.9} />
                </View>
              </LinearGradient>
            )}
          </View>
          <View style={styles.playlistOverlay}>
            <View style={styles.playlistInfo}>
              <Text variant="titleMedium" style={styles.playlistTitle} numberOfLines={2}>
                {playlist.title}
              </Text>
              {playlist.description && (
                <Text variant="bodySmall" style={styles.playlistDescription} numberOfLines={2}>
                  {playlist.description}
                </Text>
              )}
              <Text variant="bodySmall" style={styles.playlistDate}>
                {playlist.publishDate ? DateHelper.prettyDate(new Date(playlist.publishDate)) : ""}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#FFFFFF" />
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    overflow: "hidden"
  },
  playlistContent: {
    position: "relative",
    aspectRatio: 16 / 9
  },
  playlistImageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  playlistImage: {
    width: "100%",
    height: "100%"
  },
  playlistFallback: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden"
  },
  playlistPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3
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
  playlistIcon: {
    zIndex: 2
  },
  playlistOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  playlistInfo: {
    flex: 1,
    marginRight: 12
  },
  playlistTitle: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 4,
    fontSize: 16
  },
  playlistDescription: {
    color: "#FFFFFF",
    opacity: 0.9,
    marginBottom: 4,
    fontSize: 14
  },
  playlistDate: {
    color: "#FFFFFF",
    opacity: 0.8,
    fontSize: 12
  }
});
