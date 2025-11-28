import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Card } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { OptimizedImage } from "../OptimizedImage";
import { SermonInterface } from "@churchapps/helpers";

interface VideoPreviewProps {
  sermon: SermonInterface;
  onPlay: () => void;
  visible: boolean;
  formatDuration: (seconds?: number) => string;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ sermon, onPlay, visible, formatDuration }) => {
  if (!visible) return null;

  return (
    <Card style={styles.previewCard}>
      <TouchableOpacity style={styles.previewContainer} onPress={onPlay}>
        <OptimizedImage 
          source={{ uri: sermon.thumbnail || "" }} 
          style={styles.previewImage} 
          contentFit="cover" 
        />
        <View style={styles.previewOverlay}>
          <View style={styles.playButton}>
            <MaterialIcons name="play-arrow" size={48} color="#FFFFFF" />
          </View>
          {sermon.duration && (
            <View style={styles.durationBadge}>
              <Text variant="bodyMedium" style={styles.durationText}>
                {formatDuration(sermon.duration)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  previewCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6
  },
  previewContainer: {
    position: "relative",
    aspectRatio: 16 / 9
  },
  previewImage: {
    width: "100%",
    height: "100%"
  },
  previewOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center"
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(21, 101, 192, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#0D47A1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  },
  durationBadge: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  durationText: {
    color: "#FFFFFF",
    fontWeight: "600"
  }
});