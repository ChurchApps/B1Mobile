import React from "react";
import { StyleSheet } from "react-native";
import { Text, Card } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useThemeColors } from "../../theme";

interface EmptyStateProps {
  type: "playlists" | "sermons";
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type }) => {
  const colors = useThemeColors();
  const isPlaylists = type === "playlists";

  return (
    <Card style={[styles.emptyCard, { shadowColor: colors.shadowBlack }]}>
      <Card.Content style={styles.emptyContent}>
        <MaterialIcons
          name={isPlaylists ? "playlist-add" : "video-library"}
          size={48}
          color={colors.iconColor}
          style={styles.emptyIcon}
        />
        <Text variant="titleMedium" style={[styles.emptyTitle, { color: colors.text }]}>
          {isPlaylists ? "No Sermon Series Available" : "No Recent Sermons"}
        </Text>
        <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: colors.disabled }]}>
          {isPlaylists
            ? "Check back later for new sermon series from your church."
            : "Check back later for new sermons from your church."}
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  emptyCard: {
    borderRadius: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  emptyContent: {
    alignItems: "center",
    padding: 32
  },
  emptyIcon: { marginBottom: 16 },
  emptyTitle: {
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8
  },
  emptySubtitle: {
    textAlign: "center",
    lineHeight: 20
  }
});
